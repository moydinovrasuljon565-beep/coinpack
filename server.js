// StartApp – frontend + backend BITTA jarayonda (qoʻshimcha paketlarsiz).
//   npm run dev    -> http://localhost:3000  (Vite + API birga, kod oʻzgarsa avtomatik yangilanadi)
//   npm start      -> dist/ papkasini va /api ni bitta serverda beradi (Railway)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist");
const DATA_DIR = process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const PORT = Number(process.env.PORT) || 3000;
const DEV = process.argv.includes("--dev");
const SESSION_MS = 30 * 24 * 3600 * 1000;

/* ---------------- Maʼlumotlar bazasi (JSON fayl) ---------------- */
const PLACES = [
  { id: "p1", n: "Sofra Restoran", k: "Restoran", p: 35000, r: 4.7, rv: 124, d: [1.2, 2.1] },
  { id: "p2", n: "Uzum Buloq", k: "Kafe", p: 40000, r: 4.6, rv: 98, d: [1.5, 0.9] },
  { id: "p3", n: "Chorraha Fast Food", k: "Fast food", p: 20000, r: 4.3, rv: 76, d: [2.0, 0.5] },
  { id: "p4", n: "Milliy Taomlar", k: "Restoran", p: 30000, r: 4.8, rv: 112, d: [2.0, 1.6] },
  { id: "p5", n: "Non va Kofe", k: "Kafe", p: 22000, r: 4.4, rv: 61, d: [0.8, 1.9] },
  { id: "p6", n: "Somsaxona №1", k: "Fast food", p: 18000, r: 4.4, rv: 88, d: [0.3, 1.2] },
];
const JOBS = [
  { id: "j1", t: "Freelance dizayn", c: "Upwork / Fiverr", sal: "$10 – $50/soat", z: "Onlayn", tags: ["Masofadan", "Dizayn"] },
  { id: "j2", t: "Telegram moderator", c: "Telegram", sal: "$300 – $800/oy", z: "Onlayn", tags: ["Masofadan", "Moslashuvchan"] },
  { id: "j3", t: "SMM mutaxassis", c: "Instagram / TikTok", sal: "$400 – $1000/oy", z: "Onlayn", tags: ["Masofadan", "Marketing"] },
  { id: "j4", t: "Branch Manager", c: "Tashkilot, Toshkent", sal: "$800 – $1500/oy", z: "UZ", tags: ["Toshkent", "Ofis"] },
  { id: "j5", t: "Frontend dasturchi", c: "IT Park, Toshkent", sal: "$700 – $1800/oy", z: "UZ", tags: ["Toshkent", "IT"] },
  { id: "j6", t: "Qurilish ustasi", c: "Koreya (E-9 viza)", sal: "$2000 – $2500/oy", z: "Xorij", tags: ["Koreya", "Viza"] },
  { id: "j7", t: "Oshpaz", c: "Dubay, BAA", sal: "$1200 – $1600/oy", z: "Xorij", tags: ["BAA", "Yotoq beriladi"] },
];

fs.mkdirSync(DATA_DIR, { recursive: true });
let db = null;
try {
  db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
} catch (e) {
  if (fs.existsSync(DB_FILE)) {
    fs.copyFileSync(DB_FILE, DB_FILE + ".buzilgan-" + Date.now()); // buzilgan fayl nusxasi
    console.error("db.json oʻqilmadi, nusxasi saqlandi, yangi baza yaratildi.");
  }
}
db = { users: [], data: {}, places: PLACES, jobs: JOBS, notice: "", applications: [], sessions: {}, ...(db || {}) };

let saveTimer = null;
function flush() {
  clearTimeout(saveTimer);
  saveTimer = null;
  const tmp = DB_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db));
  fs.renameSync(tmp, DB_FILE);
}
const save = () => { if (!saveTimer) saveTimer = setTimeout(flush, 200); };
for (const sig of ["SIGTERM", "SIGINT"]) process.on(sig, () => { try { flush(); } catch {} process.exit(0); });

/* ---------------- Yordamchi funksiyalar ---------------- */
class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }
const digits = (s) => String(s || "").replace(/\D/g, "");
const str = (v, max) => String(v ?? "").trim().slice(0, max);
const today = () => new Date().toISOString().slice(0, 10);
const rid = (p) => p + Date.now().toString(36) + crypto.randomBytes(3).toString("hex");

function hashPass(pass, salt = crypto.randomBytes(16).toString("hex")) {
  return { salt, hash: crypto.scryptSync(pass, salt, 64).toString("hex") };
}
function checkPass(u, pass) {
  const a = Buffer.from(u.hash, "hex");
  const b = crypto.scryptSync(pass, u.salt, 64);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
const pub = (u) => ({ id: u.id, name: u.name, phone: u.phone, email: u.email, login: u.login, role: u.role });
const emptyData = () => ({ income: 3000000, expenses: [], card: null, goals: [] });

function findUser(id) {
  const x = String(id || "").trim().toLowerCase();
  const dg = digits(x);
  if (!x) return null;
  return db.users.find((u) => u.login === x || (u.email && u.email === x) || (dg.length >= 9 && u.phone && digits(u.phone).slice(-9) === dg.slice(-9)));
}
function newSession(uid) {
  const token = crypto.randomBytes(32).toString("hex");
  db.sessions[token] = { uid, t: Date.now() };
  return token;
}
function userFromReq(req) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  const s = db.sessions[token];
  if (!s) return null;
  if (Date.now() - s.t > SESSION_MS) { delete db.sessions[token]; return null; }
  const u = db.users.find((x) => x.id === s.uid);
  return u && !u.blocked ? u : null;
}
const stats = (uid) => {
  const d = db.data[uid];
  if (!d) return { n: 0, sum: 0, card: false, goals: 0 };
  return { n: d.expenses.length, sum: d.expenses.reduce((a, e) => a + (+e.amount || 0), 0), card: !!d.card, goals: d.goals.length };
};
function cleanData(b) {
  if (!b || typeof b !== "object") throw new HttpError(400, "Maʼlumot notoʻgʻri.");
  const income = Number(b.income);
  if (!Number.isFinite(income) || income < 0 || income > 1e13) throw new HttpError(400, "Daromad notoʻgʻri.");
  if (!Array.isArray(b.expenses) || b.expenses.length > 5000 || !Array.isArray(b.goals) || b.goals.length > 200) throw new HttpError(400, "Maʼlumot notoʻgʻri.");
  let card = null;
  if (b.card) {
    if (typeof b.card !== "object" || !Number.isFinite(Number(b.card.bal))) throw new HttpError(400, "Karta notoʻgʻri.");
    card = { mask: str(b.card.mask, 30), brand: str(b.card.brand, 20), bal: Number(b.card.bal) };
  }
  return { income, expenses: b.expenses, card, goals: b.goals };
}

// Bosh admin
(() => {
  const pass = process.env.ADMIN_PASSWORD || "admin123";
  let a = db.users.find((u) => u.id === "admin");
  if (!a) {
    a = { id: "admin", name: "Bosh admin", login: "admin", phone: "", email: "", role: "admin", blocked: false, ...hashPass(pass) };
    db.users.unshift(a);
  } else if (process.env.ADMIN_PASSWORD) Object.assign(a, hashPass(pass));
  if (!process.env.ADMIN_PASSWORD) console.warn('Diqqat: admin paroli standart ("admin123"). Railway da ADMIN_PASSWORD oʻzgaruvchisini qoʻying.');
  for (const [t, s] of Object.entries(db.sessions)) if (Date.now() - s.t > SESSION_MS) delete db.sessions[t];
  save();
})();

const hits = new Map();
setInterval(() => { const n = Date.now(); for (const [k, v] of hits) if (n - v.t > 60000) hits.delete(k); }, 60000).unref();
function limit(ip) {
  const n = Date.now(), r = hits.get(ip);
  if (!r || n - r.t > 60000) return void hits.set(ip, { n: 1, t: n });
  if (++r.n > 20) throw new HttpError(429, "Juda koʻp urinish. Bir daqiqadan keyin urinib koʻring.");
}

/* ---------------- API yoʻllari ---------------- */
const routes = [];
const route = (m, p, h, o = {}) => routes.push({ m, re: new RegExp("^" + p.replace(/:(\w+)/g, "(?<$1>[^/]+)") + "$"), h, ...o });
const AUTH = { auth: true }, ADMIN = { auth: true, admin: true };

route("GET", "/api/health", () => ({ ok: true }));

route("POST", "/api/register", ({ body, ip }) => {
  limit(ip);
  const name = str(body.name, 80), phone = str(body.phone, 30), email = str(body.email, 100).toLowerCase(), pass = String(body.pass || "");
  if (!name || digits(phone).length < 12 || pass.length < 4 || pass.length > 200) throw new HttpError(400, "Ism, toʻliq telefon (+998...) va parol (kamida 4 belgi) kerak.");
  if (email && !email.includes("@")) throw new HttpError(400, "Email notoʻgʻri.");
  if (findUser(phone) || (email && findUser(email))) throw new HttpError(409, "Bu telefon yoki email bilan hisob bor.");
  const u = { id: rid("u"), name, phone, email, login: digits(phone), role: "user", blocked: false, ...hashPass(pass) };
  db.users.push(u);
  db.data[u.id] = emptyData();
  const token = newSession(u.id);
  save();
  return { token, user: pub(u) };
});
route("POST", "/api/login", ({ body, ip }) => {
  limit(ip);
  const u = findUser(str(body.id, 100));
  if (!u || !checkPass(u, String(body.pass || ""))) throw new HttpError(401, "Login/telefon yoki parol notoʻgʻri.");
  if (u.blocked) throw new HttpError(403, "Hisobingiz bloklangan. Admin bilan bogʻlaning.");
  const token = newSession(u.id);
  save();
  return { token, user: pub(u) };
});
route("POST", "/api/admin/login", ({ body, ip }) => {
  limit(ip);
  const u = findUser(str(body.id, 100));
  if (!u || u.role !== "admin" || u.blocked || !checkPass(u, String(body.pass || ""))) throw new HttpError(401, "Login yoki parol notoʻgʻri.");
  const token = newSession(u.id);
  save();
  return { token, user: pub(u) };
});
route("POST", "/api/logout", ({ req }) => {
  const h = req.headers.authorization || "";
  delete db.sessions[h.startsWith("Bearer ") ? h.slice(7) : ""];
  save();
  return { ok: true };
});
route("GET", "/api/me", ({ user }) => ({ user: pub(user) }), AUTH);
route("GET", "/api/data", ({ user }) => db.data[user.id] || emptyData(), AUTH);
route("PUT", "/api/data", ({ user, body }) => { db.data[user.id] = cleanData(body); save(); return { ok: true }; }, AUTH);

route("GET", "/api/places", () => db.places);
route("GET", "/api/jobs", () => db.jobs);
route("GET", "/api/notice", () => ({ text: db.notice }));

route("POST", "/api/applications", ({ user, body }) => {
  const job = str(body.job, 120), company = str(body.company, 120), msg = str(body.msg, 1000), phone = str(body.phone, 30);
  if (!job || !msg || digits(phone).length < 9) throw new HttpError(400, "Telefon raqam va oʻzingiz haqingizda qisqacha yozing.");
  if (db.applications.find((a) => a.uid === user.id && a.job === job && a.company === company)) throw new HttpError(409, "Bu ishga ariza allaqachon yuborilgan.");
  const a = { id: rid("a"), uid: user.id, name: user.name, phone, job, company, sal: str(body.sal, 60), msg, status: "kutilmoqda", date: today(), seen: true };
  db.applications.unshift(a);
  save();
  return a;
}, AUTH);
route("GET", "/api/applications/mine", ({ user }) => db.applications.filter((a) => a.uid === user.id), AUTH);
route("POST", "/api/applications/:id/seen", ({ user, params }) => {
  const a = db.applications.find((x) => x.id === params.id && x.uid === user.id);
  if (!a) throw new HttpError(404, "Topilmadi.");
  a.seen = true;
  save();
  return { ok: true };
}, AUTH);

/* ----- Admin ----- */
route("GET", "/api/admin/users", () => db.users.map((u) => ({ ...pub(u), blocked: u.blocked, stats: stats(u.id) })), ADMIN);
route("PATCH", "/api/admin/users/:id", ({ user, params, body }) => {
  const u = db.users.find((x) => x.id === params.id);
  if (!u) throw new HttpError(404, "Foydalanuvchi topilmadi.");
  if (u.id === "admin" || u.id === user.id) throw new HttpError(403, "Bu hisobni oʻzgartirib boʻlmaydi.");
  if (typeof body.blocked === "boolean") { u.blocked = body.blocked; if (u.blocked) for (const [t, s] of Object.entries(db.sessions)) if (s.uid === u.id) delete db.sessions[t]; }
  if (body.role === "admin" || body.role === "user") u.role = body.role;
  save();
  return { ok: true };
}, ADMIN);
route("DELETE", "/api/admin/users/:id", ({ user, params }) => {
  const u = db.users.find((x) => x.id === params.id);
  if (!u) throw new HttpError(404, "Foydalanuvchi topilmadi.");
  if (u.id === "admin" || u.id === user.id) throw new HttpError(403, "Bu hisobni oʻchirib boʻlmaydi.");
  db.users = db.users.filter((x) => x.id !== u.id);
  delete db.data[u.id];
  db.applications = db.applications.filter((a) => a.uid !== u.id);
  for (const [t, s] of Object.entries(db.sessions)) if (s.uid === u.id) delete db.sessions[t];
  save();
  return { ok: true };
}, ADMIN);
route("GET", "/api/admin/applications", () => db.applications, ADMIN);
route("PATCH", "/api/admin/applications/:id", ({ params, body }) => {
  const a = db.applications.find((x) => x.id === params.id);
  if (!a) throw new HttpError(404, "Ariza topilmadi.");
  if (!["kutilmoqda", "qabul", "rad"].includes(body.status)) throw new HttpError(400, "Holat notoʻgʻri.");
  a.status = body.status;
  a.seen = false;
  a.decided = today();
  save();
  return a;
}, ADMIN);
route("POST", "/api/admin/places", ({ body }) => {
  const n = str(body.n, 80), p = Number(body.p), r = Number(body.r) || 4.5;
  if (!n || !(p > 0)) throw new HttpError(400, "Nomi va narxini kiriting.");
  const x = { id: rid("p"), n, k: ["Restoran", "Kafe", "Fast food"].includes(body.k) ? body.k : "Restoran", p, r: Math.min(5, Math.max(1, r)), rv: 1, d: [+(Math.random() * 2 + 0.3).toFixed(1), +(Math.random() * 2 + 0.3).toFixed(1)] };
  db.places.push(x);
  save();
  return x;
}, ADMIN);
route("DELETE", "/api/admin/places/:id", ({ params }) => { db.places = db.places.filter((x) => x.id !== params.id); save(); return { ok: true }; }, ADMIN);
route("POST", "/api/admin/jobs", ({ body }) => {
  const t = str(body.t, 100), sal = str(body.sal, 60);
  if (!t || !sal) throw new HttpError(400, "Lavozim va maoshni kiriting.");
  const x = { id: rid("j"), t, c: str(body.c, 100), sal, z: ["Onlayn", "UZ", "Xorij"].includes(body.z) ? body.z : "Onlayn", tags: (Array.isArray(body.tags) ? body.tags : []).slice(0, 6).map((s) => str(s, 30)).filter(Boolean) };
  db.jobs.push(x);
  save();
  return x;
}, ADMIN);
route("DELETE", "/api/admin/jobs/:id", ({ params }) => { db.jobs = db.jobs.filter((x) => x.id !== params.id); save(); return { ok: true }; }, ADMIN);
route("PUT", "/api/admin/notice", ({ body }) => { db.notice = str(body.text, 300); save(); return { ok: true }; }, ADMIN);

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0, big = false;
    const chunks = [];
    req.on("data", (c) => { size += c.length; if (size > 1_000_000) big = true; else chunks.push(c); });
    req.on("end", () => {
      if (big) return reject(new HttpError(413, "Maʼlumot juda katta."));
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")) || {}); } catch { reject(new HttpError(400, "JSON notoʻgʻri.")); }
    });
    req.on("error", reject);
  });
}
function json(res, status, obj) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(obj));
}
async function handleApi(req, res, pathname) {
  try {
    const r = routes.find((x) => x.m === req.method && x.re.test(pathname));
    if (!r) return json(res, 404, { error: "Topilmadi." });
    const params = pathname.match(r.re).groups || {};
    const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress || "?";
    let user = null;
    if (r.auth) {
      user = userFromReq(req);
      if (!user) throw new HttpError(401, "Qaytadan kiring.");
      if (r.admin && user.role !== "admin") throw new HttpError(403, "Ruxsat yoʻq.");
    }
    const body = ["POST", "PUT", "PATCH"].includes(req.method) ? await readBody(req) : {};
    json(res, 200, await r.h({ req, res, body, params, user, ip }));
  } catch (e) {
    if (e instanceof HttpError) return json(res, e.status, { error: e.message });
    console.error(e);
    json(res, 500, { error: "Server xatosi." });
  }
}

/* ---------------- Frontend (statik yoki Vite) ---------------- */
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".map": "application/json; charset=utf-8" };
function sendFile(res, file) {
  const headers = { "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream", "X-Content-Type-Options": "nosniff" };
  headers["Cache-Control"] = file.includes(path.sep + "assets" + path.sep) ? "public, max-age=31536000, immutable" : "no-cache";
  res.writeHead(200, headers);
  fs.createReadStream(file).on("error", () => res.end()).pipe(res);
}
function serveStatic(req, res, pathname) {
  const target = path.normalize(path.join(DIST, decodeURIComponent(pathname)));
  if (target !== DIST && !target.startsWith(DIST + path.sep)) { res.writeHead(403); return res.end("Forbidden"); }
  if (fs.existsSync(target) && fs.statSync(target).isFile()) return sendFile(res, target);
  if (path.extname(pathname)) { res.writeHead(404, { "Content-Type": "text/plain" }); return res.end("Not found"); }
  sendFile(res, path.join(DIST, "index.html"));
}

let vite = null;
if (DEV) {
  const { createServer } = await import("vite");
  vite = await createServer({ server: { middlewareMode: true }, appType: "spa" });
} else if (!fs.existsSync(path.join(DIST, "index.html"))) {
  console.error('dist/index.html topilmadi. Avval "npm run build" ni ishga tushiring.');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = new URL(req.url || "/", "http://localhost").pathname; } catch { res.writeHead(400); return res.end("Bad request"); }
  if (pathname === "/health") { res.writeHead(200, { "Content-Type": "text/plain" }); return res.end("ok"); }
  if (pathname.startsWith("/api/") || pathname === "/api") return handleApi(req, res, pathname);
  if (vite) return vite.middlewares(req, res, () => { res.writeHead(404); res.end("Not found"); });
  try { serveStatic(req, res, pathname); } catch { res.writeHead(400); res.end("Bad request"); }
});
server.listen(PORT, "0.0.0.0", () => console.log(`StartApp ${PORT}-portda ishlayapti ${DEV ? "(dev)" : ""} | baza: ${DB_FILE}`));
