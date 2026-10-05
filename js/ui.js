export const $=id=>document.getElementById(id);

export const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

const loc="en-GB";
export const fmtDate=t=>t?.toDate?t.toDate().toLocaleDateString(loc,{day:"numeric",month:"short",year:"numeric"}):"";
export const fmtDay=s=>{const[y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d).toLocaleDateString(loc,{weekday:"short",day:"numeric",month:"short",year:"numeric"})};
export const fmtTime=s=>{const[h,m]=s.split(":").map(Number);return new Date(2000,0,1,h,m).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})};
export const today=()=>new Date().toLocaleDateString("sv-SE");

export const fileLinks=u=>{
  const m=u.match(/drive\.google\.com\/file\/d\/([^/?#]+)/)||u.match(/drive\.google\.com\/open\?id=([^&#]+)/);
  return m?{view:`https://drive.google.com/file/d/${m[1]}/preview`,dl:`https://drive.google.com/uc?export=download&id=${m[1]}`}:{view:u,dl:u};
};

export const fail=()=>{$("loading")?.remove();$("error").classList.remove("hidden")};

export const postCard=p=>`<a class="card${p.pinned?" pinned":""}" href="announcement.html?id=${encodeURIComponent(p.id)}">
<div class="meta"><span class="tag" data-cat="${esc(p.category)}">${esc(p.category)}</span>${p.updatedAt?'<span class="tag tag-new">Updated</span>':""}${p.pinned?'<span class="tag">Pinned</span>':""}</div>
<h2 class="card-title">${esc(p.title)}</h2>
<p class="card-excerpt">${esc(p.details)}</p>
<div class="card-foot">${p.eventDate?`<span>${fmtDay(p.eventDate)}${p.eventTime?" at "+fmtTime(p.eventTime):""}</span>`:""}${p.venue?`<span>${esc(p.venue)}</span>`:""}<span>Posted ${fmtDate(p.createdAt)}</span></div>
</a>`;