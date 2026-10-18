import { useState, useEffect } from "react";
import { Fld } from "../components/ui.jsx";
import { api } from "../lib/api.js";
import { SC, fmt } from "../lib/utils.js";

export function Admin({user,token,out}){
  const [tab,setTab]=useState("u"),[users,setUsers]=useState([]),[places,setPlaces]=useState([]),[jobs,setJobs]=useState([]),[apps,setApps]=useState([]),[err,setErr]=useState("");
  const [np,setNp]=useState({n:"",k:"Restoran",p:"",r:"4.5"}),[nj,setNj]=useState({t:"",c:"",sal:"",z:"Onlayn",tags:""}),[note,setNote]=useState("");
  const A=(m,u,b)=>api(m,"/admin"+u,b,token);
  const load=()=>Promise.all([A("GET","/users"),A("GET","/applications"),api("GET","/places"),api("GET","/jobs"),api("GET","/notice")])
    .then(([u,a,p,j,n])=>{setUsers(u);setApps(a);setPlaces(p);setJobs(j);setNote(n.text||"");setErr("")}).catch(e=>setErr(e.message));
  useEffect(()=>{load()},[]);
  const act=async fn=>{try{await fn();await load()}catch(e){alert(e.message)}};
  const all=users.filter(u=>u.role!=="admin"),ts=all.reduce((a,u)=>a+u.stats.sum,0),pend=apps.filter(a=>a.status==="kutilmoqda").length;
  return <div className="scr" style={{paddingBottom:20}}><div className="hhero" style={{paddingBottom:24}}><div className="row"><div><b style={{fontSize:20}}>Admin panel</b><div style={{opacity:.85}}>{user.name}</div></div><button className="sec sm" onClick={out}>Chiqish</button></div>
    <div className="row" style={{marginTop:14}}><div><div className="big">{all.length}</div>foydalanuvchi</div><div style={{textAlign:"right"}}><div className="big" style={{fontSize:20}}>{fmt(ts)}</div>jami xarajat</div></div></div>
    <div className="wrap">{err&&<div className="msg e" style={{marginBottom:10}}>{err}</div>}
    <div className="seg">{[["u","👥"],["p","🍽️"],["j","💼"],["a","📥"+(pend?" "+pend:"")],["n","📢"]].map(([k,i])=><button key={k} className={tab===k?"on":""} onClick={()=>setTab(k)}>{i}</button>)}</div>
    {tab==="u"&&users.map(u=><div className="card" key={u.id}>
      <div className="row"><div><b>{u.name}</b><div className="mut">{u.phone||u.login} {u.email}</div></div><span className="badge" style={{background:u.role==="admin"?"var(--warn)":u.blocked?"var(--bad)":"var(--ok)"}}>{u.role==="admin"?"admin":u.blocked?"blok":"faol"}</span></div>
      <div className="mut" style={{margin:"6px 0"}}>{u.stats.n} yozuv · {fmt(u.stats.sum)} · {u.stats.card?"💳 karta":"karta yoʻq"} · {u.stats.goals} maqsad</div>
      {u.id!=="admin"&&u.id!==user.id&&<div className="row" style={{flexWrap:"wrap",justifyContent:"flex-start"}}>
        <button className="sm sec" onClick={()=>act(()=>A("PATCH","/users/"+u.id,{blocked:!u.blocked}))}>{u.blocked?"Blokdan chiqarish":"Bloklash"}</button>
        <button className="sm sec" onClick={()=>act(()=>A("PATCH","/users/"+u.id,{role:u.role==="admin"?"user":"admin"}))}>{u.role==="admin"?"Adminlikni olish":"Admin qilish"}</button>
        <button className="sm bad" onClick={()=>{if(confirm(u.name+" oʻchirilsinmi?"))act(()=>A("DELETE","/users/"+u.id))}}>Oʻchirish</button></div>}</div>)}
    {tab==="p"&&<><div className="card"><h3>Yangi joy</h3><Fld l="Nomi" value={np.n} onChange={e=>setNp({...np,n:e.target.value})}/>
      <label className="fld"><small>Turi</small><select value={np.k} onChange={e=>setNp({...np,k:e.target.value})}><option>Restoran</option><option>Kafe</option><option>Fast food</option></select></label>
      <Fld l="Oʻrtacha chek (soʻm)" type="number" value={np.p} onChange={e=>setNp({...np,p:e.target.value})}/><Fld l="Reyting" type="number" value={np.r} onChange={e=>setNp({...np,r:e.target.value})}/>
      <button className="full" onClick={()=>{if(np.n&&+np.p>0)act(async()=>{await A("POST","/places",{n:np.n,k:np.k,p:+np.p,r:+np.r});setNp({n:"",k:"Restoran",p:"",r:"4.5"})})}}>Qoʻshish</button></div>
      {places.map(p=><div className="card row" key={p.id}><div><b>{p.n}</b><div className="mut">{p.k} · {fmt(p.p)} · ⭐{p.r}</div></div><button className="sm bad" onClick={()=>act(()=>A("DELETE","/places/"+p.id))}>✕</button></div>)}</>}
    {tab==="j"&&<><div className="card"><h3>Yangi ish</h3><Fld l="Lavozim" value={nj.t} onChange={e=>setNj({...nj,t:e.target.value})}/><Fld l="Kompaniya / joy" value={nj.c} onChange={e=>setNj({...nj,c:e.target.value})}/>
      <Fld l="Maosh (masalan $500 – $900/oy)" value={nj.sal} onChange={e=>setNj({...nj,sal:e.target.value})}/>
      <label className="fld"><small>Turi</small><select value={nj.z} onChange={e=>setNj({...nj,z:e.target.value})}><option value="Onlayn">Onlayn</option><option value="UZ">Oʻzbekistonda</option><option value="Xorij">Chet elda</option></select></label>
      <Fld l="Teglar (vergul bilan)" value={nj.tags} onChange={e=>setNj({...nj,tags:e.target.value})}/>
      <button className="full" onClick={()=>{if(nj.t&&nj.sal)act(async()=>{await A("POST","/jobs",{t:nj.t,c:nj.c,sal:nj.sal,z:nj.z,tags:nj.tags.split(",").map(x=>x.trim()).filter(Boolean)});setNj({t:"",c:"",sal:"",z:"Onlayn",tags:""})})}}>Qoʻshish</button></div>
      {jobs.map(j=><div className="card row" key={j.id}><div><b>{j.t}</b><div className="mut">{j.c} · {j.sal} · {j.z}</div></div><button className="sm bad" onClick={()=>act(()=>A("DELETE","/jobs/"+j.id))}>✕</button></div>)}</>}
    {tab==="a"&&(apps.length===0?<p className="mut">Hali ariza yoʻq.</p>:apps.map(a=><div className="card" key={a.id}>
      <div className="row"><b>{a.job}</b><span className="badge" style={{background:SC[a.status][0]}}>{SC[a.status][1]}</span></div>
      <div className="mut">{a.company} · {a.sal}</div>
      <div style={{margin:"6px 0"}}>👤 <b>{a.name}</b> · {a.phone}</div>
      <div className="mut" style={{marginBottom:8}}>“{a.msg}” · {a.date}</div>
      {a.status==="kutilmoqda"?<div className="row" style={{justifyContent:"flex-start"}}><button className="sm" style={{background:"var(--ok)"}} onClick={()=>act(()=>A("PATCH","/applications/"+a.id,{status:"qabul"}))}>✅ Qabul qilish</button><button className="sm bad" onClick={()=>act(()=>A("PATCH","/applications/"+a.id,{status:"rad"}))}>❌ Rad etish</button></div>:<button className="sm sec" onClick={()=>act(()=>A("PATCH","/applications/"+a.id,{status:"kutilmoqda"}))}>Qaytarish</button>}</div>))}
    {tab==="n"&&<div className="card"><h3>Hammaga eʼlon</h3><Fld l="Matn (boʻsh qoldirsangiz oʻchadi)" value={note} onChange={e=>setNote(e.target.value)}/><button className="full" onClick={()=>act(async()=>{await A("PUT","/notice",{text:note});alert("Saqlandi")})}>Eʼlon qilish</button></div>}
  </div></div>;
}
