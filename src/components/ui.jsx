

export const Top=({t,back})=><div className="top">{back?<button className="ib" onClick={back}>‹</button>:<span style={{width:40}}/>}<b>{t}</b><span style={{width:40}}/></div>;
export const Fld=({l,...p})=><label className="fld"><small>{l}</small><input {...p}/></label>;
