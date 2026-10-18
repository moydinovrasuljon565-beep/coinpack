import { useState, useRef } from "react";
import { fmt, parse, today } from "../lib/utils.js";

const ERR={"not-allowed":"Bu oynada mikrofon bloklangan (Claude ichidagi koʻrinish ruxsat bermaydi). Pastdagi yozish maydonini bosing va klaviaturadagi 🎤 tugmasi bilan gapiring – u ham yozib beradi.","service-not-allowed":"Bu oynada mikrofon bloklangan (Claude ichidagi koʻrinish ruxsat bermaydi). Pastdagi yozish maydonini bosing va klaviaturadagi 🎤 tugmasi bilan gapiring – u ham yozib beradi.","no-speech":"Ovoz eshitilmadi. Qayta bosing va aniqroq gapiring.","audio-capture":"Mikrofon topilmadi.","network":"Ovozni tanish uchun internet kerak."};
export function VoiceAdd({d,setD}){
  const [rec,setRec]=useState(false),[live,setLive]=useState(""),[msg,setMsg]=useState(null),[txt,setTxt]=useState(""),[last,setLast]=useState(null);
  const dr=useRef(d);dr.current=d;const rr=useRef(null);
  const add=x=>{
    const c=dr.current;let card=c.card;
    if(x.method==="karta"){
      if(!card)return setMsg({e:1,t:"Karta ulanmagan. Profil → Karta boʻlimida ulang."});
      if(card.bal<x.amount)return setMsg({e:1,t:"Kartada mablagʻ yetarli emas."});
      card={...card,bal:card.bal-x.amount};
    }
    const e={...x,id:Date.now(),date:today()};setD({...c,card,expenses:[e,...c.expenses]});setLast(e);
    setMsg({t:"✅ "+x.item+" — "+fmt(x.amount)+" ("+(x.method==="karta"?"karta":"naqd")+")"});
  };
  const handle=t=>{const p=parse(t);p?add(p):setMsg({e:1,t:"“"+t+"” — summani topolmadim. Masalan: “doʻkondan 10 mingga fanta oldim”."})};
  const undo=()=>{const c=dr.current;if(!last)return;setD({...c,card:last.method==="karta"&&c.card?{...c.card,bal:c.card.bal+last.amount}:c.card,expenses:c.expenses.filter(x=>x.id!==last.id)});setLast(null);setMsg({t:"Bekor qilindi."})};
  const listen=lang=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR)return setMsg({e:1,t:"Brauzeringiz ovozni tanimaydi (Chrome yoki Safari ishlating). Pastga yozing."});
    const r=new SR();rr.current=r;r.lang=lang;r.interimResults=true;r.maxAlternatives=1;
    r.onstart=()=>{setRec(true);setLive("");setMsg(null)};r.onend=()=>setRec(false);
    r.onresult=ev=>{let t="";for(let i=0;i<ev.results.length;i++)t+=ev.results[i][0].transcript;setLive(t);if(ev.results[ev.results.length-1].isFinal)handle(t)};
    r.onerror=ev=>{if(ev.error==="language-not-supported"&&lang!=="ru-RU")return listen("ru-RU");setMsg({e:1,t:ERR[ev.error]||("Xatolik: "+ev.error)})};
    try{r.start()}catch(e){}
  };
  return <div className="card"><h3>🎤 Ovoz bilan xarajat qoʻshish</h3>
    <button className={"mic"+(rec?" rec":"")} onClick={()=>rec&&rr.current?rr.current.stop():listen("uz-UZ")}>{rec?"⏹ Eshityapman... (toʻxtatish)":"🎤 Bosing va gapiring"}</button>
    {live&&<p className="mut" style={{margin:"8px 0 0"}}>“{live}”</p>}
    <p className="mut">Masalan: “Men doʻkondan oʻn mingga fanta oldim” yoki “25 ming taksi karta bilan”.</p>
    <div className="row"><input className="fld" style={{margin:0,flex:1,width:"100%",color:"var(--tx)"}} placeholder="yozing yoki klaviaturadagi 🎤 bilan gapiring" value={txt} onChange={e=>setTxt(e.target.value)}/><button onClick={()=>{if(txt.trim()){handle(txt);setTxt("")}}}>OK</button></div>
    {msg&&<div className={"msg"+(msg.e?" e":"")}>{msg.t}{last&&!msg.e&&<> · <a href="#" onClick={e=>{e.preventDefault();undo()}}>Bekor qilish</a></>}</div>}
  </div>;
}
