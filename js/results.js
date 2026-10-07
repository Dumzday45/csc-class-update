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

const PDFJS="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
let pdfReady;

const loadPdfJs=()=>pdfReady||(pdfReady=new Promise((ok,no)=>{
  const s=document.createElement("script");
  s.src=PDFJS+"pdf.min.js";
  s.onload=()=>{pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS+"pdf.worker.min.js";ok()};
  s.onerror=no;
  document.head.appendChild(s);
}));

async function showPdf(blob){
  await loadPdfJs();
  const pdf=await pdfjsLib.getDocument({data:new Uint8Array(await blob.arrayBuffer())}).promise;
  const box=$("viewerBody");
  box.innerHTML='<div class="pages"></div>';
  const wrap=box.firstChild,dpr=Math.min(window.devicePixelRatio||1,2);
  for(let n=1;n<=pdf.numPages;n++){
    if($("viewer").classList.contains("hidden"))return;
    const p=await pdf.getPage(n),sc=wrap.clientWidth/p.getViewport({scale:1}).width,vp=p.getViewport({scale:sc*dpr});
    const c=document.createElement("canvas");
    c.width=vp.width;c.height=vp.height;
    wrap.appendChild(c);
    await p.render({canvasContext:c.getContext("2d"),viewport:vp}).promise;
  }
}

async function open(r){
  $("viewerTitle").textContent=r.title;
  $("viewerBody").innerHTML='<p class="state">Loading file…</p>';
  $("viewerDownload").classList.add("hidden");
  $("viewer").classList.remove("hidden");
  $("viewerClose").focus();
  document.body.style.overflow="hidden";
  try{
    const d=await getResultFile(r);
    if(!d)throw 0;
    const blob=toBlob(d),pdf=r.type==="pdf";
    blobUrl=URL.createObjectURL(blob);
    const a=$("viewerDownload");
    a.href=blobUrl;
    a.download=r.title+(pdf?".pdf":".jpg");
    a.classList.remove("hidden");
    const frame=`<iframe src="${blobUrl}" title="${esc(r.title)}"></iframe>`;
    if(!pdf)$("viewerBody").innerHTML=`<img src="${blobUrl}" alt="${esc(r.title)}">`;
    else if(navigator.pdfViewerEnabled)$("viewerBody").innerHTML=frame;
    else try{await showPdf(blob)}catch{$("viewerBody").innerHTML=frame}
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