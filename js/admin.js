import{signInWithEmailAndPassword,signOut,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import{auth}from"./firebase-config.js";
import{getPosts,addPost,editPost,delPost,getResults,addResult,delResult}from"./db.js";
import{$,esc,fmtDate,fmtDay}from"./ui.js";

const show=(id,on)=>$(id).classList.toggle("hidden",!on);
const say=(id,t,err)=>{const e=$(id);e.textContent=t;e.classList.toggle("error",!!err);e.classList.toggle("hidden",!t)};
const msg=e=>e?.code==="permission-denied"?"You don't have permission to do that.":"Something went wrong. Check your connection and try again.";

onAuthStateChanged(auth,u=>{
  show("loading",false);
  show("loginView",!u);
  show("dashView",!!u);
  if(u){loadPosts();loadResults()}
});

$("loginForm").addEventListener("submit",async e=>{
  e.preventDefault();
  say("loginError","");
  try{await signInWithEmailAndPassword(auth,$("email").value.trim(),$("password").value)}
  catch{say("loginError","Wrong email or password.",1)}
});

$("logout").onclick=()=>signOut(auth);

document.querySelector(".tabs").addEventListener("click",e=>{
  const b=e.target.closest(".chip");
  if(!b)return;
  document.querySelectorAll(".tabs .chip").forEach(c=>{
    const on=c===b;
    c.classList.toggle("active",on);
    c.setAttribute("aria-selected",on);
  });
  show("tab-posts",b.dataset.tab==="posts");
  show("tab-results",b.dataset.tab==="results");
});

let posts=[];
const F=["title","category","details","eventDate","eventTime","venue"];

async function loadPosts(){
  try{posts=await getPosts()}catch(e){say("postMsg",msg(e),1);return}
  $("postList").innerHTML=posts.map(p=>`<li>
<div class="info"><strong>${esc(p.title)}</strong><span>${esc(p.category)} · ${fmtDate(p.createdAt)}</span></div>
<div class="ctrl"><button class="btn btn-ghost btn-sm" data-edit="${esc(p.id)}">Edit</button><button class="btn btn-danger btn-sm" data-del="${esc(p.id)}">Delete</button></div>
</li>`).join("");
  show("postListEmpty",!posts.length);
}

function resetPost(){
  $("postForm").reset();
  $("postId").value="";
  $("postFormTitle").textContent="New announcement";
  $("postSubmit").textContent="Post announcement";
  show("postCancel",false);
}

$("postForm").addEventListener("submit",async e=>{
  e.preventDefault();
  say("postMsg","");
  const d={
    title:$("title").value.trim(),
    category:$("category").value,
    details:$("details").value.trim(),
    eventDate:$("eventDate").value,
    eventTime:$("eventTime").value,
    venue:$("venue").value.trim(),
    pinned:$("pinned").checked
  };
  if(!d.title||!d.details)return say("postMsg","Add a title and details.",1);
  const id=$("postId").value,b=$("postSubmit");
  b.disabled=true;
  try{
    id?await editPost(id,d):await addPost(d);
    resetPost();
    say("postMsg",id?"Changes saved.":"Announcement posted.");
    await loadPosts();
  }catch(x){say("postMsg",msg(x),1)}
  b.disabled=false;
});

$("postList").addEventListener("click",async e=>{
  const ed=e.target.dataset.edit,rm=e.target.dataset.del;
  if(ed){
    const p=posts.find(x=>x.id===ed);
    if(!p)return;
    F.forEach(k=>$(k).value=p[k]??"");
    $("pinned").checked=!!p.pinned;
    $("postId").value=ed;
    $("postFormTitle").textContent="Edit announcement";
    $("postSubmit").textContent="Save changes";
    show("postCancel",true);
    $("postForm").scrollIntoView({behavior:"smooth"});
  }
  if(rm&&confirm("Delete this announcement? This cannot be undone.")){
    try{await delPost(rm);await loadPosts()}
    catch(x){say("postMsg",msg(x),1)}
  }
});

$("postCancel").onclick=resetPost;

let results=[];

async function loadResults(){
  try{results=await getResults()}catch(e){say("resultMsg",msg(e),1);return}
  $("resultList").innerHTML=results.map(r=>`<li>
<div class="info"><strong>${esc(r.title)}</strong><span>${esc(r.course)} · ${fmtDay(r.date)}</span></div>
<div class="ctrl"><button class="btn btn-danger btn-sm" data-del="${esc(r.id)}">Delete</button></div>
</li>`).join("");
  show("resultListEmpty",!results.length);
}

const IMG=930000,PDF=7000000;

const toData=f=>new Promise((ok,no)=>{
  const r=new FileReader();
  r.onload=()=>ok(r.result);
  r.onerror=no;
  r.readAsDataURL(f);
});

async function shrink(f){
  const img=await createImageBitmap(f);
  let w=Math.min(1800,img.width),q=.82,d;
  for(;;){
    const h=Math.round(img.height*w/img.width),c=document.createElement("canvas");
    c.width=w;c.height=h;
    const x=c.getContext("2d");
    x.fillStyle="#fff";x.fillRect(0,0,w,h);
    x.drawImage(img,0,0,w,h);
    d=c.toDataURL("image/jpeg",q);
    if(d.length<=IMG||w<500)return d;
    w=Math.round(w*.8);q=Math.max(.6,q-.05);
  }
}

$("resultForm").addEventListener("submit",async e=>{
  e.preventDefault();
  say("resultMsg","");
  const d={
    title:$("rTitle").value.trim(),
    course:$("rCourse").value.trim().toUpperCase(),
    date:$("rDate").value
  };
  const f=$("rFile").files[0];
  if(!d.title||!d.course||!d.date)return say("resultMsg","Fill in the title, course code and date.",1);
  if(!f)return say("resultMsg","Choose the result file first.",1);
  const pdf=f.type==="application/pdf";
  if(!pdf&&!f.type.startsWith("image/"))return say("resultMsg","Choose a PDF or an image.",1);
  d.type=pdf?"pdf":"image";
  const b=e.submitter;
  b.disabled=true;
  say("resultMsg","Uploading…");
  try{
    const data=pdf?await toData(f):await shrink(f);
    if(data.length>(pdf?PDF:IMG)){
      say("resultMsg",pdf?"That PDF is over 5 MB. Compress it first, or send a photo of the result instead.":"That image is too big. Try a smaller photo or a screenshot.",1);
    }else{
      await addResult(d,data);
      $("resultForm").reset();
      say("resultMsg","Results added.");
      await loadResults();
    }
  }catch(x){say("resultMsg",msg(x),1)}
  b.disabled=false;
});

$("resultList").addEventListener("click",async e=>{
  const rm=e.target.dataset.del;
  if(rm&&confirm("Delete these results? This cannot be undone.")){
    try{await delResult(rm,results.find(x=>x.id===rm)?.parts);await loadResults()}
    catch(x){say("resultMsg",msg(x),1)}
  }
});