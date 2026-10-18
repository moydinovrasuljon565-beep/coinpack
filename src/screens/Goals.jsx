import { useState } from "react";
import { Fld, Top } from "../components/ui.jsx";
import { digits, fmt, today } from "../lib/utils.js";

export function Goals({d,setD,go}){
  const quick=(e,g)=>{e.stopPropagation();if(g.saved>=g.target)return;if(!d.card||d.card.bal<g.daily)return go.push("deposit",{id:g.id});setD({...d,card:{...d.card,bal:d.card.bal-g.daily},goals:d.goals.map(x=>x.id===g.id?{...x,saved:x.saved+g.daily,lastDeposit:today()}:x)})};
  return <div className="scr"><Top t="Jamgʻarish maqsadi"/><div className="wrap">
    <div className="card soft"><span style={{fontSize:40}}>🎯</span><div><b>Orzularingizga yaqinlashing</b><div className="mut">Oʻzingiz uchun pul yigʻing va kelajakni rejalashtiring.</div></div></div>
    <button className="full" onClick={()=>go.push("newgoal")}>Yangi maqsad qoʻshish</button>
    <h3 style={{margin:"16px 0 8px"}}>Mening maqsadlarim</h3>
    {d.goals.length===0&&<p className="mut">Hali maqsad yoʻq.</p>}
    {d.goals.map(g=>{const pct=Math.min(100,g.saved/g.target*100);return <div className="card" key={g.id} onClick={()=>go.push("deposit",{id:g.id})}>
      <div className="row"><b>{g.icon} {g.name}</b><span className="mut">{Math.round(pct)}%</span></div><div className="mut">{fmt(g.target)} · kuniga {fmt(g.daily)} · {g.time}</div>
      <div className="bar"><i style={{width:pct+"%"}}/></div><div className="mut">{g.saved>=g.target?"🎉 Maqsadga erishildi":Math.ceil((g.target-g.saved)/g.daily)+" kun qoldi"} · yigʻildi {fmt(g.saved)}{g.penalties>0&&" · jarima "+fmt(g.penalties)}</div>
      {g.saved<g.target&&<button className="sm" style={{marginTop:10}} onClick={e=>quick(e,g)}>{g.lastDeposit===today()?"✅ Bugun qoʻyildi · yana +":"+ Bugungi "}{fmt(g.daily)}</button>}</div>})}
  </div></div>;
}

export function NewGoal({go}){
  const [f,setF]=useState({name:"",target:"",icon:"💻"});
  return <div className="scr"><Top t="Yangi maqsad" back={go.back}/><div className="wrap">
    <Fld l="Maqsad nomi" placeholder="Masalan: Noutbuk" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
    <Fld l="Maqsad summasi (soʻm)" type="number" value={f.target} onChange={e=>setF({...f,target:e.target.value})}/>
    <div className="chips">{["💻","✈️","🏠","🚗","🎓","💍","📱","🎯"].map(i=><button key={i} className={f.icon===i?"on":""} onClick={()=>setF({...f,icon:i})}>{i}</button>)}</div>
    <button className="full" onClick={()=>{if(f.name.trim()&&+f.target>0)go.push("schedule",{name:f.name.trim(),target:+f.target,icon:f.icon})}}>Davom etish</button></div></div>;
}

export function Schedule({d,setD,go,p}){
  const [f,setF]=useState({daily:"50000",time:"08:00",notify:true}),[err,setErr]=useState("");
  const save=()=>{
    const daily=+f.daily;if(!(daily>0))return setErr("Kunlik summani kiriting.");
    const [h,m]=f.time.split(":").map(Number);const dl=new Date();dl.setHours(h,m+60,0,0);
    setD({...d,goals:[...d.goals,{id:"g"+Date.now(),name:p.name,icon:p.icon,target:p.target,saved:0,daily,time:f.time,notify:f.notify,lastDeposit:"",penaltyDate:new Date()>dl?today():"",penalties:0}]});go.tab("save");
  };
  return <div className="scr"><Top t="Jamgʻarish jadvali" back={go.back}/><div className="wrap">
    <p className="mut">{p.icon} {p.name} — {fmt(p.target)}{+f.daily>0&&" · taxminan "+Math.ceil(p.target/+f.daily)+" kun"}</p>
    <Fld l="Kunlik toʻlov miqdori (soʻm)" type="number" value={f.daily} onChange={e=>setF({...f,daily:e.target.value})}/>
    <Fld l="Qaysi vaqtda?" type="time" value={f.time} onChange={e=>setF({...f,time:e.target.value})}/>
    <div className="card soft">ℹ️<div className="mut" style={{color:"var(--tx)"}}>Agar belgilangan vaqtdan 60 daqiqa kech qolsangiz, kuniga {fmt(+f.daily||0)} kartadan yechib olinadi.</div></div>
    {!d.card&&<div className="msg e" style={{marginBottom:10}}>Jarima yechilishi uchun <a href="#" onClick={e=>{e.preventDefault();go.push("card")}}>kartani ulang</a>.</div>}
    <div className="row" style={{margin:"10px 0 16px"}}><span>🔔 Bildirishnoma oʻtkazish</span><button className={"sw"+(f.notify?" on":"")} onClick={()=>setF({...f,notify:!f.notify})}><i/></button></div>
    {err&&<div className="msg e" style={{marginBottom:10}}>{err}</div>}<button className="full" onClick={save}>Saqlash</button></div></div>;
}

export function Deposit({d,setD,go,p}){
  const [id,setId]=useState(p&&p.id||(d.goals[0]&&d.goals[0].id)||"");const [amt,setAmt]=useState("");const [msg,setMsg]=useState(null);const [cn,setCn]=useState("");
  const linkC=()=>{const c=digits(cn);if(c.length!==16)return setMsg({e:1,t:"16 xonali karta raqamini kiriting."});setD({...d,card:{mask:c.slice(0,4)+" "+c.slice(4,6)+"** **** "+c.slice(12),brand:c.startsWith("8600")?"Uzcard":c.startsWith("9860")?"Humo":"Karta",bal:0}});setCn("");setMsg(null)};
  const demoC=()=>{setD({...d,card:{mask:"9860 12** **** 5678",brand:"Humo",bal:5000000}});setMsg(null)};
  const g=d.goals.find(x=>x.id===id);
  const dep=()=>{
    const a=+amt;if(!g||!(a>0))return setMsg({e:1,t:"Maqsad va summani tanlang."});
    if(!d.card||d.card.bal<a)return setMsg({e:1,t:d.card?"Kartada mablagʻ yetarli emas.":"Avval kartani ulang."});
    setD({...d,card:{...d.card,bal:d.card.bal-a},goals:d.goals.map(x=>x.id===id?{...x,saved:x.saved+a,lastDeposit:a>=x.daily?today():x.lastDeposit}:x)});
    setAmt("");setMsg({t:"🎉 Mablagʻingiz muvaffaqiyatli qoʻshildi! Endi siz maqsadingizga yaqinroqsiz."});
  };
  if(!d.goals.length)return <div className="scr"><Top t="Jamgʻarma qoʻshish" back={go.back}/><div className="wrap"><p className="mut">Avval maqsad yarating.</p><button className="full" onClick={()=>go.push("newgoal")}>Yangi maqsad</button></div></div>;
  return <div className="scr"><Top t="Jamgʻarma qoʻshish" back={go.back}/><div className="wrap">
    <label className="fld"><small>Maqsadni tanlang</small><select value={id} onChange={e=>setId(e.target.value)}>{d.goals.map(x=><option key={x.id} value={x.id}>{x.icon} {x.name} ({fmt(x.target)})</option>)}</select></label>
    {d.card?<div className="fld"><small>Kartadan yechish</small><div>💳 {d.card.mask} ({d.card.brand}) · {fmt(d.card.bal)}</div></div>:<div className="card"><h3>💳 Avval kartani ulang</h3>
      <Fld l="Karta raqami (Uzcard / Humo)" inputMode="numeric" placeholder="9860 0000 0000 0000" value={cn} onChange={e=>setCn(e.target.value)}/>
      <div className="row"><button className="full" onClick={linkC}>Ulash</button><button className="sec full" onClick={demoC}>Demo karta</button></div>
      <p className="mut" style={{marginBottom:0}}>Demo karta 5 000 000 soʻm balans bilan ulanadi (sinov uchun).</p></div>}
    <Fld l="Summa (soʻm)" type="number" value={amt} onChange={e=>setAmt(e.target.value)}/>
    {g&&<div className="chips">{[g.daily,100000,500000].map(v=><button key={v} onClick={()=>setAmt(String(v))}>{fmt(v)}</button>)}</div>}
    {d.card&&+amt>d.card.bal&&<button className="sec full sm" style={{marginBottom:10}} onClick={()=>setD({...d,card:{...d.card,bal:+amt}})}>💳 Demo: karta balansini {fmt(+amt)} ga toʻldirish</button>}
    <button className="full" onClick={dep}>Qoʻshish</button>{msg&&<div className={"msg"+(msg.e?" e":"")}>{msg.t}</div>}
    {g&&<button className="sec full sm" style={{marginTop:16}} onClick={()=>{if(confirm("Maqsad oʻchirilsinmi?")){setD({...d,goals:d.goals.filter(x=>x.id!==id)});go.back()}}}>Maqsadni oʻchirish</button>}</div></div>;
}
