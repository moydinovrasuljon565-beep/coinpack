import { useState, useEffect } from "react";
import { Fld, Top } from "../components/ui.jsx";
import { api } from "../lib/api.js";
import { fmt } from "../lib/utils.js";

export function Places({go}){
  const [q,setQ]=useState(""),[k,setK]=useState("Barchasi"),[w,setW]=useState(0),[all,setAll]=useState([]);
  useEffect(()=>{api("GET","/places").then(setAll).catch(()=>{})},[]);
  const list=all.filter(p=>(k==="Barchasi"||p.k===k)&&p.n.toLowerCase().includes(q.toLowerCase())).sort((a,b)=>b.r/b.p-a.r/a.p);
  const ic={"Restoran":"🍽️","Kafe":"☕","Fast food":"🍔"};
  return <div className="scr"><Top t="Yaqin atrofdagi arzon va sifatli oziq-ovqat joylari" back={go.back}/><div className="wrap">
    <Fld l="Qidiruv" placeholder="Joy nomini yoki taom turi..." value={q} onChange={e=>setQ(e.target.value)}/>
    <div className="chips">{["Barchasi","Restoran","Kafe","Fast food"].map(x=><button key={x} className={k===x?"on":""} onClick={()=>setK(x)}>{x==="Barchasi"?x:x+"lar".replace("lar",x==="Restoran"?"lar":"")}</button>)}</div>
    <div className="chips">{["🏠 Uyga yaqin","🏢 Ishga yaqin"].map((x,i)=><button key={x} className={w===i?"on":""} onClick={()=>setW(i)}>{x}</button>)}</div>
    {list.map(p=><div className="card row" key={p.n}><span style={{fontSize:34}}>{ic[p.k]||"🍴"}</span><div style={{flex:1}}><b>{p.n}</b><div className="mut">⭐ {p.r} ({p.rv}) · {p.d[w]} km</div>
      <span className="tag">{p.p<=25000?"Arzon narx":p.r>=4.6?"Sifatli":"Mahalliy taʼm"}</span><div className="mut">Oʻrtacha: {fmt(p.p)}</div></div></div>)}
    <a target="_blank" rel="noopener" href="https://www.google.com/maps/search/arzon+restoran+yaqin">Xaritada haqiqiy joylarni qidirish →</a></div></div>;
}
