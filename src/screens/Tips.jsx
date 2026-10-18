import { Top } from "../components/ui.jsx";
import { fmt, ym } from "../lib/utils.js";

export function Tips({d,go}){
  const n=ym(new Date());const by={};d.expenses.filter(e=>e.date.startsWith(n)).forEach(e=>by[e.cat]=(by[e.cat]||0)+e.amount);
  const top=Object.entries(by).sort((a,b)=>b[1]-a[1])[0];const tc=top?top[0]:"Oziq-ovqat",tv=top?top[1]:0;
  const L=[["💰","Keraksiz xarajatlarni kamaytiring",top?"Bu oy "+tc+" boʻyicha "+fmt(tv)+" sarfladingiz. 20% kamaytirsangiz, "+fmt(tv*0.2)+" tejaysiz.":"Xarajat yozib boring – keyin aniq tavsiya beramiz.",null],["🧾","Uygʻun byudjet",tc+" xarajatini haftalik rejaga asoslang, daromadning 15% idan oshirmang.",null],["💜","Tejash maqsadini qoʻying","Masalan, 3 oyda 2 000 000 soʻm jamgʻaring.",()=>go.push("newgoal")],["🍴","Arzonroq variantlarni tanlang","Yaqin atrofdagi arzon va sifatli joylar roʻyxatini koʻring.",()=>go.push("places")]];
  return <div className="scr"><Top t="Tejash boʻyicha maslahatlar" back={go.back}/><div className="wrap">
    {L.map(([i,t,s,f])=><div className="card row" key={t} onClick={f||undefined} style={{alignItems:"flex-start"}}><span style={{fontSize:28}}>{i}</span><div style={{flex:1}}><b>{t}</b><div className="mut">{s}</div></div>{f&&<span>›</span>}</div>)}
    <button className="full" onClick={go.back}>Yaxshi, tushunarli!</button></div></div>;
}
