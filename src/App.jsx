import { useState, useEffect } from "react";
import { api, getToken, setToken } from "./lib/api.js";
import { Admin } from "./screens/Admin.jsx";
import { Auth } from "./screens/Auth.jsx";
import { Splash } from "./screens/Splash.jsx";
import { UserApp } from "./screens/UserApp.jsx";

export default function App() {
  const [splash, setSplash] = useState(true);
  const [user, setUser] = useState(null);
  const [boot, setBoot] = useState(() => !!getToken());
  const [adm, setAdm] = useState(null);

  useEffect(() => {
    if (!getToken()) return;
    api("GET", "/me")
      .then((r) => setUser(r.user))
      .catch((e) => { if (e.status === 401 || e.status === 403) setToken(null); })
      .finally(() => setBoot(false));
    const t = setTimeout(() => setSplash(false), 1500);
    return () => clearTimeout(t);
  }, []);

  if (splash) return <Splash onGo={() => setSplash(false)} />;
  if (boot) return <div className="scr"><p className="mut" style={{ padding: 80, textAlign: "center" }}>Yuklanmoqda...</p></div>;
  if (!user) return <Auth onIn={(r, rem) => { setToken(r.token, rem); setUser(r.user); }} />;

  const out = () => { api("POST", "/logout").catch(() => {}); setToken(null); setUser(null); setAdm(null); };
  if (adm) return <Admin user={adm.user} token={adm.token} out={() => { api("POST", "/logout", null, adm.token).catch(() => {}); setAdm(null); }} />;
  return user.role === "admin"
    ? <Admin user={user} token={getToken()} out={out} />
    : <UserApp key={user.id} user={user} out={out} onAdmin={setAdm} />;
}
