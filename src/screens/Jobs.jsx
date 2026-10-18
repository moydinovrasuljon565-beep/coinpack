import { useState, useEffect } from "react";
import { Fld, Top } from "../components/ui.jsx";
import { api } from "../lib/api.js";
import { SC, digits } from "../lib/utils.js";

export function Jobs({user}){
  const [z,setZ]=useState("Onlayn"),[ap,setAp]=useState(null),[f,setF]=useState({phone:user.phone||"",msg:""}),[jobs,setJobs]=useState([]),[mine,setMine]=useState([]),[busy,setBusy]=useState(false);
  const L=[["Onlayn","Onlayn"],["UZ","Oʻzbekistonda"],["Xorij","Chet elda"]];
  const load=()=>{api("GET","/jobs").then(setJobs).catch(()=>{});api("GET","/applications/mine").then(setMine).catch(()=>{})};
  useEffect(()=>{load()},[]);
  const has=j=>mine.find(a=>a.job===j.t&&a.company===j.c);
  const submit=async()=>{
    if(busy)return;
    if(!f.msg.trim()||digits(f.phone).length<9)return alert("Telefon raqam va oʻzingiz haqingizda qisqacha (tajriba) yozing.");
    setBusy(true);
    try{await api("POST","/applications",{job:ap.t,company:ap.c,sal:ap.sal,phone:f.phone,msg:f.msg.trim()});setAp(null);setF({...f,msg:""});load()}
    catch(e){alert(e.message)}
    setBusy(false);
  };
  if(ap)return <div className="scr"><Top t="Ariza qoldirish" back={()=>setAp(null)}/><div className="wrap">
    <div className="card soft"><span style={{fontSize:30}}>💼</span><div><b>{ap.t}</b><div className="mut">{ap.c} · {ap.sal}</div></div></div>
    <div className="fld"><small>Ism</small>{user.name}</div>
    <Fld l="Telefon raqam" type="tel" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/>
    <label className="fld"><small>Oʻzingiz haqingizda (tajriba, koʻnikma)</small><textarea rows="4" style={{width:"100%",border:0,outline:0,background:"none",color:"var(--tx)",fontSize:16,fontFamily:"inherit",resize:"none"}} value={f.msg} onChange={e=>setF({...f,msg:e.target.value})}/></label>
    <button className="full" onClick={submit}>{busy?"Yuborilmoqda...":"Arizani yuborish"}</button></div></div>;
  return <div className="scr"><Top t="Koʻproq pul beradigan ishlar"/><div className="wrap">
    <div className="seg">{L.map(([k,l])=><button key={k} className={z===k?"on":""} onClick={()=>setZ(k)}>{l}</button>)}</div>
    {jobs.filter(j=>j.z===z).map(j=>{const a=has(j);return <div className="card" key={j.id}><b>{j.t}</b><div className="mut">{j.c}</div><div style={{color:"var(--ok)",fontWeight:700,margin:"4px 0"}}>{j.sal}</div>{(j.tags||[]).map(t=><span className="tag" key={t}>{t}</span>)}
      <div style={{marginTop:10}}>{a?<span className="badge" style={{background:SC[a.status][0]}}>{SC[a.status][1]}</span>:<button className="sm" onClick={()=>setAp(j)}>Ariza qoldirish</button>}</div></div>})}
    {mine.length>0&&<div className="card"><h3>Mening arizalarim</h3>{mine.map(a=><div className="item row" key={a.id}><div><b>{a.job}</b><div className="mut">{a.company} · {a.date}</div></div><span className="badge" style={{background:SC[a.status][0]}}>{SC[a.status][1]}</span></div>)}</div>}
  </div></div>;
}
