

export const fmt=n=>Math.round(n).toLocaleString("ru-RU")+" soʻm";
export const ym=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
export const today=()=>{const d=new Date();return ym(d)+"-"+String(d.getDate()).padStart(2,"0")};
export const digits=s=>(s||"").replace(/\D/g,"");
export const COL={"Oziq-ovqat":"#2563eb","Transport":"#ef4444","Kiyim-kechak":"#f59e0b","Koʻngilochar":"#22c55e","Kommunal":"#14b8a6","Boshqa":"#8b5cf6","Jarima":"#f97316"};
const CATS={"Oziq-ovqat":["fanta","non","goʻsht","gosht","sut","ovqat","osh","choy","kola","suv","market","olma","tuxum","lagmon","somsa","pepsi","ichimlik","meva","sabzavot"],"Transport":["taksi","benzin","avtobus","metro","yandex","yoqilgʻi"],"Kommunal":["gaz","svet","elektr","internet","telefon","kommunal"],"Kiyim-kechak":["koylak","kiyim","oyoq","krossovka","shim","kurtka"],"Koʻngilochar":["kino","kafe","oʻyin","oyin","konsert","park"]};
export const guess=t=>{for(const c in CATS)if(CATS[c].some(w=>t.includes(w)))return c;return "Boshqa"};
const U={bir:1,ikki:2,uch:3,"toʻrt":4,besh:5,olti:6,yetti:7,sakkiz:8,"toʻqqiz":9},T={"oʻn":10,yigirma:20,"oʻttiz":30,qirq:40,ellik:50,oltmish:60,yetmish:70,sakson:80,"toʻqson":90};
const STOP=/^(men|menga|doʻkon\w*|dokon\w*|bozor\w*|dan|da|ga|ta|uchun|oldim|olindi|sotib|toʻladim|xarid|qildim|ketdi|sarfladim|bugun|kecha|naqd\w*|karta\w*|pul\w*|soʻm\w*|som|sum|ming\w*|va|bilan)$/;
export function parse(raw){
  const t=raw.toLowerCase().replace(/[’'`‘ʼ]/g,"ʻ").replace(/(\d)\s+(?=\d{3}(\s|$))/g,"$1");
  const tk=t.split(/[\s,.]+/).filter(Boolean);let total=0,cur=0,found=false;const used=new Set();
  tk.forEach((w,i)=>{
    if(/^\d+$/.test(w)){cur+=+w;found=true;used.add(i)}
    else if(U[w]){cur+=U[w];found=true;used.add(i)}
    else if(T[w]){cur+=T[w];found=true;used.add(i)}
    else if(w==="yuz"||w==="сто"){cur=(cur||1)*100;found=true;used.add(i)}
    else if(/^(ming|тыс)/.test(w)){total+=(cur||1)*1000;cur=0;found=true;used.add(i)}
    else if(/^(million|mln|миллион)/.test(w)){total+=(cur||1)*1e6;cur=0;found=true;used.add(i)}
  });
  const amount=total+cur;if(!found||amount<=0)return null;
  let item=tk.filter((w,i)=>!used.has(i)&&!STOP.test(w)).join(" ").trim()||"Xarid";
  return {item:item.charAt(0).toUpperCase()+item.slice(1),amount,cat:guess(t),method:/karta|карт/.test(t)?"karta":"naqd"};
}
export const SC={kutilmoqda:["#f59e0b","Kutilmoqda"],qabul:["#16a34a","Qabul qilindi"],rad:["#ef4444","Rad etildi"]};
