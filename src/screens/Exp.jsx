import { useState } from "react";
import { VoiceAdd } from "../components/VoiceAdd.jsx";
import { Top } from "../components/ui.jsx";
import { COL, fmt, ym } from "../lib/utils.js";

const MN=["yan","fev","mar","apr","may","iyn","iyl","avg","sen","okt","noy","dek"];
export function Exp({d,setD,go}){
  const [rg,setRg]=useState(0);const n=new Date();
  const from=rg===0?ym(n)+"-01":rg===1?ym(new Date(n.getFullYear(),n.getMonth()-2,1))+"-01":n.getFullYear()+"-01-01";
  const ex=d.expenses.filter(e=>e.date>=from);const total=ex.reduce((a,e)=>a+e.amount,0);
  const by={};ex.forEach(e=>by[e.cat]=(by[e.cat]||0)+e.amount);const rows=Object.entries(by).sort((a,b)=>b[1]-a[1]);
  let acc=0;const grad=rows.map(([c,v])=>{const a=acc/total*100;acc+=v;return COL[c]+" "+a+"% "+acc/total*100+"%"}).join(",");
  const mon=ex2=>d.expenses.filter(e=>e.date.startsWith(ex2)).reduce((a,e)=>a+e.amount,0);
  const months=[2,1,0].map(i=>{const t=new Date(n.getFullYear(),n.getMonth()-i,1);return [MN[t.getMonth()],mon(ym(t))]});const mx=Math.max(1,...months.map(m=>m[1]));
  const cm=mon(ym(n)),ratio=cm/(d.income||1);
  const res=ratio<0.7?["Bu oy xarajatlaringiz oʻrtacha normada. Shunday davom eting!","#e7f8ee"]:ratio<1?["Xarajatingiz daromadning katta qismini yeyapti. Ehtiyot boʻling.","#fef3c7"]:["Xarajat daromaddan oshib ketdi! Zudlik bilan qisqartiring.","#fee2e2"];
  return <div className="scr"><Top t="Xarajatlar tahlili"/><div className="wrap">
    <div className="seg">{["Bu oy","Oxirgi 3 oy","Yil"].map((x,i)=><button key={x} className={rg===i?"on":""} onClick={()=>setRg(i)}>{x}</button>)}</div>
    <div className="card row" style={{alignItems:"center"}}>
      <div className="donut" style={{background:total?"conic-gradient("+grad+")":"var(--bd)"}}><div>Jami<b>{Math.round(total).toLocaleString("ru-RU")}</b>soʻm</div></div>
      <div style={{flex:1,fontSize:13}}>{rows.length===0&&<span className="mut">Maʼlumot yoʻq</span>}{rows.map(([c,v])=><div className="row" key={c}><span><i className="dot" style={{background:COL[c]}}/>{c}</span><b>{Math.round(v/total*100)}%</b></div>)}</div></div>
    <div className="card" style={{background:res[1],color:"#14213d"}}><b>Tahlil natijasi</b><p style={{margin:"6px 0"}}>{res[0]}</p>
      <button className="sm" onClick={()=>go.push("tips")}>Qanday tejash mumkin?</button></div>
    <label className="fld"><small>Oylik daromadingiz (soʻm)</small><input type="number" value={d.income} onChange={e=>setD({...d,income:+e.target.value})}/></label>
    <div className="card"><h3>Oʻtgan oylar bilan solishtirish</h3><div className="row" style={{alignItems:"flex-end",height:130,textAlign:"center"}}>
      {months.map(([l,v])=><div key={l} style={{flex:1}}><div className="mut" style={{fontSize:11}}>{Math.round(v/1000).toLocaleString("ru-RU")}k</div><div style={{height:v/mx*80+4,background:"var(--pri)",borderRadius:6,margin:"2px 12px"}}/><div className="mut">{l}</div></div>)}</div></div>
    <VoiceAdd d={d} setD={setD}/>
    <div className="card"><h3>Xarajatlar tarixi</h3>{d.expenses.length===0&&<p className="mut">Hali yozuv yoʻq.</p>}
      {d.expenses.slice(0,40).map(e=><div className="item row" key={e.id}><div><b>{e.item}</b><div className="mut">{e.date} · {e.cat} · {e.method==="karta"?"💳 karta":"💵 naqd"}</div></div><b style={{color:"var(--bad)"}}>−{fmt(e.amount)}</b></div>)}</div>
  </div></div>;
}
