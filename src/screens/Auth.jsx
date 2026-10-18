import { useState } from "react";
import { Fld, Top } from "../components/ui.jsx";
import { api } from "../lib/api.js";
import { ls } from "../lib/storage.js";
import { digits } from "../lib/utils.js";

export function Auth({onIn}){
  const first=!ls.get("had_acc",false);
  const [mode,setMode]=useState(first?"reg":"login");const [f,setF]=useState({name:"",phone:"+998 ",email:"",id:"",pass:""});
  const [agree,setAgree]=useState(true),[rem,setRem]=useState(true),[show,setShow]=useState(false),[err,setErr]=useState(""),[busy,setBusy]=useState(false);
  const set=k=>e=>setF({...f,[k]:e.target.value});
  const go=async()=>{
    if(busy)return;
    if(mode==="reg"){
      if(!f.name.trim()||digits(f.phone).length<12||f.pass.length<4)return setErr("Ism, toʻliq telefon (+998...) va parol (kamida 4 belgi) kerak.");
      if(f.email&&!f.email.includes("@"))return setErr("Email notoʻgʻri.");
      if(!agree)return setErr("Shartlarga rozilik bering.");
    }else if(!f.id.trim()||!f.pass)return setErr("Login va parolni kiriting.");
    setBusy(true);setErr("");
    try{
      const r=mode==="reg"?await api("POST","/register",{name:f.name.trim(),phone:f.phone,email:f.email.trim(),pass:f.pass}):await api("POST","/login",{id:f.id,pass:f.pass});
      ls.set("had_acc",true);onIn(r,mode==="reg"?true:rem);
    }catch(e){setErr(e.message);setBusy(false)}
  };
  const pw=<label className="fld"><small>Parol</small><div className="row"><input type={show?"text":"password"} value={f.pass} onChange={set("pass")}/><span onClick={()=>setShow(!show)}>👁</span></div></label>;
  const sw=()=>{setErr("");setMode(mode==="reg"?"login":"reg")};
  return <div className="scr" style={{background:"var(--card)"}}>
    {mode==="reg"?<><Top t="Roʻyxatdan oʻtish" back={first?null:sw}/><div className="wrap">
      <h3 style={{fontSize:17}}>Yangi hisob yarating</h3>
      <Fld l="Ism va familiya" value={f.name} onChange={set("name")}/><Fld l="Telefon raqam" type="tel" value={f.phone} onChange={set("phone")}/>
      <Fld l="Email (ixtiyoriy)" type="email" value={f.email} onChange={set("email")}/>{pw}
      <label className="mut row" style={{justifyContent:"flex-start",marginBottom:14}}><input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)}/> Men foydalanuvchi shartlari va maxfiylik siyosatiga roziman</label>
      {err&&<div className="msg e" style={{marginBottom:10}}>{err}</div>}
      <button className="full" onClick={go}>Roʻyxatdan oʻtish</button>
      <p className="mut" style={{textAlign:"center"}}>yoki</p>
      <div className="row"><button className="sec full" onClick={()=>alert("Google orqali kirish tez orada")}>G Google</button><button className="sec full" onClick={()=>alert("Apple orqali kirish tez orada")}> Apple</button></div>
      <p className="mut" style={{textAlign:"center"}}>Hisobingiz bormi? <a href="#" onClick={e=>{e.preventDefault();sw()}}>Kirish</a></p></div></>:
    <div className="wrap" style={{paddingTop:70}}>
      <h1 style={{margin:"0 0 4px"}}>Kirish</h1><p className="mut" style={{margin:"0 0 16px"}}>Hisobingizga kiring</p>
      <Fld l="Telefon raqam, email yoki login" value={f.id} onChange={set("id")} autoCapitalize="none"/>{pw}
      <label className="mut row" style={{justifyContent:"flex-start",marginBottom:14}}><input type="checkbox" checked={rem} onChange={e=>setRem(e.target.checked)}/> Meni eslab qol</label>
      {err&&<div className="msg e" style={{marginBottom:10}}>{err}</div>}
      <button className="full" onClick={go}>Kirish</button>
      <p style={{textAlign:"center"}}><a href="#" onClick={e=>{e.preventDefault();alert("Parolni tiklash uchun admin bilan bogʻlaning.")}}>Parolni unutdingizmi?</a></p>
      <p className="mut" style={{textAlign:"center",marginTop:40}}><a href="#" onClick={e=>{e.preventDefault();setF({...f,id:"admin"})}}>🛡 Admin sifatida kirish</a></p><p className="mut" style={{textAlign:"center",marginTop:12}}>Hisobingiz yoʻqmi? <a href="#" onClick={e=>{e.preventDefault();sw()}}>Roʻyxatdan oʻtish</a></p></div>}
  </div>;
}
