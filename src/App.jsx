import { useState, useEffect, useRef } from "react";
import { createClient } from '@supabase/supabase-js';

// ── Supabase ──────────────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

// ── constantes ────────────────────────────────────────────────────────────────
const API_URL      = import.meta.env.VITE_API_URL + "/analyze";
const SESSION_KEY  = "phishguard_session";
const UCEVA_DOMAIN = "@uceva.edu.co";

const getSession   = ()      => localStorage.getItem(SESSION_KEY);
const saveSession  = (email) => localStorage.setItem(SESSION_KEY, email);
const clearSession = ()      => localStorage.removeItem(SESSION_KEY);

// ── icons ─────────────────────────────────────────────────────────────────────
const ShieldIcon = ({ color = "currentColor", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const ScanIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
    <line x1="7" y1="12" x2="17" y2="12" />
  </svg>
);
const AlertIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const CheckIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const XCircleIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
const ClockIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const TrashIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);
const EyeIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const LogOutIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const WifiOffIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
    <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
  </svg>
);

const PLACEHOLDERS = [
  "Pega aquí un mensaje sospechoso, correo o URL...",
  "Ej: http://paypa1-secure-login.com/verify",
  'Ej: "Tu cuenta ha sido suspendida. Haz clic aquí para recuperarla."',
  "Ej: jdnsadnuasngfa.com",
];

const SCAN_STEPS = [
  { label: "Tokenización",   threshold: 15 },
  { label: "NLP",            threshold: 35 },
  { label: "Extracción URL", threshold: 55 },
  { label: "Modelo ML",      threshold: 75 },
  { label: "Clasificación",  threshold: 92 },
];

const BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #080c14; --surface: #0e1420; --surface2: #151c2e;
    --border: rgba(255,255,255,0.07); --accent: #00c8ff;
    --text: #e8eaf0; --text-muted: #5a6a82;
    --font-ui: 'Syne', sans-serif; --font-mono: 'Space Mono', monospace;
    --radius: 14px; --radius-sm: 8px;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--font-ui); min-height: 100vh; overflow-x: hidden; }
  body::before {
    content:''; position:fixed; inset:0;
    background-image: linear-gradient(rgba(0,200,255,0.025) 1px,transparent 1px), linear-gradient(90deg,rgba(0,200,255,0.025) 1px,transparent 1px);
    background-size:40px 40px; pointer-events:none; z-index:0;
  }
  body::after {
    content:''; position:fixed; top:-20%; left:50%; transform:translateX(-50%);
    width:600px; height:600px; border-radius:50%;
    background:radial-gradient(circle,rgba(0,200,255,0.06) 0%,transparent 70%);
    pointer-events:none; z-index:0;
  }
`;

// ══════════════════════════════════════════════════════════════════════════════
// AUTH SCREEN
// ══════════════════════════════════════════════════════════════════════════════
function AuthScreen({ onLogin }) {
  const [mode, setMode]         = useState("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [nombre, setNombre]     = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [visible, setVisible]   = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const reset = () => { setError(""); setSuccess(""); };

  const handleLogin = async () => {
    reset();
    if (!email || !password) return setError("Completa todos los campos.");
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('password', password)
        .single();
      if (err || !data) return setError("Correo o contraseña incorrectos.");
      saveSession(data.email);
      onLogin(data);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    reset();
    const em = email.toLowerCase().trim();
    if (!nombre || !em || !password || !confirm) return setError("Completa todos los campos.");
    if (!em.endsWith(UCEVA_DOMAIN))              return setError(`Solo se permiten correos ${UCEVA_DOMAIN}`);
    if (password.length < 6)                     return setError("La contraseña debe tener mínimo 6 caracteres.");
    if (password !== confirm)                    return setError("Las contraseñas no coinciden.");
    setLoading(true);
    try {
      const { error: err } = await supabase
        .from('usuarios')
        .insert([{ email: em, password, nombre: nombre.trim() }]);
      if (err) return setError("Este correo ya está registrado.");
      setSuccess("¡Cuenta creada! Ahora inicia sesión.");
      setMode("login");
      setPassword(""); setConfirm(""); setNombre("");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        ${BASE_STYLES}
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(1.5);opacity:0} }
        .auth-wrap { position:relative; z-index:1; min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 20px; opacity:0; transition:opacity .4s ease; }
        .auth-wrap.visible { opacity:1; }
        .auth-logo-ring { position:relative; width:72px; height:72px; margin:0 auto 20px; }
        .auth-logo-ring::before { content:''; position:absolute; inset:-6px; border-radius:50%; border:2px solid rgba(0,200,255,0.4); animation:pulse-ring 2s ease-out infinite; }
        .auth-logo-circle { width:72px; height:72px; border-radius:50%; background:rgba(0,200,255,0.1); border:2px solid rgba(0,200,255,0.35); display:flex; align-items:center; justify-content:center; }
        .auth-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:32px 28px; width:100%; max-width:420px; animation:fadeUp .4s ease both .1s; }
        .auth-title { font-size:22px; font-weight:800; text-align:center; margin-bottom:6px; }
        .auth-subtitle { font-size:13px; color:var(--text-muted); text-align:center; margin-bottom:24px; }
        .auth-subtitle span { color:var(--accent); }
        .auth-tabs { display:flex; gap:4px; background:var(--surface2); border-radius:var(--radius-sm); padding:4px; margin-bottom:22px; }
        .auth-tab { flex:1; padding:8px; border:none; border-radius:6px; background:none; color:var(--text-muted); font-family:var(--font-ui); font-size:13px; font-weight:700; cursor:pointer; transition:all .2s; }
        .auth-tab.active { background:var(--surface); color:var(--text); }
        .field { margin-bottom:14px; }
        .field label { display:block; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:var(--text-muted); margin-bottom:6px; }
        .field-wrap { position:relative; }
        .field input { width:100%; background:var(--surface2); border:1px solid var(--border); border-radius:var(--radius-sm); color:var(--text); font-family:var(--font-mono); font-size:13px; padding:11px 14px; outline:none; transition:border-color .2s; }
        .field input:focus { border-color:rgba(0,200,255,0.4); }
        .field input.error-input { border-color:rgba(255,23,68,0.5); }
        .pass-toggle { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--text-muted); cursor:pointer; display:flex; align-items:center; padding:0; }
        .pass-toggle:hover { color:var(--text); }
        .auth-hint { font-family:var(--font-mono); font-size:10px; color:var(--text-muted); margin-top:5px; }
        .auth-hint.accent { color:var(--accent); }
        .btn-auth { width:100%; padding:12px; background:var(--accent); color:#080c14; font-family:var(--font-ui); font-size:15px; font-weight:700; border:none; border-radius:var(--radius-sm); cursor:pointer; transition:opacity .2s,transform .2s; margin-top:6px; }
        .btn-auth:hover:not(:disabled) { opacity:.9; transform:translateY(-1px); }
        .btn-auth:disabled { opacity:.5; cursor:not-allowed; }
        .auth-error { background:rgba(255,23,68,0.08); border:1px solid rgba(255,23,68,.3); border-radius:var(--radius-sm); padding:10px 14px; font-size:13px; color:#ff1744; margin-bottom:14px; }
        .auth-success { background:rgba(0,230,118,0.08); border:1px solid rgba(0,230,118,.3); border-radius:var(--radius-sm); padding:10px 14px; font-size:13px; color:#00e676; margin-bottom:14px; }
        .auth-footer { margin-top:16px; font-size:11px; color:var(--text-muted); text-align:center; font-family:var(--font-mono); }
        .auth-footer span { color:var(--accent); }
      `}</style>

      <div className={`auth-wrap ${visible ? "visible" : ""}`}>
        <div className="auth-logo-ring">
          <div className="auth-logo-circle"><ShieldIcon color="#00c8ff" size={32} /></div>
        </div>
        <div className="auth-card">
          <div className="auth-title">PhishGuard</div>
          <div className="auth-subtitle">Acceso exclusivo para <span>@uceva.edu.co</span></div>
          <div className="auth-tabs">
            <button className={`auth-tab ${mode === "login" ? "active" : ""}`} onClick={() => { setMode("login"); reset(); }}>Iniciar sesión</button>
            <button className={`auth-tab ${mode === "register" ? "active" : ""}`} onClick={() => { setMode("register"); reset(); }}>Registrarse</button>
          </div>
          {error   && <div className="auth-error">⚠ {error}</div>}
          {success && <div className="auth-success">✓ {success}</div>}
          {mode === "register" && (
            <div className="field">
              <label>Nombre completo</label>
              <input type="text" placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
            </div>
          )}
          <div className="field">
            <label>Correo institucional</label>
            <input type="email" placeholder={`usuario${UCEVA_DOMAIN}`} value={email} onChange={e => { setEmail(e.target.value); reset(); }} />
            {mode === "register" && <div className="auth-hint accent">Solo se aceptan correos {UCEVA_DOMAIN}</div>}
          </div>
          <div className="field">
            <label>Contraseña</label>
            <div className="field-wrap">
              <input type={showPass ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => { setPassword(e.target.value); reset(); }} style={{ paddingRight: "40px" }} />
              <button className="pass-toggle" onClick={() => setShowPass(v => !v)}>{showPass ? <EyeOffIcon /> : <EyeIcon />}</button>
            </div>
            {mode === "register" && <div className="auth-hint">Mínimo 6 caracteres</div>}
          </div>
          {mode === "register" && (
            <div className="field">
              <label>Confirmar contraseña</label>
              <input type={showPass ? "text" : "password"} placeholder="••••••••" value={confirm} onChange={e => { setConfirm(e.target.value); reset(); }} />
            </div>
          )}
          <button className="btn-auth" disabled={loading} onClick={mode === "login" ? handleLogin : handleRegister}>
            {loading ? "Cargando..." : mode === "login" ? "Ingresar" : "Crear cuenta"}
          </button>
        </div>
        <div className="auth-footer" style={{ marginTop: 20 }}>
          PhishGuard · Proyecto de Tesis · <span>UCEVA</span> · 2026
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HOME SCREEN
// ══════════════════════════════════════════════════════════════════════════════
function HomeScreen({ onStart, user, onLogout }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  return (
    <>
      <style>{`
        ${BASE_STYLES}
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(1.55);opacity:0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
        @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
        .home-wrap { position:relative; z-index:1; min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 20px; text-align:center; opacity:0; transition:opacity .5s ease; }
        .home-wrap.visible { opacity:1; }
        .logo-ring { position:relative; width:96px; height:96px; margin:0 auto 32px; }
        .logo-ring::before { content:''; position:absolute; inset:-6px; border-radius:50%; border:2px solid rgba(0,200,255,0.4); animation:pulse-ring 2s ease-out infinite; }
        .logo-circle { width:96px; height:96px; border-radius:50%; background:rgba(0,200,255,0.1); border:2px solid rgba(0,200,255,0.35); display:flex; align-items:center; justify-content:center; }
        .home-badge { display:inline-flex; align-items:center; gap:7px; font-family:var(--font-mono); font-size:11px; letter-spacing:1.5px; color:var(--accent); background:rgba(0,200,255,0.08); border:1px solid rgba(0,200,255,0.2); border-radius:100px; padding:5px 14px; margin-bottom:20px; animation:shimmer 3s ease infinite; }
        .badge-dot { width:6px; height:6px; border-radius:50%; background:var(--accent); }
        .home-title { font-size:clamp(2.2rem,6vw,3.4rem); font-weight:800; letter-spacing:-1px; line-height:1.1; margin-bottom:8px; background:linear-gradient(135deg,#ffffff 40%,#00c8ff 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .home-subtitle { font-size:clamp(1rem,2.5vw,1.2rem); color:var(--text-muted); max-width:480px; line-height:1.7; margin:0 auto 36px; }
        .home-subtitle span { color:var(--accent); font-weight:600; }
        .features-row { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-bottom:44px; }
        .feature-pill { display:flex; align-items:center; gap:8px; background:var(--surface); border:1px solid var(--border); border-radius:100px; padding:8px 18px; font-size:13px; color:var(--text-muted); transition:border-color .25s,color .25s; }
        .feature-pill:hover { border-color:rgba(0,200,255,0.3); color:var(--text); }
        .cta-btn { display:inline-flex; align-items:center; gap:10px; background:var(--accent); color:#080c14; font-family:var(--font-ui); font-size:16px; font-weight:700; padding:16px 40px; border:none; border-radius:var(--radius); cursor:pointer; transition:transform .2s,box-shadow .2s; box-shadow:0 0 28px rgba(0,200,255,0.3); }
        .cta-btn:hover { transform:translateY(-2px); box-shadow:0 0 42px rgba(0,200,255,0.45); }
        .cta-hint { margin-top:14px; font-size:12px; color:var(--text-muted); font-family:var(--font-mono); }
        .anim-1{animation:fadeUp .55s ease both .1s} .anim-2{animation:fadeUp .55s ease both .22s}
        .anim-3{animation:fadeUp .55s ease both .34s} .anim-4{animation:fadeUp .55s ease both .46s}
        .anim-5{animation:fadeUp .55s ease both .58s}
        .home-footer { position:absolute; bottom:24px; font-size:12px; color:var(--text-muted); font-family:var(--font-mono); }
        .home-footer span { color:var(--accent); }
        .user-bar { position:fixed; top:16px; right:20px; z-index:10; display:flex; align-items:center; gap:10px; background:var(--surface); border:1px solid var(--border); border-radius:100px; padding:6px 14px; font-size:12px; color:var(--text-muted); }
        .logout-btn { background:none; border:none; color:var(--text-muted); cursor:pointer; display:flex; align-items:center; gap:4px; font-family:var(--font-ui); font-size:12px; transition:color .2s; }
        .logout-btn:hover { color:#ff1744; }
      `}</style>

      <div className="user-bar">
        <span style={{ color: "var(--accent)" }}>●</span>
        <span>{user.nombre}</span>
        <button className="logout-btn" onClick={onLogout}><LogOutIcon />Salir</button>
      </div>

      <div className={`home-wrap ${visible ? "visible" : ""}`}>
        <div className="logo-ring anim-1"><div className="logo-circle"><ShieldIcon color="#00c8ff" size={44} /></div></div>
        <div className="home-badge anim-2"><span className="badge-dot" />SISTEMA DE DETECCIÓN ACTIVO</div>
        <h1 className="home-title anim-2">PhishGuard</h1>
        <p className="home-subtitle anim-3">Detecta <span>phishing, URLs maliciosas y correos fraudulentos</span> con inteligencia artificial en tiempo real.</p>
        <div className="features-row anim-4">
          <div className="feature-pill"><CheckIcon size={14} />Análisis NLP</div>
          <div className="feature-pill"><ScanIcon size={14} />Detección de URLs</div>
          <div className="feature-pill"><AlertIcon size={14} />Alertas en tiempo real</div>
        </div>
        <div className="anim-5">
          <button className="cta-btn" onClick={onStart}><ScanIcon size={20} />Comenzar análisis</button>
          <p className="cta-hint">Bienvenido, {user.nombre.split(" ")[0]} · UCEVA</p>
        </div>
        <footer className="home-footer">PhishGuard · Proyecto de Tesis · Powered by <span>ML + NLP</span></footer>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ANALYZER SCREEN
// ══════════════════════════════════════════════════════════════════════════════
function AnalyzerScreen({ user, onLogout }) {
  const [input, setInput]                       = useState("");
  const [resultado, setResultado]               = useState(null);
  const [resultadoVisible, setResultadoVisible] = useState(false);
  const [scanning, setScanning]                 = useState(false);
  const [progress, setProgress]                 = useState(0);
  const [historial, setHistorial]               = useState([]);
  const [placeholderIdx, setPlaceholderIdx]     = useState(0);
  const [activeTab, setActiveTab]               = useState("analizar");
  const [apiError, setApiError]                 = useState(false);
  const [loadingHist, setLoadingHist]           = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length), 3500);
    return () => clearInterval(t);
  }, []);

  // Cargar historial desde Supabase al abrir la pestaña
  useEffect(() => {
    if (activeTab === "historial") cargarHistorial();
  }, [activeTab]);

  const cargarHistorial = async () => {
    setLoadingHist(true);
    try {
      const { data } = await supabase
        .from('historial')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false })
        .limit(20);
      if (data) setHistorial(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHist(false);
    }
  };

  const analizar = async () => {
    if (!input.trim() || scanning) return;
    setResultado(null); setResultadoVisible(false); setApiError(false);
    setScanning(true);  setProgress(0);
    const steps = [8, 22, 41, 57, 73, 88, 95];
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 180 + Math.random() * 120));
      setProgress(steps[i]);
    }
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProgress(100);
      await new Promise(r => setTimeout(r, 300));
      setResultadoVisible(false);
      setResultado(data);
      setTimeout(() => setResultadoVisible(true), 30);

      // Guardar en Supabase
      await supabase.from('historial').insert([{
        user_email:    user.email,
        url_analizada: input.slice(0, 500),
        resultado:     data.label,
        nivel:         data.level,
        riesgo:        data.riesgo,
        color:         data.color,
      }]);

    } catch {
      setApiError(true);
    } finally {
      setScanning(false);
    }
  };

  const limpiar = () => {
    setInput(""); setResultado(null); setResultadoVisible(false); setApiError(false);
    if (textareaRef.current) textareaRef.current.focus();
  };

  const eliminarHistorial = async () => {
    await supabase.from('historial').delete().eq('user_email', user.email);
    setHistorial([]);
  };

  return (
    <>
      <style>{`
        ${BASE_STYLES}
        @keyframes fadeIn  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:none} }
        .app-wrap { position:relative; z-index:1; max-width:680px; margin:0 auto; padding:40px 20px 60px; }
        .header { text-align:center; margin-bottom:32px; }
        .badge { display:inline-flex; align-items:center; gap:7px; font-family:var(--font-mono); font-size:11px; letter-spacing:1.5px; color:var(--accent); background:rgba(0,200,255,0.08); border:1px solid rgba(0,200,255,0.2); border-radius:100px; padding:5px 14px; margin-bottom:16px; }
        .badge-dot { width:6px; height:6px; border-radius:50%; background:var(--accent); animation:pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        h1 { font-size:clamp(1.6rem,4vw,2.2rem); font-weight:800; letter-spacing:-.5px; }
        .subtitle { color:var(--text-muted); font-size:14px; margin-top:6px; }
        .tabs { display:flex; gap:4px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:4px; margin-bottom:20px; }
        .tab-btn { flex:1; padding:9px; border:none; border-radius:calc(var(--radius) - 4px); background:none; color:var(--text-muted); font-family:var(--font-ui); font-size:14px; font-weight:600; cursor:pointer; transition:all .2s; }
        .tab-btn.active { background:var(--surface2); color:var(--text); }
        .card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:24px; margin-bottom:16px; animation:fadeIn .3s ease; }
        .input-label { display:block; font-size:12px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:var(--text-muted); margin-bottom:10px; }
        .textarea-wrap { position:relative; }
        textarea { width:100%; min-height:130px; resize:vertical; background:var(--surface2); border:1px solid var(--border); border-radius:var(--radius-sm); color:var(--text); font-family:var(--font-mono); font-size:13px; line-height:1.6; padding:14px 14px 28px; outline:none; transition:border-color .2s; }
        textarea:focus { border-color:rgba(0,200,255,0.4); }
        textarea:disabled { opacity:.5; cursor:not-allowed; }
        .char-count { position:absolute; bottom:10px; right:12px; font-family:var(--font-mono); font-size:11px; color:var(--text-muted); }
        .actions { display:flex; gap:10px; margin-top:14px; flex-wrap:wrap; }
        .btn-primary { display:inline-flex; align-items:center; gap:8px; background:var(--accent); color:#080c14; font-family:var(--font-ui); font-size:14px; font-weight:700; padding:11px 24px; border:none; border-radius:var(--radius-sm); cursor:pointer; transition:opacity .2s,transform .2s; }
        .btn-primary:hover:not(:disabled) { opacity:.9; transform:translateY(-1px); }
        .btn-primary:disabled { opacity:.4; cursor:not-allowed; }
        .btn-ghost { background:none; border:1px solid var(--border); color:var(--text-muted); font-family:var(--font-ui); font-size:14px; font-weight:600; padding:11px 20px; border-radius:var(--radius-sm); cursor:pointer; transition:all .2s; }
        .btn-ghost:hover { border-color:rgba(255,255,255,.15); color:var(--text); }
        .scanner { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:24px; margin-bottom:16px; animation:fadeIn .3s ease; }
        .scanner-label { font-family:var(--font-mono); font-size:12px; color:var(--accent); letter-spacing:1px; margin-bottom:14px; }
        .progress-bar-track { height:4px; background:rgba(255,255,255,.06); border-radius:100px; overflow:hidden; margin-bottom:8px; }
        .progress-bar-fill { height:100%; background:var(--accent); border-radius:100px; transition:width .3s ease; }
        .progress-pct { font-family:var(--font-mono); font-size:12px; color:var(--text-muted); margin-bottom:14px; }
        .scan-steps { display:flex; gap:10px; flex-wrap:wrap; margin-top:4px; }
        .scan-step { display:inline-flex; align-items:center; gap:6px; font-family:var(--font-mono); font-size:11px; padding:6px 14px; border-radius:100px; background:var(--surface2); color:var(--text-muted); border:1px solid var(--border); transition:all .4s ease; letter-spacing:.5px; opacity:.5; }
        .scan-step .step-dot { width:6px; height:6px; border-radius:50%; background:var(--text-muted); transition:background .4s ease; flex-shrink:0; }
        .scan-step.active { background:rgba(0,200,255,0.12); color:var(--accent); border-color:rgba(0,200,255,0.4); opacity:1; box-shadow:0 0 10px rgba(0,200,255,0.15); }
        .scan-step.active .step-dot { background:var(--accent); box-shadow:0 0 6px rgba(0,200,255,0.6); }
        .scan-step.done { background:rgba(0,230,118,0.08); color:#00e676; border-color:rgba(0,230,118,.3); opacity:1; }
        .scan-step.done .step-dot { background:#00e676; }
        .result-card { border-radius:var(--radius); padding:24px; margin-bottom:16px; transition:background .5s ease,border-color .5s ease,box-shadow .5s ease,opacity .4s ease,transform .4s ease; }
        .result-header { display:flex; align-items:flex-start; gap:16px; margin-bottom:20px; }
        .result-icon-wrap { width:52px; height:52px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .result-title { font-family:var(--font-mono); font-size:20px; font-weight:700; letter-spacing:1px; }
        .result-sub { font-size:13px; color:var(--text-muted); margin-top:4px; }
        .risk-row { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
        .risk-label { font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); white-space:nowrap; }
        .risk-track { flex:1; height:8px; background:rgba(255,255,255,.06); border-radius:100px; overflow:hidden; }
        .risk-fill { height:100%; border-radius:100px; transition:width 1s cubic-bezier(.4,0,.2,1); }
        .risk-pct { font-family:var(--font-mono); font-size:14px; font-weight:700; width:42px; text-align:right; flex-shrink:0; }
        .reasons-title { font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:var(--text-muted); margin-bottom:10px; }
        .reason-item { display:flex; align-items:flex-start; gap:10px; font-size:13.5px; padding:9px 0; border-bottom:1px solid rgba(255,255,255,.04); line-height:1.5; }
        .reason-item:last-child { border-bottom:none; }
        .reason-dot { width:5px; height:5px; border-radius:50%; margin-top:7px; flex-shrink:0; }
        .api-error { background:rgba(255,23,68,0.07); border:1px solid rgba(255,23,68,.3); border-radius:var(--radius); padding:20px 24px; display:flex; align-items:flex-start; gap:14px; margin-bottom:16px; animation:fadeIn .3s ease; }
        .api-error-icon { flex-shrink:0; color:#ff1744; margin-top:2px; }
        .api-error-title { font-family:var(--font-mono); font-size:14px; font-weight:700; color:#ff1744; margin-bottom:4px; }
        .api-error-msg { font-size:13px; color:var(--text-muted); line-height:1.6; }
        .api-error-code { font-family:var(--font-mono); font-size:11px; color:#5a6a82; margin-top:8px; background:rgba(0,0,0,.3); padding:6px 10px; border-radius:6px; display:inline-block; }
        .empty-state { text-align:center; padding:48px 0; color:var(--text-muted); }
        .hist-item { display:flex; align-items:center; gap:14px; padding:14px 0; border-bottom:1px solid var(--border); animation:slideIn .25s ease; }
        .hist-item:last-child { border-bottom:none; }
        .hist-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
        .hist-text { flex:1; font-family:var(--font-mono); font-size:12px; color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .hist-badge { font-size:10px; font-weight:700; letter-spacing:.5px; padding:3px 9px; border-radius:100px; font-family:var(--font-mono); flex-shrink:0; }
        .hist-time { font-size:11px; color:var(--text-muted); flex-shrink:0; display:flex; align-items:center; gap:4px; }
        .clear-btn { font-size:12px; color:var(--text-muted); background:none; border:none; cursor:pointer; display:flex; align-items:center; gap:5px; font-family:var(--font-ui); transition:color .2s; }
        .clear-btn:hover { color:#ff1744; }
        .hist-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
        .footer { text-align:center; margin-top:40px; color:var(--text-muted); font-size:12px; }
        .footer span { color:var(--accent); }
        .user-bar { position:fixed; top:16px; right:20px; z-index:10; display:flex; align-items:center; gap:10px; background:var(--surface); border:1px solid var(--border); border-radius:100px; padding:6px 14px; font-size:12px; color:var(--text-muted); }
        .logout-btn { background:none; border:none; color:var(--text-muted); cursor:pointer; display:flex; align-items:center; gap:4px; font-family:var(--font-ui); font-size:12px; transition:color .2s; }
        .logout-btn:hover { color:#ff1744; }
        .loading-hist { text-align:center; padding:32px; color:var(--text-muted); font-family:var(--font-mono); font-size:13px; }
      `}</style>

      <div className="user-bar">
        <span style={{ color: "var(--accent)" }}>●</span>
        <span>{user.email}</span>
        <button className="logout-btn" onClick={onLogout}><LogOutIcon />Salir</button>
      </div>

      <div className="app-wrap">
        <header className="header">
          <div className="badge"><span className="badge-dot" />SISTEMA ACTIVO · IA CONECTADA</div>
          <h1>Detector de Phishing</h1>
          <p className="subtitle">Analiza mensajes y URLs con inteligencia artificial en tiempo real</p>
        </header>

        <div className="tabs">
          <button className={`tab-btn ${activeTab === "analizar" ? "active" : ""}`} onClick={() => setActiveTab("analizar")}>Analizar</button>
          <button className={`tab-btn ${activeTab === "historial" ? "active" : ""}`} onClick={() => setActiveTab("historial")}>
            Historial {historial.length > 0 && `(${historial.length})`}
          </button>
        </div>

        {activeTab === "analizar" && (
          <>
            <div className="card">
              <label className="input-label">Contenido a analizar</label>
              <div className="textarea-wrap">
                <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} placeholder={PLACEHOLDERS[placeholderIdx]} disabled={scanning} />
                <span className="char-count">{input.length}</span>
              </div>
              <div className="actions">
                <button className="btn-primary" onClick={analizar} disabled={scanning || !input.trim()}>
                  <ScanIcon size={18} />{scanning ? "Analizando..." : "Analizar"}
                </button>
                {(input || resultado || apiError) && !scanning && (
                  <button className="btn-ghost" onClick={limpiar}>Limpiar</button>
                )}
              </div>
            </div>

            {scanning && (
              <div className="scanner">
                <p className="scanner-label">● ESCANEANDO CONTENIDO CON IA...</p>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>
                <p className="progress-pct">{progress}%</p>
                <div className="scan-steps">
                  {SCAN_STEPS.map(step => {
                    const isDone   = progress > step.threshold + 15;
                    const isActive = !isDone && progress >= step.threshold;
                    return (
                      <span key={step.label} className={`scan-step ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}>
                        <span className="step-dot" />{isDone ? `✓ ${step.label}` : step.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {!scanning && apiError && (
              <div className="api-error">
                <span className="api-error-icon"><WifiOffIcon size={22} /></span>
                <div>
                  <div className="api-error-title">API no disponible</div>
                  <div className="api-error-msg">No se pudo conectar con el servidor de IA.</div>
                  <div className="api-error-code">uvicorn api:app --reload --port 8000</div>
                </div>
              </div>
            )}

            {!scanning && resultado && (
              <div className="result-card" style={{
                background: resultado.bg, border: `1px solid ${resultado.border}`,
                boxShadow: `0 0 24px ${resultado.color}22`,
                opacity: resultadoVisible ? 1 : 0,
                transform: resultadoVisible ? "translateY(0)" : "translateY(10px)",
              }}>
                <div className="result-header">
                  <div className="result-icon-wrap" style={{ background: `${resultado.color}22` }}>
                    {resultado.level === "safe"   && <CheckIcon size={26} />}
                    {resultado.level === "warn"   && <AlertIcon size={26} />}
                    {resultado.level === "danger" && <XCircleIcon size={26} />}
                  </div>
                  <div>
                    <div className="result-title" style={{ color: resultado.color }}>{resultado.label}</div>
                    <div className="result-sub">
                      {resultado.level === "safe"   && "✅ Contenido verificado — No se detectaron amenazas"}
                      {resultado.level === "warn"   && "⚠️ Procede con cautela — se encontraron anomalías"}
                      {resultado.level === "danger" && "🚨 ¡ALERTA! Phishing confirmado — No interactúes con este contenido"}
                    </div>
                  </div>
                </div>
                <div className="risk-row">
                  <span className="risk-label">Nivel de riesgo</span>
                  <div className="risk-track">
                    <div className="risk-fill" style={{ width: `${resultado.riesgo}%`, background: resultado.color }} />
                  </div>
                  <span className="risk-pct" style={{ color: resultado.color }}>{resultado.riesgo}%</span>
                </div>
                <div className="reasons-title">Factores detectados</div>
                {resultado.reasons.map(r => (
                  <div key={r} className="reason-item">
                    <span className="reason-dot" style={{ background: resultado.color }} />{r}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "historial" && (
          <div className="card">
            <div className="hist-header">
              <span className="input-label" style={{ margin: 0 }}>Mis análisis guardados</span>
              {historial.length > 0 && (
                <button className="clear-btn" onClick={eliminarHistorial}><TrashIcon />Limpiar todo</button>
              )}
            </div>
            {loadingHist ? (
              <div className="loading-hist">Cargando historial...</div>
            ) : historial.length === 0 ? (
              <div className="empty-state"><ShieldIcon size={48} color="currentColor" /><p>Aún no has analizado ningún contenido</p></div>
            ) : historial.map(item => (
              <div className="hist-item" key={item.id}>
                <span className="hist-dot" style={{ background: item.color }} />
                <span className="hist-text">{item.url_analizada}</span>
                <span className="hist-badge" style={{ background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}50` }}>{item.resultado}</span>
                <span className="hist-time">
                  <ClockIcon />
                  {new Date(item.created_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", timeZone: "America/Bogota" })}
                </span>
              </div>
            ))}
          </div>
        )}

        <footer className="footer">
          <p>PhishGuard — Proyecto de Tesis · Powered by <span>ML + NLP</span></p>
        </footer>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("auth");
  const [user,   setUser]   = useState(null);

  useEffect(() => {
    const email = getSession();
    if (email) {
      supabase.from('usuarios').select('*').eq('email', email).single()
        .then(({ data }) => {
          if (data) { setUser(data); setScreen("home"); }
        });
    }
  }, []);

  const handleLogin  = (u) => { setUser(u); setScreen("home"); };
  const handleLogout = ()  => { clearSession(); setUser(null); setScreen("auth"); };

  if (screen === "auth")     return <AuthScreen onLogin={handleLogin} />;
  if (screen === "home")     return <HomeScreen user={user} onStart={() => setScreen("analyzer")} onLogout={handleLogout} />;
  if (screen === "analyzer") return <AnalyzerScreen user={user} onLogout={handleLogout} />;
}
