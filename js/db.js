import{collection,doc,getDoc,getDocs,addDoc,updateDoc,deleteDoc,writeBatch,query,orderBy,limit,serverTimestamp}from"https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import{db}from"./firebase-config.js";

const P=collection(db,"announcements");
const R=collection(db,"results");
const F=collection(db,"resultFiles");
const rows=s=>s.docs.map(d=>({id:d.id,...d.data()}));

export const getPosts=async()=>rows(await getDocs(query(P,orderBy("createdAt","desc"),limit(200)))).sort((a,b)=>!!b.pinned-!!a.pinned);
export const getPost=async id=>{const s=await getDoc(doc(P,id));return s.exists()?{id:s.id,...s.data()}:null};
export const addPost=d=>addDoc(P,{...d,createdAt:serverTimestamp(),updatedAt:null});
export const editPost=(id,d)=>updateDoc(doc(P,id),{...d,updatedAt:serverTimestamp()});
export const delPost=id=>deleteDoc(doc(P,id));

export const getResults=async()=>rows(await getDocs(query(R,orderBy("createdAt","desc"),limit(200))));
export const getResultFile=async id=>{const s=await getDoc(doc(F,id));return s.exists()?s.data().data:null};
export const addResult=(d,data)=>{
  const r=doc(R),b=writeBatch(db);
  b.set(r,{...d,createdAt:serverTimestamp()});
  b.set(doc(F,r.id),{data,createdAt:serverTimestamp()});
  return b.commit();
};
export const delResult=id=>{
  const b=writeBatch(db);
  b.delete(doc(R,id));
  b.delete(doc(F,id));
  return b.commit();
};