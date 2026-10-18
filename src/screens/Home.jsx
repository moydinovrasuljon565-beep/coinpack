import { useState, useEffect } from "react";
import { VoiceAdd } from "../components/VoiceAdd.jsx";
import { Fld } from "../components/ui.jsx";
import { api } from "../lib/api.js";
import { digits, fmt, today } from "../lib/utils.js";

export function Home({d,setD,go,user,now,onAdmin}){
  const [mod,setMod]=useState(null),[mf,setMf]=useState({a:"",b:"",e:""});const closeM=()=>{setMod(null);setMf({a:"",b:"",e:""})};
  const linkC=()=>{const c=digits(mf.a);if(c.length!==16)return setMf({...mf,e:"16 xonali karta raqamini kiriting."});setD({...d,card:{mask:c.slice(0,4)+" "+c.slice(4,6)+"** **** "+c.slice(12),brand:c.startsWith("8600")?"Uzcard":c.startsWith("9860")?"Humo":"Karta",bal:0}});closeM()};
  const demoC=()=>{setD({...d,card:{mask:"9860 12** **** 5678",brand:"Humo",bal:5000000}});closeM()};
  const topup=()=>{const a=+mf.a;if(!(a>0))return setMf({...mf,e:"Summani kiriting."});setD({...d,card:{...d.card,bal:d.card.bal+a}});closeM()};
  const adm=async()=>{try{const r=await api("POST","/admin/login",{id:mf.a,pass:mf.b});closeM();onAdmin({user:r.user,token:r.token})}catch(e){setMf(m=>({...m,e:e.message}))}};
  const quick=g=>{if(g.saved>=g.target)return;if(!d.card)return setMod("card");if(d.card.bal<g.daily)return setMod("topup");setD({...d,card:{...d.card,bal:d.card.bal-g.daily},goals:d.goals.map(x=>x.id===g.id?{...x,saved:x.saved+g.daily,lastDeposit:today()}:x)})};
  const total=(d.card?d.card.bal:0)+d.goals.reduce((a,g)=>a+g.saved,0);const [eye,setEye]=useState(true);
  const due=d.goals.filter(g=>{if(g.saved>=g.target||g.lastDeposit===today())return false;const [h,m]=g.time.split(":").map(Number);const t=new Date();t.setHours(h,m,0,0);return now>=t.getTime()&&g.penaltyDate!==today()});
  const [notice,setNotice]=useState(""),[mine,setMine]=useState([]);
  const loadMine=()=>api("GET","/applications/mine").then(setMine).catch(()=>{});
  useEffect(()=>{api("GET","/notice").then(r=>setNotice(r.text||"")).catch(()=>{});loadMine()},[now]);
  const dec=mine.filter(a=>a.status!=="kutilmoqda"&&a.seen===false);
  const okA=a=>{setMine(m=>m.map(x=>x.id===a.id?{...x,seen:true}:x));api("POST","/applications/"+a.id+"/seen").catch(()=>{})};
  return <div className="scr"><div className="hhero"><div className="row"><b style={{fontSize:18}}>📈 StartApp</b><span><button className="sm" style={{background:"#ffffff30",marginRight:8}} onClick={()=>setMod("admin")}>🛡 Admin</button><span style={{fontSize:22}}>🔔</span></span></div>
    <h1>Salom, {user.name.split(" ")[0]}!</h1><p>Bugun ham oʻz maqsading sari bir qadam yaqinroqsan!</p></div>
    <div className="wrap pull">
    <div className="card"><div className="row"><span className="mut">Jami mablagʻ</span><span onClick={()=>setEye(!eye)}>{eye?"👁":"🙈"}</span></div>
      <div className="big">{eye?fmt(total):"•••••••"}</div><div className="mut">Karta balansi + jamgʻarma</div></div>
    {d.card?<div className="card" style={{background:"linear-gradient(135deg,#1e3a8a,#4c3fd0)",color:"#fff",border:0}}>
      <div className="row"><span>💳 {d.card.brand}</span><span style={{opacity:.8}}>Plastik karta</span></div>
      <div style={{fontSize:20,letterSpacing:2,margin:"16px 0 6px"}}>{d.card.mask}</div>
      <div className="row"><div><div style={{opacity:.75,fontSize:12}}>Balans</div><b style={{fontSize:20}}>{fmt(d.card.bal)}</b></div><button className="sm" style={{background:"#ffffff30"}} onClick={()=>setMod("topup")}>＋ Toʻldirish</button></div></div>
    :<button className="card full" style={{background:"var(--soft)",color:"var(--pri)",border:"2px dashed var(--pri)"}} onClick={()=>setMod("card")}>💳 ＋ Plastik karta qoʻshish</button>}
    <div className="row"><h3 style={{margin:0}}>🎯 Maqsadlarim</h3><a href="#" onClick={e=>{e.preventDefault();go.push("newgoal")}}>＋ Yangi maqsad</a></div><div style={{height:8}}/>
    {d.goals.length===0&&<div className="card"><span className="mut">Hali maqsad yoʻq. “Yangi maqsad” ni bosing.</span></div>}
    {d.goals.map(g=>{const pct=Math.min(100,g.saved/g.target*100);return <div className="card" key={g.id}>
      <div className="row"><b>{g.icon} {g.name}</b><span className="mut">{Math.round(pct)}%</span></div><div className="bar"><i style={{width:pct+"%"}}/></div>
      <div className="row"><span className="mut">{fmt(g.saved)} / {fmt(g.target)}</span>{g.saved>=g.target?<span>🎉</span>:<button className="sm" onClick={()=>quick(g)}>{g.lastDeposit===today()?"✅ yana +":"+ "}{fmt(g.daily)}</button>}</div></div>})}
    <div className="grid4">{[["📊","Tahlil",()=>go.tab("exp")],["🍽️","Oziq-ovqat",()=>go.push("places")],["💼","Ishlar",()=>go.tab("jobs")],["🐷","Jamgʻarma",()=>go.tab("save")]].map(([i,l,f])=><button className="tile" key={l} onClick={f}><span>{i}</span>{l}</button>)}</div>
    {dec.map(a=><div className="notice" key={a.id} style={{background:a.status==="qabul"?"#dcfce7":"#fee2e2",color:a.status==="qabul"?"#14532d":"#7f1d1d"}}>{a.status==="qabul"?"🎉 Tabriklaymiz! Siz “"+a.job+"” ishiga qabul qilindingiz.":"Afsus, “"+a.job+"” uchun arizangiz rad etildi."} <a href="#" onClick={e=>{e.preventDefault();okA(a)}}>OK</a></div>)}
    {notice&&<div className="notice">📢 {notice}</div>}
    {due.map(g=><div className="notice" key={g.id}>⏰ <b>{g.name}</b>: bugun {fmt(g.daily)} qoʻyish vaqti! Kech qolsangiz jarima yechiladi.</div>)}
    <h3>Tezkor amallar</h3>
    <div className="grid2">{[["📉","Xarajat tahlili",()=>go.tab("exp")],["⏱️","Jamgʻarma qoʻshish",()=>go.push("deposit")],["🎯","Yangi maqsad",()=>go.push("newgoal")],["🔎","Ish topish",()=>go.tab("jobs")]].map(([i,l,f])=><button className="tile2" key={l} onClick={f}><span>{i}</span>{l}</button>)}</div>
    <VoiceAdd d={d} setD={setD}/></div>
    {mod&&<div className="modal" onClick={closeM}><div className="card" style={{width:"86%",margin:0}} onClick={e=>e.stopPropagation()}>
      {mod==="admin"&&<><h3>🛡 Admin kirishi</h3><Fld l="Admin login" autoCapitalize="none" value={mf.a} onChange={e=>setMf({...mf,a:e.target.value,e:""})}/><Fld l="Parol" type="password" value={mf.b} onChange={e=>setMf({...mf,b:e.target.value,e:""})}/>{mf.e&&<div className="msg e" style={{marginBottom:10}}>{mf.e}</div>}<button className="full" onClick={adm}>Kirish</button></>}
      {mod==="card"&&<><h3>💳 Plastik karta qoʻshish</h3><Fld l="Karta raqami (Uzcard / Humo)" inputMode="numeric" placeholder="9860 0000 0000 0000" value={mf.a} onChange={e=>setMf({...mf,a:e.target.value,e:""})}/>{mf.e&&<div className="msg e" style={{marginBottom:10}}>{mf.e}</div>}<div className="row"><button className="full" onClick={linkC}>Ulash</button><button className="sec full" onClick={demoC}>Demo karta</button></div><p className="mut" style={{marginBottom:0}}>Demo karta 5 000 000 soʻm balans bilan ulanadi (sinov uchun).</p></>}
      {mod==="topup"&&<><h3>Kartani toʻldirish (demo)</h3><Fld l="Summa (soʻm)" type="number" value={mf.a} onChange={e=>setMf({...mf,a:e.target.value,e:""})}/><div className="chips">{[100000,500000,1000000].map(v=><button key={v} onClick={()=>setMf({...mf,a:String(v)})}>{fmt(v)}</button>)}</div>{mf.e&&<div className="msg e" style={{marginBottom:10}}>{mf.e}</div>}<button className="full" onClick={topup}>Toʻldirish</button></>}
      <button className="sec full sm" style={{marginTop:10}} onClick={closeM}>Yopish</button></div></div>}
  </div>;
}
