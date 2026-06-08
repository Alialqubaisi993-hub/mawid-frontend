import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import translations from "./i18n";

const LangContext = createContext({ lang: "ar", t: translations.ar, setLang: () => {} });
const useLang = () => useContext(LangContext);

const API = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

const S = {
  app: (dir) => ({
    minHeight: "100vh",
    background: "#0c0c0c",
    fontFamily: "'Cairo', 'Segoe UI', sans-serif",
    direction: dir || "rtl",
    color: "#fff",
  }),
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
  const [lang, setLang] = useState(() => localStorage.getItem("mawid_lang") || "ar");
  const t = translations[lang] || translations.ar;
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    localStorage.setItem("mawid_lang", lang);
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang]);

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

  const langValue = { lang, t, setLang, dir };

  if (page.startsWith("book:")) return (
    <LangContext.Provider value={langValue}>
      <BookingPage slug={page.split(":")[1]} />
    </LangContext.Provider>
  );

  return (
    <LangContext.Provider value={langValue}>
      <div style={{ ...S.app(dir) }}>
        <header style={S.header}>
          <div style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: dir === "rtl" ? "flex-start" : "flex-end" }} onClick={() => !auth && setPage("home")}>
            <div style={{ fontSize: "16px", fontWeight: "900", color: "#c9a84c", letterSpacing: "3px" }}>MAWIDS</div>
            <div style={{ fontSize: "9px", color: "#555", letterSpacing: "2px", marginTop: "1px" }}>مَوعِد</div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {/* زر تبديل اللغة */}
            <button style={{ ...S.btnGhost, fontSize: "11px", padding: "5px 12px" }} onClick={() => setLang(lang === "ar" ? "en" : "ar")}>
              {lang === "ar" ? "EN" : "ع"}
            </button>
            {!auth && <>
              <button style={S.btnGhost} onClick={() => setPage("login")}>{t.login}</button>
              <button style={{ ...S.btnGhost, color: "#c9a84c", borderColor: "rgba(201,168,76,0.3)" }} onClick={() => setPage("register")}>{t.register}</button>
            </>}
            {auth && <button style={S.btnGhost} onClick={logout}>{t.logout}</button>}
          </div>
        </header>
        {page === "home" && <LandingPage onLogin={() => setPage("login")} onRegister={() => setPage("register")} />}
        {page === "login" && <LoginPage onAuth={setAuth} onRegister={() => setPage("register")} />}
        {page === "register" && <RegisterPage onBack={() => setPage("login")} />}
        {page === "admin" && auth?.user.role === "admin" && <AdminDashboard token={auth.token} />}
        {page === "owner" && auth?.user.role === "owner" && <OwnerDashboard token={auth.token} user={auth.user} initSaloon={auth.saloon} />}
      </div>
    </LangContext.Provider>
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
  const { t, dir } = useLang();
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
        <input style={S.input} type="email" {...{placeholder: t.email}} value={email} onChange={e => setEmail(e.target.value)} />
        <input style={S.input} type="password" {...{placeholder: t.password}} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
        <button style={S.btn} onClick={login} disabled={loading}>{loading ? t.logging : t.loginBtn}</button>
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
  const { t, dir } = useLang();
  const [form, setForm] = useState({ name: "", email: "", password: "", activityName: "", phone: "", city: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name || !form.email || !form.password || !form.activityName || !form.phone) return setError("جميع الحقول مطلوبة");
    if (!agreed) return setError("يجب الموافقة على شروط الاستخدام للمتابعة");
    setLoading(true); setError("");
    try { await api("/auth/register", "POST", form); setDone(true); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  if (showTerms) return (
    <div style={S.container}>
      <div style={{ paddingTop: "8px", marginBottom: "16px" }}>
        <button style={S.btnGhost} onClick={() => setShowTerms(false)}>← رجوع</button>
      </div>
      <div style={S.card}>
        <div style={{ fontSize: "16px", fontWeight: "900", color: "#c9a84c", marginBottom: "16px", textAlign: "center" }}>شروط الاستخدام والعقد</div>

        {[
          { title: "📋 تعريف المنصة", body: "مَوعِد وسيط تقني فقط — توفر الأدوات وتسهّل الخدمة. لا تقدم مَوعِد أي خدمة مباشرة للزبائن. العلاقة التجارية تكون حصراً بين صاحب النشاط وزبونه." },
          { title: "💰 السياسة المالية", body: "✅ مَوعِد لا تأخذ أي رسوم من الزبائن أبداً وتحت أي ظرف.\n✅ الرسوم تكون حصراً من أصحاب الأنشطة المشتركين.\n✅ أي مبلغ يدفعه الزبون هو لصاحب النشاط مباشرة وليس لمَوعِد.\n⚠️ تتبرأ مَوعِد تماماً من أي نزاع مالي بين صاحب النشاط وزبونه." },
          { title: "🎁 الفترة التجريبية", body: "التسجيل مجاني تماماً في هذه المرحلة. في حال تغيير السياسة مستقبلاً، سيتم إشعار جميع المشتركين مسبقاً بمدة لا تقل عن 30 يوماً. يحق للمشترك إلغاء حسابه في أي وقت دون أي التزامات." },
          { title: "✅ مسؤوليات صاحب النشاط", body: "• تقديم معلومات صحيحة عند التسجيل\n• الالتزام بتقديم الخدمات المعلنة\n• التواصل المباشر مع الزبائن وحل أي نزاعات بشكل مستقل\n• المحافظة على سرية بيانات الزبائن" },
          { title: "⚖️ إخلاء المسؤولية", body: "⚠️ مَوعِد غير مسؤولة عن جودة الخدمات المقدمة من أصحاب الأنشطة.\n⚠️ مَوعِد غير مسؤولة عن أي نزاع بين صاحب النشاط وزبونه.\n⚠️ مَوعِد غير مسؤولة عن أي خسائر ناتجة عن إساءة استخدام المنصة." },
        ].map((s, i) => (
          <div key={i} style={{ background: "#0c0c0c", border: "1px solid rgba(201,168,76,0.1)", borderRadius: "12px", padding: "14px", marginBottom: "10px" }}>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "#c9a84c", marginBottom: "8px" }}>{s.title}</div>
            <div style={{ fontSize: "12px", color: "#666", lineHeight: "1.9", whiteSpace: "pre-line" }}>{s.body}</div>
          </div>
        ))}

        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <button style={S.btn} onClick={() => { setAgreed(true); setShowTerms(false); }}>✓ أوافق على الشروط</button>
          <button style={S.btnGhost} onClick={() => setShowTerms(false)}>رجوع</button>
        </div>
      </div>
    </div>
  );

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
        <input style={S.input} {...{placeholder: t.fullName}} value={form.name} onChange={f("name")} />
        <input style={S.input} type="email" {...{placeholder: t.email}} value={form.email} onChange={f("email")} />
        <input style={S.input} type="password" {...{placeholder: t.password}} value={form.password} onChange={f("password")} />
        <div style={{ ...S.sectionTitle, marginTop: "8px" }}>بيانات النشاط</div>
        <input style={S.input} {...{placeholder: t.activityName}} value={form.activityName} onChange={f("activityName")} />
        <input style={S.input} {...{placeholder: t.phone}} value={form.phone} onChange={f("phone")} type="tel" />
        <input style={S.input} {...{placeholder: t.city}} value={form.city} onChange={f("city")} />

        {/* موافقة الشروط */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px", background: "#0c0c0c", borderRadius: "10px", marginBottom: "12px", border: agreed ? "1px solid rgba(201,168,76,0.3)" : "1px solid #1e1e1e" }}>
          <div onClick={() => setAgreed(!agreed)} style={{ width: "20px", height: "20px", borderRadius: "5px", border: agreed ? "none" : "1px solid #333", background: agreed ? "#c9a84c" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginTop: "1px" }}>
            {agreed && <span style={{ color: "#0c0c0c", fontSize: "12px", fontWeight: "900" }}>✓</span>}
          </div>
          <div style={{ fontSize: "12px", color: "#666", lineHeight: "1.7" }}>
            أوافق على{" "}
            <span style={{ color: "#c9a84c", cursor: "pointer", fontWeight: "700", textDecoration: "underline" }} onClick={() => setShowTerms(true)}>
              شروط الاستخدام والعقد التجريبي
            </span>
            {" "}وأفهم أن مَوعِد لا تأخذ أي رسوم من الزبائن
          </div>
        </div>

        <button style={{ ...S.btn, opacity: agreed ? 1 : 0.5 }} onClick={submit} disabled={loading || !agreed}>
          {loading ? t.sending : t.sendRequest}
        </button>
        <div style={{ textAlign: "center", marginTop: "14px", fontSize: "13px" }}>
          <span style={{ color: "#888", cursor: "pointer" }} onClick={onBack}>← رجوع للدخول</span>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ token }) {
  const { t, dir } = useLang();
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
      {/* هيدر */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", color: "#555", letterSpacing: "2px", marginBottom: "2px" }}>MAWIDS</div>
          <div style={{ fontSize: "18px", fontWeight: "900", color: "#fff" }}>لوحة التحكم</div>
        </div>
        {stats.pending > 0 && (
          <div style={{ background: "rgba(255,150,50,0.15)", border: "1px solid rgba(255,150,50,0.4)", borderRadius: "20px", padding: "4px 12px", fontSize: "11px", color: "#ff9632", fontWeight: "700" }}>
            🔔 {stats.pending} معلق
          </div>
        )}
      </div>

      {msg && <div style={S.success}>{msg}</div>}

      {/* إحصائيات - 4 في صف */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "6px", marginBottom: "10px" }}>
        <div style={{ background: "#141414", border: "1px solid rgba(201,168,76,0.12)", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
          <div style={{ fontSize: "20px", fontWeight: "900", color: "#c9a84c" }}>{stats.total || 0}</div>
          <div style={{ fontSize: "9px", color: "#444", marginTop: "2px" }}>نشاط</div>
        </div>
        <div style={{ background: "#141414", border: "1px solid rgba(37,209,102,0.12)", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
          <div style={{ fontSize: "20px", fontWeight: "900", color: "#25d166" }}>{stats.active || 0}</div>
          <div style={{ fontSize: "9px", color: "#444", marginTop: "2px" }}>نشط</div>
        </div>
        <div style={{ background: "#141414", border: "1px solid rgba(255,150,50,0.12)", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
          <div style={{ fontSize: "20px", fontWeight: "900", color: "#ff9632" }}>{stats.pending || 0}</div>
          <div style={{ fontSize: "9px", color: "#444", marginTop: "2px" }}>معلق</div>
        </div>
        <div style={{ background: "#141414", border: "1px solid rgba(100,160,255,0.12)", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
          <div style={{ fontSize: "20px", fontWeight: "900", color: "#64a0ff" }}>{stats.totalBookings || 0}</div>
          <div style={{ fontSize: "9px", color: "#444", marginTop: "2px" }}>حجز</div>
        </div>
      </div>

      {/* إجمالي المبالغ */}
      <div style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "12px", padding: "12px 16px", marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "12px", color: "#555" }}>💰 إجمالي المبالغ</span>
        <span style={{ fontSize: "18px", fontWeight: "900", color: "#25d166" }}>{(stats.totalAmount || 0).toLocaleString()} <span style={{ fontSize: "11px" }}>د.إ</span></span>
      </div>

      {/* تابات */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "6px", marginBottom: "16px" }}>
        <button style={{ background: adminTab === "saloons" ? "#c9a84c" : "#141414", border: adminTab === "saloons" ? "none" : "1px solid #1e1e1e", borderRadius: "10px", padding: "10px", fontFamily: "inherit", fontSize: "12px", fontWeight: "700", color: adminTab === "saloons" ? "#0c0c0c" : "#555", cursor: "pointer" }} onClick={() => setAdminTab("saloons")}>🏢 الأنشطة</button>
        <button style={{ background: adminTab === "bookings" ? "#c9a84c" : "#141414", border: adminTab === "bookings" ? "none" : "1px solid #1e1e1e", borderRadius: "10px", padding: "10px", fontFamily: "inherit", fontSize: "12px", fontWeight: "700", color: adminTab === "bookings" ? "#0c0c0c" : "#555", cursor: "pointer" }} onClick={() => setAdminTab("bookings")}>📋 الحجوزات</button>
        <button style={{ background: adminTab === "users" ? "#c9a84c" : "#141414", border: adminTab === "users" ? "none" : "1px solid #1e1e1e", borderRadius: "10px", padding: "10px", fontFamily: "inherit", fontSize: "12px", fontWeight: "700", color: adminTab === "users" ? "#0c0c0c" : "#555", cursor: "pointer" }} onClick={() => setAdminTab("users")}>👥 المستخدمين</button>
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

      {adminTab === "bookings" && <AdminBookings token={token} saloons={saloons} />}
      {adminTab === "users" && <UsersManager token={token} onMsg={showMsg} />}
    </div>
  );
}



function AdminBookings({ token, saloons }) {
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [saloonId, setSaloonId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      let url = `/admin/bookings?from=${from}&to=${to}`;
      if (saloonId) url += `&saloon_id=${saloonId}`;
      const res = await api(url, "GET", null, token);
      setData(res);
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

  return (
    <div style={S.card}>
      <div style={S.sectionTitle}>📋 كل الحجوزات</div>

      {/* فلتر النشاط */}
      <select style={{ ...S.input, marginBottom: "10px" }} value={saloonId} onChange={e => setSaloonId(e.target.value)}>
        <option value="">كل الأنشطة</option>
        {saloons?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      {/* أزرار سريعة */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
        <button style={{ ...S.btnGhost, fontSize: "11px", padding: "5px 10px" }} onClick={() => quickRange(1)}>اليوم</button>
        <button style={{ ...S.btnGhost, fontSize: "11px", padding: "5px 10px" }} onClick={() => quickRange(7)}>7 أيام</button>
        <button style={{ ...S.btnGhost, fontSize: "11px", padding: "5px 10px" }} onClick={() => quickRange(30)}>30 يوم</button>
        <button style={{ ...S.btnGhost, fontSize: "11px", padding: "5px 10px" }} onClick={() => quickRange(90)}>3 أشهر</button>
      </div>

      {/* تواريخ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
        <div>
          <div style={{ fontSize: "11px", color: "#555", marginBottom: "4px" }}>من</div>
          <input type="date" style={S.input} value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div>
          <div style={{ fontSize: "11px", color: "#555", marginBottom: "4px" }}>إلى</div>
          <input type="date" style={S.input} value={to} onChange={e => setTo(e.target.value)} />
        </div>
      </div>
      <button style={S.btn} onClick={load} disabled={loading}>{loading ? {t.loading} : "عرض الحجوزات ←"}</button>

      {data && (
        <div style={{ marginTop: "16px" }}>
          {/* ملخص */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
            <div style={S.statCard}>
              <div style={{ ...S.statNum, fontSize: "22px" }}>{data.totalBookings}</div>
              <div style={S.statLabel}>إجمالي الحجوزات</div>
            </div>
            <div style={S.statCard}>
              <div style={{ ...S.statNum, fontSize: "22px", color: "#25d166" }}>{(data.totalAmount || 0).toLocaleString()}</div>
              <div style={S.statLabel}>إجمالي المبالغ (د.إ)</div>
            </div>
          </div>

          {/* زر PDF */}
          <button style={{ ...S.btnGhost, width: "100%", marginBottom: "14px", color: "#c9a84c", borderColor: "rgba(201,168,76,0.3)" }} onClick={() => {
            const saloonName = saloonId ? saloons?.find(s => s.id === saloonId)?.name || "كل الأنشطة" : "كل الأنشطة";
            const rows = (data.bookings || []).map(b =>
              `<tr>
                <td style="padding:8px 10px; border-bottom:1px solid #eee;">${b.name}</td>
                <td style="padding:8px 10px; border-bottom:1px solid #eee;">${b.phone}</td>
                <td style="padding:8px 10px; border-bottom:1px solid #eee;">${b.saloon_name}</td>
                <td style="padding:8px 10px; border-bottom:1px solid #eee;">${b.service}</td>
                <td style="padding:8px 10px; border-bottom:1px solid #eee;">${b.day} ${b.time}</td>
                <td style="padding:8px 10px; border-bottom:1px solid #eee;">${new Date(b.created_at).toLocaleDateString("ar-AE")}</td>
                <td style="padding:8px 10px; border-bottom:1px solid #eee; font-weight:bold; color:#c9a84c;">${b.price || 0} د.إ</td>
              </tr>`
            ).join("");
            const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>تقرير المدير — مَوعِد</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
<style>
  body { font-family:'Cairo',sans-serif; direction:rtl; padding:40px; color:#1a1a1a; }
  h1 { font-size:26px; font-weight:900; color:#c9a84c; letter-spacing:3px; margin:0 0 4px; }
  .sub { font-size:12px; color:#888; margin-bottom:6px; }
  .period { font-size:13px; color:#555; margin-bottom:24px; }
  .summary { display:flex; gap:16px; margin-bottom:28px; }
  .sc { background:#f8f8f8; border-radius:10px; padding:16px 24px; flex:1; text-align:center; border:1px solid #eee; }
  .sn { font-size:26px; font-weight:900; color:#c9a84c; }
  .sn.green { color:#25d166; }
  .sl { font-size:11px; color:#888; margin-top:4px; }
  table { width:100%; border-collapse:collapse; font-size:12px; }
  thead { background:#1a1a1a; color:#c9a84c; }
  thead th { padding:10px; text-align:right; font-weight:700; }
  .footer { margin-top:28px; text-align:center; font-size:11px; color:#aaa; }
</style>
</head>
<body>
<h1>MAWIDS — تقرير المدير</h1>
<div class="sub">Mawids.com — منصة إدارة الحجوزات</div>
<div class="period">النشاط: ${saloonName} | الفترة: من ${from} إلى ${to}</div>
<div class="summary">
  <div class="sc"><div class="sn">${data.totalBookings}</div><div class="sl">إجمالي الحجوزات</div></div>
  <div class="sc"><div class="sn green">${(data.totalAmount||0).toLocaleString()} د.إ</div><div class="sl">إجمالي المبالغ</div></div>
</div>
<table>
  <thead><tr><th>الزبون</th><th>الجوال</th><th>النشاط</th><th>الخدمة</th><th>الموعد</th><th>التاريخ</th><th>المبلغ</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="footer">تم إنشاؤه بواسطة مَوعِد — ${new Date().toLocaleDateString("ar-AE")}</div>
</body></html>`;
            const win = window.open("", "_blank");
            win.document.write(html);
            win.document.close();
            setTimeout(() => win.print(), 800);
          }}>📄 تحميل التقرير PDF</button>

          <div style={S.sectionTitle}>تفاصيل الحجوزات</div>
          {data.bookings?.length === 0 && (
            <div style={{ color: "#555", fontSize: "13px", textAlign: "center", padding: "20px" }}>لا توجد حجوزات في هذه الفترة</div>
          )}
          {data.bookings?.map(b => (
            <div key={b.id} style={{ borderBottom: "1px solid #1a1a1a", paddingBottom: "12px", marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#fff" }}>{b.name}</div>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#c9a84c" }}>{b.price || 0} د.إ</div>
              </div>
              <div style={{ fontSize: "11px", color: "#555", marginBottom: "4px" }}>{b.saloon_name} — {b.service}</div>
              <div style={{ fontSize: "11px", color: "#555", marginBottom: "6px" }}>{b.day} — {b.time} — {new Date(b.created_at).toLocaleDateString("ar-AE")}</div>
              <div style={{ display: "flex", gap: "8px" }}>
                <a href={`https://wa.me/${b.phone.replace(/^0/, "971").replace(/[^0-9]/g, "")}?text=${encodeURIComponent("أهلاً " + b.name + " 👋\nنذكّرك بموعدك:\n📋 " + b.service + "\n📅 " + b.day + " — " + b.time + "\nنتطلع لاستقبالك 🙏")}`}
                  target="_blank" rel="noreferrer"
                  style={{ ...S.btnSuccess, textDecoration: "none", fontSize: "11px" }}>💬 {b.phone}</a>
                <a href={`tel:+${b.phone.replace(/^0/, "971").replace(/[^0-9]/g, "")}`}
                  style={{ background: "rgba(100,160,255,0.1)", border: "1px solid rgba(100,160,255,0.3)", color: "#64a0ff", padding: "5px 12px", borderRadius: "8px", textDecoration: "none", fontSize: "11px", fontWeight: "700" }}>📞 اتصال</a>
              </div>
            </div>
          ))}
        </div>
      )}
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
          <input style={S.input} {...{placeholder: t.email}} type="email" value={form.email} onChange={f("email")} />
          <input style={S.input} {...{placeholder: t.password}} type="password" value={form.password} onChange={f("password")} />
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
  const { t, dir } = useLang();
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
      {/* هيدر */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", marginBottom: "14px" }}>
        <div>
          <div style={{ fontSize: "11px", color: "#555", letterSpacing: "2px", marginBottom: "2px" }}>MAWIDS</div>
          <div style={{ fontSize: "16px", fontWeight: "900", color: "#fff" }}>{saloon?.name || "..."}</div>
        </div>
        <span style={badge(saloon?.status === "active" ? "green" : "orange")}>
          {saloon?.status === "active" ? "نشط ✓" : "غير مفعّل"}
        </span>
      </div>

      {msg && <div style={S.success}>{msg}</div>}

      {/* إحصائيات سريعة */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "6px", marginBottom: "10px" }}>
        <div style={{ background: "#141414", border: "1px solid rgba(201,168,76,0.12)", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
          <div style={{ fontSize: "20px", fontWeight: "900", color: "#c9a84c" }}>{bookings.length}</div>
          <div style={{ fontSize: "9px", color: "#444", marginTop: "2px" }}>مواعيد اليوم</div>
        </div>
        <div style={{ background: "#141414", border: "1px solid rgba(37,209,102,0.12)", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
          <div style={{ fontSize: "20px", fontWeight: "900", color: "#25d166" }}>{(saloon?.services || []).length}</div>
          <div style={{ fontSize: "9px", color: "#444", marginTop: "2px" }}>الخدمات</div>
        </div>
        <div style={{ background: "#141414", border: "1px solid rgba(100,160,255,0.12)", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
          <div style={{ fontSize: "20px", fontWeight: "900", color: "#64a0ff" }}>{(saloon?.work_days || []).length}</div>
          <div style={{ fontSize: "9px", color: "#444", marginTop: "2px" }}>أيام العمل</div>
        </div>
      </div>

      {/* رابط الحجز */}
      {saloon?.status === "active" && (
        <div style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "12px", padding: "12px 14px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
          <div style={{ fontSize: "11px", color: "#c9a84c", wordBreak: "break-all", flex: 1 }}>🔗 {window.location.origin}/book/{saloon.slug}</div>
          <button style={{ ...S.btn, padding: "8px 14px", fontSize: "11px", whiteSpace: "nowrap", width: "auto" }} onClick={copyLink}>
            {copied ? "✓ نُسخ" : "📋 نسخ"}
          </button>
        </div>
      )}

      {/* تابات */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "5px", marginBottom: "14px" }}>
        <button style={{ background: tab === "bookings" ? "#c9a84c" : "#141414", border: tab === "bookings" ? "none" : "1px solid #1e1e1e", borderRadius: "9px", padding: "9px 4px", fontFamily: "inherit", fontSize: "11px", fontWeight: "700", color: tab === "bookings" ? "#0c0c0c" : "#555", cursor: "pointer" }} onClick={() => setTab("bookings")}>📋 مواعيد</button>
        <button style={{ background: tab === "services" ? "#c9a84c" : "#141414", border: tab === "services" ? "none" : "1px solid #1e1e1e", borderRadius: "9px", padding: "9px 4px", fontFamily: "inherit", fontSize: "11px", fontWeight: "700", color: tab === "services" ? "#0c0c0c" : "#555", cursor: "pointer" }} onClick={() => setTab("services")}>✂️ خدمات</button>
        <button style={{ background: tab === "times" ? "#c9a84c" : "#141414", border: tab === "times" ? "none" : "1px solid #1e1e1e", borderRadius: "9px", padding: "9px 4px", fontFamily: "inherit", fontSize: "11px", fontWeight: "700", color: tab === "times" ? "#0c0c0c" : "#555", cursor: "pointer" }} onClick={() => setTab("times")}>🕐 أوقات</button>
        <button style={{ background: tab === "report" ? "#c9a84c" : "#141414", border: tab === "report" ? "none" : "1px solid #1e1e1e", borderRadius: "9px", padding: "9px 4px", fontFamily: "inherit", fontSize: "11px", fontWeight: "700", color: tab === "report" ? "#0c0c0c" : "#555", cursor: "pointer" }} onClick={() => setTab("report")}>📊 تقرير</button>
      </div>

      {tab === "bookings" && (
        <div style={S.card}>
          <div style={S.sectionTitle}>المواعيد ({bookings.length})</div>
          {loading && <div style={{ color: "#888", fontSize: "13px", textAlign: "center", padding: "20px" }}>جارٍ التحميل...</div>}
          {!loading && bookings.length === 0 && <div style={{ color: "#888", fontSize: "13px", textAlign: "center", padding: "20px" }}>لا توجد مواعيد اليوم</div>}
          {bookings.map(b => (
            <div key={b.id} style={{ borderBottom: "1px solid #1a1a1a", paddingBottom: "14px", marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: "800", color: "#fff" }}>{b.name}</div>
                  <div style={{ fontSize: "12px", color: "#555", marginTop: "2px" }}>{b.service} — {b.day}</div>
                </div>
                <span style={badge("green")}>{b.time}</span>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                <a href={`https://wa.me/${b.phone.replace(/^0/, "971").replace(/[^0-9]/g, "")}?text=${encodeURIComponent("أهلاً " + b.name + " 👋\nنذكّرك بموعدك:\n📋 " + b.service + "\n📅 " + b.day + " — " + b.time + "\nنتطلع لاستقبالك 🙏")}`} target="_blank" rel="noreferrer"
                  style={{ ...S.btnSuccess, textDecoration: "none" }}>💬 واتساب</a>
                <a href={`tel:+${b.phone.replace(/^0/, "971").replace(/[^0-9]/g, "")}`}
                  style={{ background: "rgba(100,160,255,0.1)", border: "1px solid rgba(100,160,255,0.3)", color: "#64a0ff", padding: "7px 14px", borderRadius: "8px", textDecoration: "none", fontSize: "12px", fontWeight: "700" }}>📞 اتصال</a>
                <button style={{ ...S.btnDanger, fontSize: "12px" }} onClick={async () => {
                  if (!window.confirm("هل تريد إلغاء هذا الموعد؟")) return;
                  try {
                    await api(`/owner/bookings/${b.id}/cancel`, "PATCH", { reason: "اعتذار من صاحب النشاط" }, token);
                    // فتح واتساب برسالة اعتذار
                    const cancelMsg = encodeURIComponent("عزيزي " + b.name + " 🙏\nنعتذر منك بشدة، اضطررنا لإلغاء موعدك:\n📋 " + b.service + "\n📅 " + b.day + " — " + b.time + "\nنأسف للإزعاج وسنكون سعداء بخدمتك في وقت آخر 💛");
                    window.open(`https://wa.me/${b.phone.replace(/^0/, "971").replace(/[^0-9]/g, "")}?text=${cancelMsg}`, "_blank");
                    loadData();
                  } catch (e) { alert("حدث خطأ: " + e.message); }
                }}>✕ إلغاء</button>
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
      <button style={S.btn} onClick={load} disabled={loading}>{loading ? {t.loading} : "عرض التقرير ←"}</button>

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
            <div key={b.id} style={{ borderBottom: "1px solid #1a1a1a", paddingBottom: "12px", marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>{b.name}</div>
                  <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>{b.service} — {b.day} {b.time}</div>
                  <div style={{ fontSize: "10px", color: "#444", marginTop: "2px" }}>{new Date(b.created_at).toLocaleDateString("ar-AE")}</div>
                </div>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#c9a84c" }}>{b.price || 0} د.إ</div>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <a href={`https://wa.me/${b.phone.replace(/^0/, "971").replace(/[^0-9]/g, "")}?text=${encodeURIComponent("أهلاً " + b.name + " 👋\nنذكّرك بموعدك:\n📋 " + b.service + "\n📅 " + b.day + " — " + b.time + "\nنتطلع لاستقبالك 🙏")}`}
                  target="_blank" rel="noreferrer"
                  style={{ ...S.btnSuccess, textDecoration: "none", fontSize: "11px" }}>💬 {b.phone}</a>
                <a href={`tel:+${b.phone.replace(/^0/, "971").replace(/[^0-9]/g, "")}`}
                  style={{ background: "rgba(100,160,255,0.1)", border: "1px solid rgba(100,160,255,0.3)", color: "#64a0ff", padding: "5px 12px", borderRadius: "8px", textDecoration: "none", fontSize: "11px", fontWeight: "700" }}>📞 اتصال</a>
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
  const { t, dir } = useLang();
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

                    // إخفاء الأوقات الماضية إذا كان اليوم هو اليوم الحالي
                    const isToday = selected.day === new Date().toLocaleDateString("ar-AE-u-nu-latn", { weekday: "long" }) ||
                      ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"][new Date().getDay()] === selected.day;

                    if (isToday) {
                      const now = new Date();
                      const nowMins = now.getHours() * 60 + now.getMinutes();
                      const isPM = t.includes("م");
                      const isAM = t.includes("ص");
                      const cleaned = t.replace("ص","").replace("م","").trim();
                      let [h, m] = cleaned.split(":").map(Number);
                      if (isPM && h !== 12) h += 12;
                      if (isAM && h === 12) h = 0;
                      const slotMins = h * 60 + (m || 0);
                      if (slotMins <= nowMins) return null; // إخفاء الوقت الماضي
                    }

                    const active = selected.time === t;
                    return (
                      <button key={t} disabled={booked} onClick={() => { setSelected(p => ({ ...p, time: t })); setStep(Math.max(step, 4)); }}
                        style={{ padding: "10px", borderRadius: "9px", fontFamily: "inherit", fontSize: "12px", fontWeight: "600", textAlign: "center", cursor: booked ? "not-allowed" : "pointer", border: booked ? "1px solid rgba(255,255,255,0.04)" : active ? "1px solid #c9a84c" : "1px solid rgba(255,255,255,0.08)", background: booked ? "rgba(255,255,255,0.02)" : active ? "rgba(201,168,76,0.2)" : "#141414", color: booked ? "#333" : active ? "#c9a84c" : "#aaa", textDecoration: booked ? "line-through" : "none" }}>{t}</button>
                    );
                  })}
                </div>
              </div>
            )}

            {step >= 4 && selected.time && (
              <div style={S.card}>
                <div style={S.sectionTitle}>بياناتك</div>
                {error && <div style={S.error}>{error}</div>}
                <input style={S.input} {...{placeholder: t.yourName}} value={name} onChange={e => setName(e.target.value)} />
                <input style={S.input} {...{placeholder: t.yourPhone}} value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
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
