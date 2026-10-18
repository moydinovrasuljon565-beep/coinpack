import { ls } from "./storage.js";

const KEY = "token3";
let mem = null;

export const getToken = () => mem || ls.get(KEY, null);
export function setToken(t, remember) {
  mem = t || null;
  ls.set(KEY, t && remember ? t : null);
}

// Backend bilan gaplashadi: api("POST", "/login", {...}). tk – ixtiyoriy alohida token (admin uchun).
export async function api(method, url, body, tk) {
  const token = tk || getToken();
  const json = body === undefined || body === null ? undefined : JSON.stringify(body);
  let res;
  try {
    res = await fetch("/api" + url, {
      method,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
      body: json,
      keepalive: method !== "GET" && !!json && json.length < 60000,
    });
  } catch {
    throw new Error("Serverga ulanib boʻlmadi. Internetni tekshiring.");
  }
  let data = null;
  try { data = await res.json(); } catch { /* boʻsh javob */ }
  if (!res.ok) {
    const e = new Error((data && data.error) || "Server xatosi (" + res.status + ")");
    e.status = res.status;
    throw e;
  }
  return data;
}
