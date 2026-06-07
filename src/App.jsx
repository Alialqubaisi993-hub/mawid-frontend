import React, { useState, useEffect, useCallback } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

const S = {
  app: {
    minHeight: "100vh",
    background: "#0c0c0c",
    fontFamily: "'Cairo', 'Segoe UI', sans-serif",
    direction: "rtl",
    color: "#fff",
  },
  header: {
    background: "#141414",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: "20px",
    fontWeight: "900",
    background: "#c9a84c",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  container: { maxWidth: "480px", margin: "0 auto", padding: "24px 16px" },
  card: {
    background: "#141414",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "24px",
    marginBottom: "16px",
  },
  sectionTitle: {
    fontSize: "11px",
    color: "#c9a84c",
    fontWeight: "700",
    marginBottom: "14px",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    background: "#1a1a1a",
    border: "1px solid rgba(201,168,76,0.2)",
    borderRadius: "12px",
    padding: "12px 16px",
    color: "#fff",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    marginBottom: "10px",
    boxSizing: "border-box",
    direction: "rtl",
  },
  btn: {
    width: "100%",
    padding: "13px",
    borderRadius: "12px",
    border: "none",
    background: "#c9a84c",
    color: "#0c0c0c",
    fontSize: "15px",
    fontWeight: "800",
    fontFamily: "inherit",
    cursor: "pointer",
  },
  btnGhost: {
    background: "#1a1a1a",
    border: "1px solid rgba(201,168,76,0.2)",
    color: "#888",
    padding: "8px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    fontFamily: "inherit",
  },
  btnDanger: {
    background: "rgba(255,80,80,0.1)",
    border: "1px solid rgba(255,80,80,0.3)",
    color: "#ff6060",
    padding: "7px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
    fontFamily: "inherit",
  },
  btnSuccess: {
    background: "rgba(37,211,102,0.1)",
    border: "1px solid rgba(37,211,102,0.3)",
    color: "#25d166",
    padding: "7px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
    fontFamily: "inherit",
  },
  statGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" },
  statCard: {
    background: "#141414",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "14px",
    padding: "16px",
    textAlign: "center",
  },
  statNum: { fontSize: "28px", fontWeight: "900", color: "#c9a84c" },
  statLabel: { fontSize: "11px", color: "#888", marginTop: "4px" },
  error: {
    background: "rgba(255,80,80,0.1)",
    border: "1px solid rgba(255,80,80,0.3)",
    borderRadius: "10px",
    padding: "10px 14px",
    color: "#ff6060",
    fontSize: "13px",
    marginBottom: "10px",
  },
  success: {
    background: "rgba(37,211,102,0.1)",
    border: "1px solid rgba(37,211,102,0.3)",
    borderRadius: "10px",
    padding: "10px 14px",
    color: "#25d166",
    fontSize: "13px",
    marginBottom: "10px",
  },
};

const badge = (color) => ({
  padding: "4px 10px",
  borderRadius: "20px",
  fontSize: "11px",
  fontWeight: "700",
  background: color === "green" ? "rgba(37,211,102,0.15)" : color === "orange" ? "rgba(255,150,50,0.15)" : "rgba(201,168,76,0.12)",
  border: `1px solid ${color === "green" ? "rgba(37,211,102,0.4)" : color === "orange" ? "rgba(255,150,50,0.4)" : "rgba(255,255,255,0.12)"}`,
  color: color === "green" ? "#25d166" : color === "orange" ? "#ff9632" : "#aaa",
});

async function api(path, method = "GET", body = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(API + path, { method, headers, body: body ? JSON.stringify(body) : null });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "خطأ في الخادم");
  return data;
}

function getSlugFromUrl() {
  const path = window.location.pathname;
  const match = path.match(/^\/book\/(.+)$/);
  return match ? match[1] : null;
}

export default function App() {
  const [auth, setAuth] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mawid_auth") || "null"); } catch { return null; }
  });
  const [page, setPage] = useState(() => {
    const slug = getSlugFromUrl();
    if (slug) return "book:" + slug;
    try {
      const a = JSON.parse(localStorage.getItem("mawid_auth") || "null");
      if (a) return a.user.role === "admin" ? "admin" : "owner";
    } catch {}
    return "home";
  });

  useEffect(() => {
    if (auth) {
      localStorage.setItem("mawid_auth", JSON.stringify(auth));
      if (!page.startsWith("book:")) setPage(auth.user.role === "admin" ? "admin" : "owner");
    } else {
      localStorage.removeItem("mawid_auth");
      if (!page.startsWith("book:")) setPage("home");
    }
  }, [auth]);

  const logout = () => setAuth(null);

  if (page.startsWith("book:")) return <BookingPage slug={page.split(":")[1]} />;

  return (
    <div style={S.app}>
      <header style={S.header}>
        <div style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start" }} onClick={() => !auth && setPage("home")}>
          <div style={{ fontSize: "16px", fontWeight: "900", color: "#c9a84c", letterSpacing: "3px" }}>MAWIDS</div>
          <div style={{ fontSize: "9px", color: "#555", letterSpacing: "2px", marginTop: "1px" }}>مَوعِد</div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {!auth && <>
            <button style={S.btnGhost} onClick={() => setPage("login")}>دخول</button>
            <button style={{ ...S.btnGhost, color: "#c9a84c", borderColor: "rgba(255,210,0,0.3)" }} onClick={() => setPage("register")}>سجّل نشاطك</button>
          </>}
          {auth && <button style={S.btnGhost} onClick={logout}>خروج ↩</button>}
        </div>
      </header>
      {page === "home" && <LandingPage onLogin={() => setPage("login")} onRegister={() => setPage("register")} />}
      {page === "login" && <LoginPage onAuth={setAuth} onRegister={() => setPage("register")} />}
      {page === "register" && <RegisterPage onBack={() => setPage("login")} />}
      {page === "admin" && auth?.user.role === "admin" && <AdminDashboard token={auth.token} />}
      {page === "owner" && auth?.user.role === "owner" && <OwnerDashboard token={auth.token} user={auth.user} initSaloon={auth.saloon} />}
    </div>
  );
}


function LandingPage({ onLogin, onRegister }) {
  const features = [
    { icon: "📅", ar: "حجز ذكي", en: "Smart Booking", descAr: "زبائنك يحجزون بدون اتصال أو انتظار", descEn: "Clients book instantly without calls" },
    { icon: "💰", ar: "إحصائيات مالية", en: "Financial Stats", descAr: "تتبع حجوزاتك وإيراداتك لحظة بلحظة", descEn: "Track bookings and revenue in real-time" },
    { icon: "🔔", ar: "إشعارات فورية", en: "Instant Alerts", descAr: "إشعار واتساب لكل حجز جديد", descEn: "WhatsApp notification for every booking" },
  ];
  const categories = [
    { icon: "💇", ar: "صالونات الحلاقة", en: "Hair Salons" },
    { icon: "🏋️", ar: "مدربو الجيم", en: "Gym Trainers" },
    { icon: "🎯", ar: "لايف كوتش", en: "Life Coaches" },
    { icon: "💼", ar: "رجال الأعمال", en: "Business Owners" },
  ];
  const [lang, setLang] = React.useState("ar");
  const ar = lang === "ar";

  return (
    <div style={{ direction: ar ? "rtl" : "ltr" }}>
      {/* زر تبديل اللغة */}
      <div style={{ display: "flex", justifyContent: ar ? "flex-start" : "flex-end", padding: "8px 24px" }}>
        <button style={{ ...S.btnGhost, fontSize: "12px", padding: "5px 12px" }} onClick={() => setLang(ar ? "en" : "ar")}>
          {ar ? "English" : "عربي"}
        </button>
      </div>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "40px 24px 32px" }}>
        <div style={{ display: "inline-block", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "20px", padding: "6px 16px", fontSize: "12px", color: "#c9a84c", marginBottom: "20px" }}>
          {ar ? "منصة إدارة الحجوزات" : "Booking Management Platform"}
        </div>
        <h1 style={{ fontSize: "36px", fontWeight: "900", lineHeight: "1.4", margin: "0 0 16px", color: "#fff" }}>
          {ar ? <>لا تنسَ موعدك<br/><span style={{ background: "#c9a84c", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>نحن ننظّمه لك</span></> : <><span style={{ background: "#c9a84c", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Never miss</span><br/>an appointment</>}
        </h1>
        <p style={{ fontSize: "14px", color: "#888", maxWidth: "380px", margin: "0 auto 28px", lineHeight: "1.8" }}>
          {ar ? "منصة احترافية لإدارة الحجوزات للأنشطة التجارية والمدربين والكوتش وأصحاب الأعمال" : "A professional platform for managing bookings for salons, trainers, coaches and businesses"}
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button style={S.btn} onClick={onRegister}>{ar ? "سجّل نشاطك مجاناً ←" : "Register for free →"}</button>
          <button style={S.btnGhost} onClick={onLogin}>{ar ? "تسجيل الدخول" : "Sign in"}</button>
        </div>
      </div>

      {/* المميزات */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", padding: "0 20px 32px" }}>
        {features.map((f, i) => (
          <div key={i} style={{ ...S.card, textAlign: "center", padding: "16px 12px", marginBottom: 0 }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>{f.icon}</div>
            <div style={{ fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>{ar ? f.ar : f.en}</div>
            <div style={{ fontSize: "11px", color: "#888", lineHeight: "1.7" }}>{ar ? f.descAr : f.descEn}</div>
          </div>
        ))}
      </div>

      {/* مناسب لكل نشاط */}
      <div style={{ padding: "0 20px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "18px", fontWeight: "900", marginBottom: "6px" }}>{ar ? "مناسب لكل نشاط تجاري" : "For every business"}</div>
          <div style={{ fontSize: "13px", color: "#888" }}>{ar ? "أنشطة — مدربون — كوتش — وأكثر" : "Salons — Trainers — Coaches — and more"}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "10px" }}>
          {categories.map((c, i) => (
            <div key={i} style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "22px" }}>{c.icon}</span>
              <span style={{ fontSize: "13px", fontWeight: "700" }}>{ar ? c.ar : c.en}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", padding: "28px 24px 32px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: "20px", fontWeight: "900", marginBottom: "8px" }}>{ar ? "جاهز تبدأ؟" : "Ready to start?"}</div>
        <div style={{ fontSize: "13px", color: "#888", marginBottom: "20px" }}>{ar ? "سجّل نشاطك الآن وابدأ تستقبل حجوزات" : "Register now and start accepting bookings"}</div>
        <button style={S.btn} onClick={onRegister}>{ar ? "ابدأ مجاناً ←" : "Start for free →"}</button>
      </div>

      {/* فوتر */}
      <div style={{ textAlign: "center", padding: "16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ fontSize: "12px", color: "#444" }}>© 2025 Mawids.com</div>
        <div style={{ marginTop: "8px" }}>
          <a href="https://wa.me/971XXXXXXXXX" target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "#25d166", textDecoration: "none" }}>
            💬 {ar ? "تواصل معنا" : "Contact us"}
          </a>
        </div>
      </div>
    </div>
  );
}

function LoginPage({ onAuth, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) return setError("أدخل البريد وكلمة المرور");
    setLoading(true); setError("");
    try {
      const data = await api("/auth/login", "POST", { email, password });
      onAuth(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={S.container}>
      <div style={{ textAlign: "center", marginBottom: "28px", paddingTop: "16px" }}>
        <div style={{ fontSize: "32px", fontWeight: "900", marginBottom: "6px" }}>أهلاً بك 👋</div>
        <div style={{ fontSize: "13px", color: "#888" }}>سجّل دخولك لإدارة نشاطك</div>
      </div>
      <div style={S.card}>
        {error && <div style={S.error}>{error}</div>}
        <div style={S.sectionTitle}>بيانات الدخول</div>
        <input style={S.input} type="email" placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} />
        <input style={S.input} type="password" placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
        <button style={S.btn} onClick={login} disabled={loading}>{loading ? "جارٍ الدخول..." : "دخول ←"}</button>
        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "#888" }}>
          ما عندك حساب؟{" "}
          <span style={{ color: "#c9a84c", cursor: "pointer", fontWeight: "700" }} onClick={onRegister}>سجّل نشاطك مجاناً</span>
        </div>
      </div>
      <div style={{ ...S.card, background: "rgba(37,211,102,0.05)", border: "1px solid rgba(37,211,102,0.15)", textAlign: "center" }}>
        <div style={{ fontSize: "13px", color: "#888", marginBottom: "12px" }}>هل تريد تسجيل نشاطك؟ تواصل معنا</div>
        <a href="https://wa.me/971XXXXXXXXX?text=أهلاً، أريد تسجيل نشاطي في مَوعِد" target="_blank" rel="noreferrer"
          style={{ display: "inline-block", background: "linear-gradient(135deg,#25d166,#128C7E)", color: "#fff", padding: "10px 24px", borderRadius: "12px", textDecoration: "none", fontSize: "14px", fontWeight: "700" }}>
          💬 تواصل عبر واتساب
        </a>
      </div>
    </div>
  );
}

function RegisterPage({ onBack }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", activityName: "", phone: "", city: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name || !form.email || !form.password || !form.activityName || !form.phone) return setError("جميع الحقول مطلوبة");
    setLoading(true); setError("");
    try { await api("/auth/register", "POST", form); setDone(true); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  if (done) return (
    <div style={S.container}>
      <div style={{ ...S.card, textAlign: "center", padding: "40px 24px" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#c9a84c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 20px" }}>✓</div>
        <div style={{ fontSize: "22px", fontWeight: "800", marginBottom: "8px" }}>تم إرسال الطلب!</div>
        <div style={{ fontSize: "13px", color: "#888", lineHeight: "1.8" }}>سيتواصل معك فريق مَوعِد خلال 24 ساعة<br />لتفعيل حسابك وإرسال رابط الحجز الخاص بنشاطك 🎉</div>
        <button style={{ ...S.btn, marginTop: "24px" }} onClick={onBack}>رجوع للدخول</button>
      </div>
    </div>
  );

  return (
    <div style={S.container}>
      <div style={{ textAlign: "center", marginBottom: "24px", paddingTop: "16px" }}>
        <div style={{ fontSize: "26px", fontWeight: "900" }}>سجّل نشاطك 🏪</div>
        <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>مجاني تماماً في البداية</div>
      </div>
      <div style={S.card}>
        {error && <div style={S.error}>{error}</div>}
        <div style={S.sectionTitle}>بيانات الحساب</div>
        <input style={S.input} placeholder="اسمك" value={form.name} onChange={f("name")} />
        <input style={S.input} type="email" placeholder="البريد الإلكتروني" value={form.email} onChange={f("email")} />
        <input style={S.input} type="password" placeholder="كلمة المرور" value={form.password} onChange={f("password")} />
        <div style={{ ...S.sectionTitle, marginTop: "8px" }}>بيانات النشاط</div>
        <input style={S.input} placeholder="اسم النشاط" value={form.activityName} onChange={f("activityName")} />
        <input style={S.input} placeholder="رقم الجوال (واتساب)" value={form.phone} onChange={f("phone")} type="tel" />
        <input style={S.input} placeholder="المدينة (أبوظبي، دبي...)" value={form.city} onChange={f("city")} />
        <button style={S.btn} onClick={submit} disabled={loading}>{loading ? "جارٍ الإرسال..." : "إرسال الطلب ✓"}</button>
        <div style={{ textAlign: "center", marginTop: "14px", fontSize: "13px" }}>
          <span style={{ color: "#888", cursor: "pointer" }} onClick={onBack}>← رجوع للدخول</span>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ token }) {
  const [saloons, setSaloons] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingSaloon, setEditingSaloon] = useState(null);
  const [msg, setMsg] = useState("");
  const [adminTab, setAdminTab] = useState("saloons"); // saloons | users

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, st] = await Promise.all([
        api("/admin/saloons", "GET", null, token),
        api("/admin/stats", "GET", null, token),
      ]);
      setSaloons(s); setStats(st);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id, status) => {
    await api(`/admin/saloons/${id}/status`, "PATCH", { status }, token);
    load();
  };

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(""), 2500); };

  // إذا كان المدير يعدّل صالون
  if (editingSaloon) {
    return (
      <AdminSaloonEditor
        saloon={editingSaloon}
        token={token}
        onBack={() => { setEditingSaloon(null); load(); }}
        onMsg={showMsg}
      />
    );
  }

  const tabStyle = active => ({
    flex: 1, padding: "10px", borderRadius: "10px", border: "none",
    background: active ? "#c9a84c" : "#141414",
    color: active ? "#0c0c0c" : "#888", fontFamily: "inherit", fontSize: "12px", fontWeight: "700", cursor: "pointer",
  });

  return (
    <div style={S.container}>
      <div style={{ marginBottom: "16px", paddingTop: "8px" }}>
        <div style={{ fontSize: "22px", fontWeight: "900" }}>لوحة المدير ⚙️</div>
        <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>إدارة جميع الأنشطة</div>
      </div>

      {msg && <div style={S.success}>{msg}</div>}

      {/* إحصائيات */}
      <div style={S.statGrid}>
        <div style={S.statCard}><div style={S.statNum}>{stats.total || 0}</div><div style={S.statLabel}>إجمالي الأنشطة</div></div>
        <div style={S.statCard}><div style={{ ...S.statNum, color: "#25d166" }}>{stats.active || 0}</div><div style={S.statLabel}>نشطة</div></div>
        <div style={S.statCard}><div style={{ ...S.statNum, color: "#ff9632" }}>{stats.pending || 0}</div><div style={S.statLabel}>تنتظر الموافقة</div></div>
        <div style={S.statCard}><div style={S.statNum}>{stats.totalBookings || 0}</div><div style={S.statLabel}>إجمالي الحجوزات</div></div>
      </div>

      {/* إحصائيات مالية */}
      <div style={{ ...S.card, background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)", marginBottom: "16px" }}>
        <div style={S.sectionTitle}>💰 الإحصائيات المالية</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "26px", fontWeight: "900", color: "#c9a84c" }}>{stats.totalBookings || 0}</div>
            <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>إجمالي الحجوزات</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "26px", fontWeight: "900", color: "#25d166" }}>{(stats.totalAmount || 0).toLocaleString()} <span style={{ fontSize: "13px" }}>د.إ</span></div>
            <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>إجمالي المبالغ</div>
          </div>
        </div>
      </div>

      {/* تابات */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button style={tabStyle(adminTab === "saloons")} onClick={() => setAdminTab("saloons")}>الأنشطة</button>
        <button style={tabStyle(adminTab === "users")} onClick={() => setAdminTab("users")}>المستخدمين</button>
      </div>

      {adminTab === "saloons" && (
        loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>جارٍ التحميل...</div>
        ) : (
          <div style={S.card}>
            <div style={S.sectionTitle}>الأنشطة المسجلة ({saloons.length})</div>
            {saloons.length === 0 && <div style={{ color: "#888", fontSize: "13px", textAlign: "center", padding: "20px" }}>لا توجد أنشطة بعد</div>}
            {saloons.map(s => (
              <div key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "14px", marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: "800" }}>{s.name}</div>
                    <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{s.owner_name} — {s.city}</div>
                    <div style={{ fontSize: "11px", color: "#555", marginTop: "3px" }}>mawids.com/book/{s.slug}</div>
                  </div>
                  <span style={badge(s.status === "active" ? "green" : s.status === "pending" ? "orange" : "")}>
                    {s.status === "active" ? "نشط" : s.status === "pending" ? "معلق" : "موقوف"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ ...badge(""), fontSize: "11px" }}>📋 {s.bookings || 0} حجز</span>
                  <span style={{ ...badge("green"), fontSize: "11px" }}>💰 {(s.totalAmount || 0).toLocaleString()} د.إ</span>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {s.status === "pending" && <button style={S.btnSuccess} onClick={() => setStatus(s.id, "active")}>✓ تفعيل</button>}
                  {s.status === "active" && <button style={S.btnDanger} onClick={() => setStatus(s.id, "suspended")}>⏸ إيقاف</button>}
                  {s.status === "suspended" && <button style={S.btnSuccess} onClick={() => setStatus(s.id, "active")}>▶ إعادة تفعيل</button>}
                  <button style={{ ...S.btnGhost, fontSize: "12px", padding: "7px 14px" }} onClick={() => setEditingSaloon(s)}>✏️ تعديل الخدمات والأوقات</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {adminTab === "users" && <UsersManager token={token} onMsg={showMsg} />}
    </div>
  );
}


function UsersManager({ token, onMsg }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "owner" });
  const [editUser, setEditUser] = useState(null);
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const load = async () => {
    setLoading(true);
    try { const u = await api("/admin/users", "GET", null, token); setUsers(u); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const addUser = async () => {
    if (!form.name || !form.email || !form.password) return;
    try {
      await api("/admin/users", "POST", form, token);
      setForm({ name: "", email: "", password: "", role: "owner" });
      setShowAdd(false);
      onMsg("✓ تم إضافة المستخدم");
      load();
    } catch (e) { onMsg("❌ " + e.message); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("هل تريد حذف هذا المستخدم؟")) return;
    try {
      await api(`/admin/users/${id}`, "DELETE", null, token);
      onMsg("✓ تم حذف المستخدم");
      load();
    } catch (e) { onMsg("❌ " + e.message); }
  };

  const resetPassword = async (id, newPass) => {
    if (!newPass) return;
    try {
      await api(`/admin/users/${id}/password`, "PATCH", { password: newPass }, token);
      setEditUser(null);
      onMsg("✓ تم تغيير كلمة المرور");
    } catch (e) { onMsg("❌ " + e.message); }
  };

  return (
    <div style={S.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <div style={S.sectionTitle}>المستخدمين ({users.length})</div>
        <button style={{ ...S.btnSuccess, fontSize: "12px" }} onClick={() => setShowAdd(!showAdd)}>+ إضافة</button>
      </div>

      {showAdd && (
        <div style={{ background: "#141414", borderRadius: "12px", padding: "16px", marginBottom: "14px", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: "12px", color: "#c9a84c", fontWeight: "700", marginBottom: "10px" }}>مستخدم جديد</div>
          <input style={S.input} placeholder="الاسم" value={form.name} onChange={f("name")} />
          <input style={S.input} placeholder="البريد الإلكتروني" type="email" value={form.email} onChange={f("email")} />
          <input style={S.input} placeholder="كلمة المرور" type="password" value={form.password} onChange={f("password")} />
          <select style={{ ...S.input, marginBottom: "10px" }} value={form.role} onChange={f("role")}>
            <option value="owner">صاحب نشاط</option>
            <option value="admin">مدير</option>
          </select>
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={{ ...S.btn, flex: 1 }} onClick={addUser}>حفظ ✓</button>
            <button style={{ ...S.btnGhost, flex: 1 }} onClick={() => setShowAdd(false)}>إلغاء</button>
          </div>
        </div>
      )}

      {loading && <div style={{ color: "#888", fontSize: "13px", textAlign: "center", padding: "20px" }}>جارٍ التحميل...</div>}
      {!loading && users.length === 0 && <div style={{ color: "#888", fontSize: "13px", textAlign: "center", padding: "20px" }}>لا يوجد مستخدمون</div>}
      {users.map(u => (
        <div key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px", marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "700" }}>{u.name}</div>
              <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{u.email}</div>
            </div>
            <span style={badge(u.role === "admin" ? "orange" : "green")}>{u.role === "admin" ? "مدير" : "صاحب نشاط"}</span>
          </div>
          {editUser === u.id && (
            <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
              <input style={{ ...S.input, marginBottom: "0", flex: 1 }} placeholder="كلمة مرور جديدة" type="password"
                id={`pw_${u.id}`} />
              <button style={S.btnSuccess} onClick={() => resetPassword(u.id, document.getElementById(`pw_${u.id}`).value)}>✓</button>
              <button style={S.btnGhost} onClick={() => setEditUser(null)}>✕</button>
            </div>
          )}
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <button style={{ ...S.btnGhost, fontSize: "11px", padding: "6px 12px" }} onClick={() => setEditUser(editUser === u.id ? null : u.id)}>🔑 تغيير كلمة المرور</button>
            {u.role !== "admin" && <button style={{ ...S.btnDanger, fontSize: "11px" }} onClick={() => deleteUser(u.id)}>🗑️ حذف</button>}
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminSaloonEditor({ saloon, token, onBack, onMsg }) {
  const [tab, setTab] = useState("services");
  const [services, setServices] = useState(saloon.services || []);
  const [days, setDays] = useState(saloon.work_days || []);
  const [times, setTimes] = useState(saloon.time_slots || []);
  const [loading, setLoading] = useState(false);

  const ALL_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const DEFAULT_TIMES = [
    "12:00 ص","12:30 ص",
    "1:00 ص","1:30 ص","2:00 ص","2:30 ص","3:00 ص","3:30 ص",
    "4:00 ص","4:30 ص","5:00 ص","5:30 ص","6:00 ص","6:30 ص",
    "7:00 ص","7:30 ص","8:00 ص","8:30 ص","9:00 ص","9:30 ص",
    "10:00 ص","10:30 ص","11:00 ص","11:30 ص",
    "12:00 م","12:30 م",
    "1:00 م","1:30 م","2:00 م","2:30 م","3:00 م","3:30 م",
    "4:00 م","4:30 م","5:00 م","5:30 م","6:00 م","6:30 م",
    "7:00 م","7:30 م","8:00 م","8:30 م","9:00 م","9:30 م",
    "10:00 م","10:30 م","11:00 م","11:30 م"
  ];

  const tabStyle = active => ({
    flex: 1, padding: "10px", borderRadius: "10px", border: "none",
    background: active ? "#c9a84c" : "#141414",
    color: active ? "#0c0c0c" : "#888", fontFamily: "inherit", fontSize: "12px", fontWeight: "700", cursor: "pointer",
  });

  const saveServices = async () => {
    setLoading(true);
    try {
      await api(`/admin/saloons/${saloon.id}/services`, "PUT", { services }, token);
      onMsg("✓ تم حفظ الخدمات");
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const saveTimes = async () => {
    setLoading(true);
    try {
      await api(`/admin/saloons/${saloon.id}/timeslots`, "PUT", { timeSlots: times, workDays: days }, token);
      onMsg("✓ تم حفظ الأوقات");
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div style={S.container}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", paddingTop: "8px" }}>
        <button style={S.btnGhost} onClick={onBack}>← رجوع</button>
        <div>
          <div style={{ fontSize: "18px", fontWeight: "900" }}>{saloon.name}</div>
          <div style={{ fontSize: "12px", color: "#888" }}>تعديل الخدمات والأوقات</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button style={tabStyle(tab === "services")} onClick={() => setTab("services")}>الخدمات</button>
        <button style={tabStyle(tab === "times")} onClick={() => setTab("times")}>الأوقات</button>
      </div>

      {tab === "services" && (
        <div style={S.card}>
          <div style={S.sectionTitle}>الخدمات والأسعار</div>
          {services.map(s => (
            <div key={s.id} style={{ marginBottom: "12px", padding: "12px", background: "#141414", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <input style={{ ...S.input, marginBottom: "6px" }} placeholder="اسم الخدمة" value={s.name} onChange={e => setServices(p => p.map(x => x.id === s.id ? { ...x, name: e.target.value } : x))} />
              <div style={{ display: "flex", gap: "8px" }}>
                <input style={{ ...S.input, marginBottom: "0", flex: 1 }} placeholder="المدة" value={s.duration} onChange={e => setServices(p => p.map(x => x.id === s.id ? { ...x, duration: e.target.value } : x))} />
                <input style={{ ...S.input, marginBottom: "0", flex: 1 }} placeholder="السعر (د.إ)" value={s.price} onChange={e => setServices(p => p.map(x => x.id === s.id ? { ...x, price: e.target.value } : x))} />
                <button style={{ ...S.btnDanger, alignSelf: "stretch" }} onClick={() => setServices(p => p.filter(x => x.id !== s.id))}>✕</button>
              </div>
            </div>
          ))}
          <button style={{ ...S.btnGhost, width: "100%", marginBottom: "10px", color: "#c9a84c" }} onClick={() => setServices(p => [...p, { id: Date.now().toString(), name: "", duration: "30 دقيقة", price: "" }])}>+ إضافة خدمة</button>
          <button style={S.btn} onClick={saveServices} disabled={loading}>{loading ? "جارٍ الحفظ..." : "حفظ الخدمات ✓"}</button>
        </div>
      )}

      {tab === "times" && (
        <div style={S.card}>
          <div style={S.sectionTitle}>أيام العمل</div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
            {ALL_DAYS.map(d => (
              <button key={d} style={{ padding: "7px 14px", borderRadius: "10px", border: days.includes(d) ? "1px solid #f7971e" : "1px solid rgba(255,255,255,0.1)", background: days.includes(d) ? "rgba(201,168,76,0.2)" : "#141414", color: days.includes(d) ? "#c9a84c" : "#ccc", cursor: "pointer", fontSize: "13px", fontWeight: "600", fontFamily: "inherit" }}
                onClick={() => setDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])}>{d}</button>
            ))}
          </div>
          <div style={S.sectionTitle}>أوقات المواعيد</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", marginBottom: "16px" }}>
            {DEFAULT_TIMES.map(t => (
              <button key={t} style={{ padding: "9px", borderRadius: "9px", border: times.includes(t) ? "1px solid #f7971e" : "1px solid rgba(255,255,255,0.08)", background: times.includes(t) ? "rgba(201,168,76,0.2)" : "#141414", color: times.includes(t) ? "#c9a84c" : "#888", cursor: "pointer", fontSize: "12px", fontWeight: "600", fontFamily: "inherit", textAlign: "center" }}
                onClick={() => setTimes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])}>{t}</button>
            ))}
          </div>
          <button style={S.btn} onClick={saveTimes} disabled={loading}>{loading ? "جارٍ الحفظ..." : "حفظ الأوقات ✓"}</button>
        </div>
      )}
    </div>
  );
}

function OwnerDashboard({ token, user, initSaloon }) {
  const [saloon, setSaloon] = useState(initSaloon);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState("bookings");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, b] = await Promise.all([
        api("/owner/saloon", "GET", null, token),
        api("/owner/bookings", "GET", null, token),
      ]);
      setSaloon(s); setBookings(b);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/book/${saloon?.slug}`).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  const tabStyle = active => ({
    flex: 1, padding: "10px", borderRadius: "10px", border: "none",
    background: active ? "#c9a84c" : "#141414",
    color: active ? "#0c0c0c" : "#888", fontFamily: "inherit", fontSize: "12px", fontWeight: "700", cursor: "pointer",
  });

  if (!saloon && !loading) return (
    <div style={S.container}>
      <div style={{ ...S.card, textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>⏳</div>
        <div style={{ fontWeight: "800", fontSize: "18px" }}>الحساب قيد المراجعة</div>
        <div style={{ color: "#888", fontSize: "13px", marginTop: "8px" }}>سيتواصل معك المدير لتفعيل نشاطك</div>
      </div>
    </div>
  );

  return (
    <div style={S.container}>
      <div style={{ paddingTop: "8px", marginBottom: "16px" }}>
        <div style={{ fontSize: "18px", fontWeight: "900" }}>{saloon?.name || "..."}</div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
          <span style={badge(saloon?.status === "active" ? "green" : "orange")}>
            {saloon?.status === "active" ? "نشط ✓" : "غير مفعّل"}
          </span>
          <span style={{ fontSize: "12px", color: "#888" }}>مرحباً {user.name}</span>
        </div>
      </div>

      {saloon?.status === "active" && (
        <div style={{ ...S.card, background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)" }}>
          <div style={S.sectionTitle}>رابط الحجز الخاص بنشاطك</div>
          <div style={{ fontSize: "13px", color: "#c9a84c", wordBreak: "break-all", marginBottom: "10px", lineHeight: "1.6" }}>
            {window.location.origin}/book/{saloon.slug}
          </div>
          <button style={{ ...S.btn, padding: "10px", fontSize: "13px" }} onClick={copyLink}>
            {copied ? "✓ تم النسخ!" : "📋 نسخ الرابط"}
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button style={tabStyle(tab === "bookings")} onClick={() => setTab("bookings")}>المواعيد</button>
        <button style={tabStyle(tab === "services")} onClick={() => setTab("services")}>الخدمات</button>
        <button style={tabStyle(tab === "times")} onClick={() => setTab("times")}>الأوقات</button>
        <button style={tabStyle(tab === "report")} onClick={() => setTab("report")}>📊 تقرير</button>
      </div>

      {msg && <div style={S.success}>{msg}</div>}

      {tab === "bookings" && (
        <div style={S.card}>
          <div style={S.sectionTitle}>المواعيد ({bookings.length})</div>
          {loading && <div style={{ color: "#888", fontSize: "13px", textAlign: "center", padding: "20px" }}>جارٍ التحميل...</div>}
          {!loading && bookings.length === 0 && <div style={{ color: "#888", fontSize: "13px", textAlign: "center", padding: "20px" }}>لا توجد مواعيد بعد</div>}
          {bookings.map(b => (
            <div key={b.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "14px", marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: "800" }}>{b.name}</div>
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{b.service} — {b.day}</div>
                </div>
                <span style={badge("green")}>{b.time}</span>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                <a href={`https://wa.me/${b.phone.replace(/^0/, "971").replace(/[^0-9]/g, "")}?text=${encodeURIComponent("أهلاً " + b.name + " 👋\nنذكّرك بموعدك:\n📋 " + b.service + "\n📅 " + b.day + " — " + b.time + "\nنتطلع لاستقبالك 🙏")}`} target="_blank" rel="noreferrer"
                  style={{ ...S.btnSuccess, textDecoration: "none" }}>💬 واتساب</a>
                <a href={`tel:+${b.phone.replace(/^0/, "971").replace(/[^0-9]/g, "")}`}
                  style={{ background: "rgba(100,160,255,0.1)", border: "1px solid rgba(100,160,255,0.3)", color: "#64a0ff", padding: "7px 14px", borderRadius: "8px", textDecoration: "none", fontSize: "12px", fontWeight: "700" }}>📞 اتصال</a>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "services" && saloon && (
        <ServicesEditor saloon={saloon} token={token} onSave={s => { setSaloon(s); setMsg("✓ تم حفظ الخدمات"); setTimeout(() => setMsg(""), 2500); }} />
      )}
      {tab === "times" && saloon && (
        <TimesEditor saloon={saloon} token={token} onSave={s => { setSaloon(s); setMsg("✓ تم حفظ الأوقات"); setTimeout(() => setMsg(""), 2500); }} />
      )}
      {tab === "report" && <FinancialReport token={token} />}
    </div>
  );
}

function FinancialReport({ token }) {
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api(`/owner/report?from=${from}&to=${to}`, "GET", null, token);
      setReport(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const quickRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days + 1);
    setFrom(start.toISOString().slice(0, 10));
    setTo(end.toISOString().slice(0, 10));
  };

  const downloadPDF = () => {
    if (!report) return;
    const rows = (report.bookings || []).map(b =>
      `<tr>
        <td style="padding:8px 12px; border-bottom:1px solid #eee;">${b.name}</td>
        <td style="padding:8px 12px; border-bottom:1px solid #eee;">${b.service}</td>
        <td style="padding:8px 12px; border-bottom:1px solid #eee;">${b.day} ${b.time}</td>
        <td style="padding:8px 12px; border-bottom:1px solid #eee;">${new Date(b.created_at).toLocaleDateString("ar-AE")}</td>
        <td style="padding:8px 12px; border-bottom:1px solid #eee; font-weight:bold; color:#f7971e;">${b.price || 0} د.إ</td>
      </tr>`
    ).join("");

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>التقرير المالي — مَوعِد</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
<style>
  body { font-family: 'Cairo', sans-serif; direction: rtl; padding: 40px; color: #1a1a1a; background: #fff; }
  h1 { font-size: 28px; font-weight: 900; color: #f7971e; margin: 0 0 4px; }
  .subtitle { font-size: 13px; color: #888; margin-bottom: 24px; }
  .period { font-size: 14px; color: #555; margin-bottom: 24px; }
  .summary { display: flex; gap: 16px; margin-bottom: 28px; }
  .summary-card { background: #f8f8f8; border-radius: 12px; padding: 16px 24px; flex: 1; text-align: center; border: 1px solid #eee; }
  .summary-num { font-size: 28px; font-weight: 900; color: #f7971e; }
  .summary-num.green { color: #25d166; }
  .summary-label { font-size: 12px; color: #888; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead { background: #1a1a2e; color: #fff; }
  thead th { padding: 10px 12px; text-align: right; font-weight: 700; }
  tbody tr:hover { background: #fafafa; }
  .footer { margin-top: 32px; text-align: center; font-size: 12px; color: #aaa; }
</style>
</head>
<body>
<h1>مَوعِد ✦ — التقرير المالي</h1>
<div class="subtitle">Mawids.com — منصة إدارة الحجوزات</div>
<div class="period">الفترة: من ${from} إلى ${to}</div>
<div class="summary">
  <div class="summary-card">
    <div class="summary-num">${report.totalBookings}</div>
    <div class="summary-label">إجمالي الحجوزات</div>
  </div>
  <div class="summary-card">
    <div class="summary-num green">${(report.totalAmount || 0).toLocaleString()} د.إ</div>
    <div class="summary-label">إجمالي المبالغ</div>
  </div>
</div>
<table>
  <thead>
    <tr>
      <th>اسم الزبون</th>
      <th>الخدمة</th>
      <th>الموعد</th>
      <th>التاريخ</th>
      <th>المبلغ</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
<div class="footer">تم إنشاء هذا التقرير بواسطة مَوعِد — ${new Date().toLocaleDateString("ar-AE")}</div>
</body>
</html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 800);
  };

  return (
    <div style={S.card}>
      <div style={S.sectionTitle}>📊 التقرير المالي</div>

      {/* أزرار سريعة */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
        <button style={{ ...S.btnGhost, fontSize: "11px", padding: "5px 10px" }} onClick={() => { quickRange(1); }}>اليوم</button>
        <button style={{ ...S.btnGhost, fontSize: "11px", padding: "5px 10px" }} onClick={() => { quickRange(7); }}>آخر 7 أيام</button>
        <button style={{ ...S.btnGhost, fontSize: "11px", padding: "5px 10px" }} onClick={() => { quickRange(30); }}>آخر 30 يوم</button>
        <button style={{ ...S.btnGhost, fontSize: "11px", padding: "5px 10px" }} onClick={() => { quickRange(90); }}>آخر 3 أشهر</button>
      </div>

      {/* اختيار التواريخ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
        <div>
          <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>من</div>
          <input type="date" style={S.input} value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div>
          <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>إلى</div>
          <input type="date" style={S.input} value={to} onChange={e => setTo(e.target.value)} />
        </div>
      </div>
      <button style={S.btn} onClick={load} disabled={loading}>{loading ? "جارٍ التحميل..." : "عرض التقرير ←"}</button>

      {report && (
        <div style={{ marginTop: "16px" }}>
          {/* ملخص */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
            <div style={{ ...S.statCard }}>
              <div style={{ ...S.statNum, fontSize: "22px" }}>{report.totalBookings}</div>
              <div style={S.statLabel}>إجمالي الحجوزات</div>
            </div>
            <div style={{ ...S.statCard }}>
              <div style={{ ...S.statNum, fontSize: "22px", color: "#25d166" }}>{(report.totalAmount || 0).toLocaleString()}</div>
              <div style={S.statLabel}>إجمالي المبالغ (د.إ)</div>
            </div>
          </div>

          {/* زر تحميل PDF */}
          <button style={{ ...S.btnGhost, width: "100%", marginBottom: "14px", color: "#c9a84c", borderColor: "rgba(255,210,0,0.3)" }} onClick={downloadPDF}>
            📄 تحميل التقرير PDF
          </button>

          {/* التفاصيل */}
          <div style={S.sectionTitle}>تفاصيل الحجوزات</div>
          {report.bookings?.length === 0 && (
            <div style={{ color: "#888", fontSize: "13px", textAlign: "center", padding: "20px" }}>لا توجد حجوزات في هذه الفترة</div>
          )}
          {report.bookings?.map(b => (
            <div key={b.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "10px", marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700" }}>{b.name}</div>
                  <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{b.service} — {b.day} {b.time}</div>
                  <div style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>{new Date(b.created_at).toLocaleDateString("ar-AE")}</div>
                </div>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#c9a84c" }}>{b.price || 0} د.إ</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ServicesEditor({ saloon, token, onSave }) {
  const [services, setServices] = useState(saloon.services || []);
  const [loading, setLoading] = useState(false);
  const add = () => setServices(p => [...p, { id: Date.now().toString(), name: "", duration: "30 دقيقة", price: "" }]);
  const remove = id => setServices(p => p.filter(s => s.id !== id));
  const update = (id, field, val) => setServices(p => p.map(s => s.id === id ? { ...s, [field]: val } : s));
  const save = async () => {
    setLoading(true);
    try { const u = await api("/owner/saloon/services", "PUT", { services }, token); onSave(u); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div style={S.card}>
      <div style={S.sectionTitle}>الخدمات والأسعار</div>
      {services.map(s => (
        <div key={s.id} style={{ marginBottom: "12px", padding: "12px", background: "#141414", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <input style={{ ...S.input, marginBottom: "6px" }} placeholder="اسم الخدمة" value={s.name} onChange={e => update(s.id, "name", e.target.value)} />
          <div style={{ display: "flex", gap: "8px" }}>
            <input style={{ ...S.input, marginBottom: "0", flex: 1 }} placeholder="المدة" value={s.duration} onChange={e => update(s.id, "duration", e.target.value)} />
            <input style={{ ...S.input, marginBottom: "0", flex: 1 }} placeholder="السعر (د.إ)" value={s.price} onChange={e => update(s.id, "price", e.target.value)} />
            <button style={{ ...S.btnDanger, alignSelf: "stretch" }} onClick={() => remove(s.id)}>✕</button>
          </div>
        </div>
      ))}
      <button style={{ ...S.btnGhost, width: "100%", marginBottom: "10px", color: "#c9a84c" }} onClick={add}>+ إضافة خدمة</button>
      <button style={S.btn} onClick={save} disabled={loading}>{loading ? "جارٍ الحفظ..." : "حفظ الخدمات ✓"}</button>
    </div>
  );
}

function TimesEditor({ saloon, token, onSave }) {
  const ALL_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const DEFAULT_TIMES = ["8:00 ص","8:30 ص","9:00 ص","9:30 ص","10:00 ص","10:30 ص","11:00 ص","11:30 ص","12:00 م","1:00 م","1:30 م","2:00 م","2:30 م","3:00 م","3:30 م","4:00 م","4:30 م","5:00 م","5:30 م","6:00 م"];
  const [days, setDays] = useState(saloon.workDays || saloon.work_days || []);
  const [times, setTimes] = useState(saloon.timeSlots || saloon.time_slots || []);
  const [loading, setLoading] = useState(false);
  const toggleDay = d => setDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d]);
  const toggleTime = t => setTimes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const save = async () => {
    setLoading(true);
    try { const u = await api("/owner/saloon/timeslots", "PUT", { timeSlots: times, workDays: days }, token); onSave(u); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div style={S.card}>
      <div style={S.sectionTitle}>أيام العمل</div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
        {ALL_DAYS.map(d => (
          <button key={d} style={{ padding: "7px 14px", borderRadius: "10px", border: days.includes(d) ? "1px solid #f7971e" : "1px solid rgba(255,255,255,0.1)", background: days.includes(d) ? "rgba(201,168,76,0.2)" : "#141414", color: days.includes(d) ? "#c9a84c" : "#ccc", cursor: "pointer", fontSize: "13px", fontWeight: "600", fontFamily: "inherit" }} onClick={() => toggleDay(d)}>{d}</button>
        ))}
      </div>
      <div style={S.sectionTitle}>أوقات المواعيد</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", marginBottom: "16px" }}>
        {DEFAULT_TIMES.map(t => (
          <button key={t} style={{ padding: "9px", borderRadius: "9px", border: times.includes(t) ? "1px solid #f7971e" : "1px solid rgba(255,255,255,0.08)", background: times.includes(t) ? "rgba(201,168,76,0.2)" : "#141414", color: times.includes(t) ? "#c9a84c" : "#888", cursor: "pointer", fontSize: "12px", fontWeight: "600", fontFamily: "inherit", textAlign: "center" }} onClick={() => toggleTime(t)}>{t}</button>
        ))}
      </div>
      <button style={S.btn} onClick={save} disabled={loading}>{loading ? "جارٍ الحفظ..." : "حفظ الأوقات ✓"}</button>
    </div>
  );
}

function BookingPage({ slug }) {
  const [saloon, setSaloon] = useState(null);
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState({ service: null, day: null, time: null });
  const [bookedSlots, setBookedSlots] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(`/book/${slug}`).then(setSaloon).catch(() => setError("الصالون غير موجود")).finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (selected.day && saloon) {
      api(`/book/${slug}/booked?day=${encodeURIComponent(selected.day)}`).then(setBookedSlots).catch(() => {});
    }
  }, [selected.day, saloon, slug]);

  const confirm = async () => {
    if (!name || !phone) return setError("أدخل اسمك ورقم جوالك");
    if (phone.replace(/\s+/g, "").length < 9) return setError("أدخل رقم الجوال كاملاً");
    setError("");
    try {
      await api(`/book/${slug}`, "POST", { name, phone, service: selected.service, day: selected.day, time: selected.time });
      setDone(true);
    } catch (e) { setError(e.message); }
  };

  if (loading) return <div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}><div style={{ color: "#888" }}>جارٍ التحميل...</div></div>;

  if (error && !saloon) return (
    <div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ textAlign: "center", color: "#888" }}><div style={{ fontSize: "40px", marginBottom: "12px" }}>😕</div><div>{error}</div></div>
    </div>
  );

  return (
    <div style={S.app}>
      <header style={S.header}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "14px", fontWeight: "900", color: "#c9a84c", letterSpacing: "3px" }}>MAWIDS</div>
          <div style={{ fontSize: "8px", color: "#555", letterSpacing: "2px" }}>مَوعِد</div>
        </div>
        <div style={{ fontSize: "14px", fontWeight: "700", color: "#ccc" }}>{saloon?.name}</div>
      </header>
      <div style={S.container}>
        {done ? (
          <div style={{ ...S.card, textAlign: "center", padding: "40px 24px", marginTop: "20px" }}>
            <div style={{ width: "70px", height: "70px", borderRadius: "50%", background: "#c9a84c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", margin: "0 auto 20px" }}>✓</div>
            <div style={{ fontSize: "22px", fontWeight: "800", marginBottom: "10px" }}>تم الحجز بنجاح! 🎉</div>
            <div style={{ fontSize: "13px", color: "#888", lineHeight: "2" }}>
              <div><span style={{ color: "#fff" }}>{selected.service}</span></div>
              <div><span style={{ color: "#fff" }}>{selected.day} — {selected.time}</span></div>
              <div style={{ marginTop: "8px" }}>سيتواصل معك صاحب النشاط للتأكيد</div>
            </div>
          </div>
        ) : (
          <>
            <div style={S.card}>
              <div style={S.sectionTitle}>اختر الخدمة</div>
              {saloon?.services?.map(sv => (
                <div key={sv.id} onClick={() => { setSelected(p => ({ ...p, service: sv.name })); setStep(Math.max(step, 2)); }}
                  style={{ padding: "14px 16px", borderRadius: "14px", cursor: "pointer", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", background: selected.service === sv.name ? "rgba(201,168,76,0.15)" : "#141414", border: selected.service === sv.name ? "1px solid rgba(201,168,76,0.5)" : "1px solid rgba(255,255,255,0.07)" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "700" }}>{sv.name}</div>
                    <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{sv.duration}</div>
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: "#c9a84c" }}>{sv.price} د.إ</div>
                </div>
              ))}
            </div>

            {step >= 2 && (
              <div style={S.card}>
                <div style={S.sectionTitle}>اختر اليوم</div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {(saloon?.workDays || saloon?.work_days)?.map(d => (
                    <button key={d} onClick={() => { setSelected(p => ({ ...p, day: d, time: null })); setStep(Math.max(step, 3)); }}
                      style={{ padding: "8px 16px", borderRadius: "10px", fontFamily: "inherit", fontSize: "13px", fontWeight: "600", cursor: "pointer", border: selected.day === d ? "1px solid #f7971e" : "1px solid rgba(255,255,255,0.1)", background: selected.day === d ? "rgba(201,168,76,0.2)" : "#141414", color: selected.day === d ? "#c9a84c" : "#ccc" }}>{d}</button>
                  ))}
                </div>
              </div>
            )}

            {step >= 3 && selected.day && (
              <div style={S.card}>
                <div style={S.sectionTitle}>اختر الوقت</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px" }}>
                  {(saloon?.timeSlots || saloon?.time_slots)?.map(t => {
                    const booked = bookedSlots.includes(t);
                    const active = selected.time === t;
                    return (
                      <button key={t} disabled={booked} onClick={() => { setSelected(p => ({ ...p, time: t })); setStep(Math.max(step, 4)); }}
                        style={{ padding: "10px", borderRadius: "9px", fontFamily: "inherit", fontSize: "12px", fontWeight: "600", textAlign: "center", cursor: booked ? "not-allowed" : "pointer", border: booked ? "1px solid rgba(255,255,255,0.04)" : active ? "1px solid #f7971e" : "1px solid rgba(255,255,255,0.08)", background: booked ? "rgba(255,255,255,0.02)" : active ? "rgba(201,168,76,0.2)" : "#141414", color: booked ? "#333" : active ? "#c9a84c" : "#aaa", textDecoration: booked ? "line-through" : "none" }}>{t}</button>
                    );
                  })}
                </div>
              </div>
            )}

            {step >= 4 && selected.time && (
              <div style={S.card}>
                <div style={S.sectionTitle}>بياناتك</div>
                {error && <div style={S.error}>{error}</div>}
                <input style={S.input} placeholder="اسمك الكريم" value={name} onChange={e => setName(e.target.value)} />
                <input style={S.input} placeholder="رقم الجوال" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
                <div style={{ padding: "12px", background: "rgba(201,168,76,0.06)", borderRadius: "10px", marginBottom: "12px", fontSize: "13px", lineHeight: "2", color: "#ccc" }}>
                  <div>📋 <strong style={{ color: "#fff" }}>{selected.service}</strong></div>
                  <div>📅 <strong style={{ color: "#fff" }}>{selected.day}</strong></div>
                  <div>🕐 <strong style={{ color: "#fff" }}>{selected.time}</strong></div>
                </div>
                <button style={S.btn} onClick={confirm}>تأكيد الحجز ✓</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
