import{getPosts}from"./db.js";
import{$,postCard,today,fail}from"./ui.js";

const key=p=>p.eventDate+(p.eventTime||"");

try{
  const t=today();
  const l=(await getPosts()).filter(p=>p.eventDate>=t).sort((a,b)=>key(a).localeCompare(key(b)));
  $("upcoming").innerHTML=l.map(postCard).join("");
  $("empty").classList.toggle("hidden",l.length>0);
}catch{fail()}