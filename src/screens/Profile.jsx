import { useState } from "react";
import { Fld, Top } from "../components/ui.jsx";
import { ls } from "../lib/storage.js";
import { digits, fmt } from "../lib/utils.js";

export function CardScr({d,setD,go}){
  const [n,setN]=useState(""),[top,setTop]=useState("");
  const link=()=>{const c=digits(n);if(c.length!==16)return alert("16 xonali karta raqamini kiriting");setD({...d,card:{mask:c.slice(0,4)+" "+c.slice(4,6)+"** **** "+c.slice(12),brand:c.startsWith("8600")?"Uzcard":c.startsWith("9860")?"Humo":"Karta",bal:0}});setN("")};
  return <div className="scr"><Top t="Karta" back={go.back}/><div className="wrap">
    {!d.card?<><Fld l="Karta raqami (Uzcard / Humo)" inputMode="numeric" placeholder="9860 0000 0000 0000" value={n} onChange={e=>setN(e.target.value)}/><button className="full" onClick={link}>Kartani ulash</button><p className="mut">Faqat niqoblangan raqam saqlanadi (demo).</p></>:
    <><div className="card" style={{background:"linear-gradient(135deg,#3b6cf0,#4c3fd0)",color:"#fff"}}><div>💳 {d.card.mask} · {d.card.brand}</div><div style={{opacity:.85,marginTop:14}}>Balans</div><div className="big">{fmt(d.card.bal)}</div></div>
    <Fld l="Balansni toʻldirish (demo)" type="number" value={top} onChange={e=>setTop(e.target.value)}/>
    <button className="full" onClick={()=>{if(+top>0){setD({...d,card:{...d.card,bal:d.card.bal+ +top}});setTop("")}}}>Toʻldirish</button>
    <button className="sec full" style={{marginTop:10}} onClick={()=>setD({...d,card:null})}>Kartani uzish</button></>}</div></div>;
}

export function Personal({d,setD,go,user}){
  return <div className="scr"><Top t="Shaxsiy maʼlumot" back={go.back}/><div className="wrap">
    {[["Ism",user.name],["Telefon",user.phone||"—"],["Email",user.email||"—"]].map(([l,v])=><div className="fld" key={l}><small>{l}</small>{v}</div>)}
    <Fld l="Oylik daromad (soʻm)" type="number" value={d.income} onChange={e=>setD({...d,income:+e.target.value})}/></div></div>;
}

export function Profile({go,user,out}){
  const [dark,setDark]=useState(document.documentElement.dataset.theme==="dark");
  const tg=()=>{const v=dark?"light":"dark";document.documentElement.dataset.theme=v;ls.set("theme",v);setDark(!dark)};
  const soon=()=>alert("Tez orada");
  return <div className="scr"><Top t="Profil"/><div className="wrap">
    <div className="row" style={{justifyContent:"flex-start",gap:14,margin:"6px 0 12px"}}><div style={{width:60,height:60,borderRadius:"50%",background:"var(--pri)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:700}}>{user.name[0]}</div>
      <div><b>{user.name}</b><div className="mut">{user.phone||user.login}</div><span className="tag">Premium</span></div></div>
    {[["👤","Shaxsiy maʼlumot",()=>go.push("personal")],["💳","Karta",()=>go.push("card")],["🔒","Xavfsizlik",soon],["🔔","Bildirishnomalar",soon],["🌐","Til: Oʻzbek",soon]].map(([i,l,f])=><button className="menu" key={l} onClick={f}><span>{i}</span><span style={{flex:1}}>{l}</span>›</button>)}
    <div className="menu"><span>🌙</span><span style={{flex:1}}>Mavzu: Tungi rejim</span><button className={"sw"+(dark?" on":"")} onClick={tg}><i/></button></div>
    <button className="menu" onClick={soon}><span>❓</span><span style={{flex:1}}>Yordam va qoʻllab-quvvatlash</span>›</button>
    <button className="menu" style={{color:"var(--bad)"}} onClick={out}><span>↪️</span>Chiqish</button></div></div>;
}
