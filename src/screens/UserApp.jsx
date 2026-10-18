import { useState, useEffect, useRef } from "react";
import { api } from "../lib/api.js";
import { today } from "../lib/utils.js";
import { Exp } from "./Exp.jsx";
import { Deposit, Goals, NewGoal, Schedule } from "./Goals.jsx";
import { Home } from "./Home.jsx";
import { Jobs } from "./Jobs.jsx";
import { Places } from "./Places.jsx";
import { CardScr, Personal, Profile } from "./Profile.jsx";
import { Tips } from "./Tips.jsx";

const NAV=[["home","🏠","Bosh sahifa"],["exp","🧾","Xarajatlar"],["save","💰","Jamgʻarma"],["jobs","💼","Ishlar"],["profile","👤","Profil"]];
const SCR={home:Home,exp:Exp,save:Goals,jobs:Jobs,profile:Profile,tips:Tips,newgoal:NewGoal,schedule:Schedule,deposit:Deposit,places:Places,card:CardScr,personal:Personal};
export function UserApp({user,out,onAdmin}){
  const [d,setD0]=useState(null),[loadErr,setLoadErr]=useState("");
  const dRef=useRef(null),saveT=useRef(null),dirty=useRef(false);
  const flush=()=>{clearTimeout(saveT.current);if(!dirty.current||!dRef.current)return;dirty.current=false;api("PUT","/data",dRef.current).catch(()=>{dirty.current=true})};
  const setD=x=>{dRef.current=x;setD0(x);dirty.current=true;clearTimeout(saveT.current);saveT.current=setTimeout(flush,300)};
  const load=()=>{setLoadErr("");api("GET","/data").then(x=>{dRef.current=x;setD0(x)}).catch(e=>setLoadErr(e.message))};
  useEffect(()=>{load();window.addEventListener("pagehide",flush);return()=>{window.removeEventListener("pagehide",flush);flush()}},[]);
  const [tab,setTab]=useState("home"),[stack,setStack]=useState([]),[now,setNow]=useState(Date.now());
  const go={push:(name,p)=>setStack(s=>[...s,{name,p}]),back:()=>setStack(s=>s.slice(0,-1)),tab:t=>{setStack([]);setTab(t)}};
  const check=()=>{
      const c=dRef.current;if(!c)return;let ch=false,card=c.card,ex=c.expenses;const nw=new Date();
      const goals=c.goals.map(g=>{
        if(g.saved>=g.target||g.lastDeposit===today()||g.penaltyDate===today())return g;
        const [h,m]=g.time.split(":").map(Number);const dl=new Date();dl.setHours(h,m+60,0,0);
        if(nw<=dl)return g;ch=true;
        if(card){const cut=Math.min(card.bal,g.daily);card={...card,bal:card.bal-cut};ex=[{id:Date.now()+Math.random(),item:"Jarima: "+g.name,amount:cut,cat:"Jarima",method:"karta",date:today()},...ex]}
        return {...g,penaltyDate:today(),penalties:g.penalties+g.daily};
      });
      if(ch)setD({...c,goals,card,expenses:ex});
  };
  useEffect(()=>{const t=setInterval(()=>{check();setNow(Date.now())},20000);return()=>clearInterval(t)},[]);
  useEffect(()=>{if(d)check()},[!!d]);
  if(!d)return <div className="scr"><p className="mut" style={{padding:80,textAlign:"center"}}>{loadErr||"Yuklanmoqda..."}</p>{loadErr&&<div style={{textAlign:"center"}}><button onClick={load}>Qayta urinish</button> <button className="sec" onClick={out}>Chiqish</button></div>}</div>;
  const cur=stack.length?stack[stack.length-1]:{name:tab};const S=SCR[cur.name];
  return <><S d={d} setD={setD} go={go} user={user} now={now} p={cur.p} out={out} onAdmin={onAdmin}/>
    <div className="nav">{NAV.map(([k,i,l])=><button key={k} className={tab===k?"on":""} onClick={()=>go.tab(k)}><span>{i}</span>{l}</button>)}</div></>;
}
