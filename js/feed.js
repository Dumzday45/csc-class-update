import{getPosts}from"./db.js";
import{$,postCard,fail}from"./ui.js";

let posts=[],cat="all";

function draw(){
  const l=cat==="all"?posts:posts.filter(p=>p.category===cat);
  $("feed").innerHTML=l.map(postCard).join("");
  $("empty").classList.toggle("hidden",l.length>0);
}

document.querySelector(".filters").addEventListener("click",e=>{
  const b=e.target.closest(".chip");
  if(!b)return;
  document.querySelectorAll(".filters .chip").forEach(c=>c.classList.toggle("active",c===b));
  cat=b.dataset.cat;
  draw();
});

try{posts=await getPosts();draw()}catch{fail()}