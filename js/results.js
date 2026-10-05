import{getResults,getResultFile}from"./db.js";
import{$,esc,fmtDay,fail}from"./ui.js";

let all=[],list=[],blobUrl="";

const toBlob=d=>{
  const[h,b]=d.split(","),a=atob(b),u=new Uint8Array(a.length);
  for(let i=0;i<a.length;i++)u[i]=a.charCodeAt(i);
  return new Blob([u],{type:h.match(/:(.*?);/)[1]});
};

function draw(){
  const q=$("q").value.trim().toLowerCase();
  list=all.filter(r=>(r.course+" "+r.title).toLowerCase().includes(q));
  $("results").innerHTML=list.map((r,i)=>`<a class="card" href="#" data-i="${i}">
<div class="meta"><span class="tag">${esc(r.course)}</span><time>${fmtDay(r.date)}</time></div>
<h2 class="card-title">${esc(r.title)}</h2>
<p class="card-file">Open ${r.type==="pdf"?"PDF":"image"}</p>
</a>`).join("");
  $("empty").classList.toggle("hidden",list.length>0);
}

async function open(r){
  $("viewerTitle").textContent=r.title;
  $("viewerBody").innerHTML='<p class="state">Loading file…</p>';
  $("viewerDownload").classList.add("hidden");
  $("viewer").classList.remove("hidden");
  $("viewerClose").focus();
  document.body.style.overflow="hidden";
  try{
    const d=await getResultFile(r.id);
    if(!d)throw 0;
    blobUrl=URL.createObjectURL(toBlob(d));
    const pdf=r.type==="pdf";
    $("viewerBody").innerHTML=pdf
      ?`<iframe src="${blobUrl}" title="${esc(r.title)}"></iframe>`
      :`<img src="${blobUrl}" alt="${esc(r.title)}">`;
    const a=$("viewerDownload");
    a.href=blobUrl;
    a.download=r.title+(pdf?".pdf":".jpg");
    a.classList.remove("hidden");
  }catch{
    $("viewerBody").innerHTML='<p class="state error">Could not load this file. Check your connection and try again.</p>';
  }
}

function close(){
  $("viewer").classList.add("hidden");
  $("viewerBody").innerHTML="";
  if(blobUrl)URL.revokeObjectURL(blobUrl);
  blobUrl="";
  document.body.style.overflow="";
}

$("results").addEventListener("click",e=>{
  const a=e.target.closest(".card");
  if(!a)return;
  e.preventDefault();
  const r=list[a.dataset.i];
  if(r)open(r);
});

$("viewerClose").onclick=close;
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("viewer").classList.contains("hidden"))close()});
$("q").addEventListener("input",draw);

try{all=await getResults();draw()}catch{fail()}