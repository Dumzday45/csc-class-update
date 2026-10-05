import{getPost}from"./db.js";
import{$,fmtDate,fmtDay,fmtTime,fail}from"./ui.js";

const id=new URLSearchParams(location.search).get("id");

try{
  const p=id&&await getPost(id);
  if(!p)throw 0;
  document.title=p.title+" · Class Updates";
  $("postCat").textContent=p.category;
  $("postCat").dataset.cat=p.category;
  $("postUpdated").classList.toggle("hidden",!p.updatedAt);
  $("postPosted").textContent="Posted "+fmtDate(p.createdAt);
  $("postTitle").textContent=p.title;
  if(p.eventDate){
    $("postDate").textContent=fmtDay(p.eventDate)+(p.eventTime?" at "+fmtTime(p.eventTime):"");
    $("rowDate").classList.remove("hidden");
  }
  if(p.venue){
    $("postVenue").textContent=p.venue;
    $("rowVenue").classList.remove("hidden");
  }
  $("postBody").textContent=p.details;
  $("loading").classList.add("hidden");
  $("post").classList.remove("hidden");
}catch{fail()}

$("shareWa").onclick=()=>window.open("https://wa.me/?text="+encodeURIComponent($("postTitle").textContent+"\n"+location.href),"_blank","noopener");

$("copyLink").onclick=async()=>{
  try{await navigator.clipboard.writeText(location.href);$("copyLink").textContent="Link copied"}
  catch{prompt("Copy this link:",location.href)}
};