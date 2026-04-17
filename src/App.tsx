import { motion, AnimatePresence } from "motion/react";
import { 
  Flame, 
  Code2, 
  Palette, 
  Zap, 
  ArrowRight, 
  Globe, 
  Mail, 
  Phone,
  Cpu,
  ArrowUpRight,
  Users,
  LayoutDashboard,
  Settings,
  FolderOpen,
  LogOut,
  ChevronRight,
  Save,
  Plus,
  Trash2,
  X,
  Edit
} from "lucide-react";
import { useState, useEffect } from "react";
import React from "react";
import { Routes, Route, Link, useNavigate, Navigate, useParams } from "react-router-dom";
import { auth, db } from "./firebase";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User 
} from "firebase/auth";
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy,
  getDoc
} from "firebase/firestore";

// --- Types ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // In a real app we might show a notification here
}

interface Service {
  id?: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  footerAbout: string;
}

// --- Icons Mapping ---
const iconMap: Record<string, any> = {
  Code2: <Code2 />,
  Palette: <Palette />,
  Cpu: <Cpu />,
  Zap: <Zap />,
  Globe: <Globe />,
  Settings: <Settings />,
  Monitor: <LayoutDashboard />
};

// --- Components ---

function Nav({ isScrolled }: { isScrolled: boolean }) {
  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-display ${
        isScrolled ? "bg-bg-dark/80 backdrop-blur-md border-b border-white/10 py-4" : "py-8"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group cursor-pointer no-underline text-white">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center fire-glow transform group-hover:rotate-12 transition-transform">
            <Flame className="text-white fill-current w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tighter">digifire</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-12 text-sm font-medium uppercase tracking-widest text-white/70">
          <a href="@/src/App#services" className="hover:text-brand transition-colors no-underline">Služby</a>
          <a href="@/src/App#projects" className="hover:text-brand transition-colors no-underline">Portfolio</a>
          <Link to="/login" className="hover:text-brand transition-colors no-underline">Admin</Link>
          <button className="px-6 py-2.5 bg-white text-bg-dark rounded-full hover:bg-brand hover:text-white transition-all duration-300 font-bold border-none cursor-pointer">
            Poptávka
          </button>
        </div>
      </div>
    </nav>
  );
}

function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    
    // Fetch Services
    const qServices = query(collection(db, "services"), orderBy("order", "asc"));
    const unsubServices = onSnapshot(qServices, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "services"));

    // Fetch Settings
    const unsubSettings = onSnapshot(doc(db, "siteSettings", "main"), (doc) => {
      if (doc.exists()) setSettings(doc.data() as SiteSettings);
    }, (err) => handleFirestoreError(err, OperationType.GET, "siteSettings/main"));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      unsubServices();
      unsubSettings();
    };
  }, []);

  const defaultHero = {
    heroTitle: "Nápady, které předběhnou dobu.",
    heroSubtitle: "Pomáháme firemním vizionářům budovat digitální produkty nové generace. Od designu po robustní technologická řešení založená na AI.",
    footerAbout: "Jsme tu, abychom rozdmýchali potenciál vaší značky skrze špičkový design a moderní technologie."
  };

  const currentSettings = settings || defaultHero;

  return (
    <div className="min-h-screen">
      <Nav isScrolled={isScrolled} />
      
      {/* Hero Section */}
      <section className="relative pt-64 pb-32">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-brand/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-semibold uppercase tracking-[0.2em] text-brand mb-8 animate-pulse">
               DIGITÁLNÍ AGENTURA DIGIFIRE
            </div>
            <h1 className="text-6xl md:text-8xl font-bold leading-[0.9] tracking-tighter mb-8 italic">
              <span className="text-gradient leading-tight block mb-4">{currentSettings.heroTitle.split(' ').slice(0, 2).join(' ')}</span>
              <span className="text-white">{currentSettings.heroTitle.split(' ').slice(2).join(' ')}</span>
            </h1>
            <p className="text-xl text-white/60 mb-12 max-w-2xl font-light leading-relaxed">
              {currentSettings.heroSubtitle}
            </p>
            <div className="flex gap-4">
              <button className="group px-8 py-5 bg-brand text-white rounded-2xl flex items-center justify-center gap-3 font-bold text-lg hover:bg-brand-alt transition-all fire-glow border-none cursor-pointer">
                Začněte svůj projekt <ArrowRight />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 bg-bg-dark border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-brand mb-4">Naše Specializace</h2>
            <p className="text-4xl md:text-5xl font-bold tracking-tighter">Služby, které <span className="text-white/30 italic">fungují.</span></p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.length > 0 ? services.map((s, i) => (
              <div key={s.id} className="p-10 bg-bg-offset rounded-3xl border border-white/5 transition-all hover:border-brand/40 group">
                <div className="text-brand mb-6 transition-transform group-hover:scale-110">
                  {iconMap[s.icon] || <Zap />}
                </div>
                <h3 className="text-xl font-bold mb-4">{s.title}</h3>
                <p className="text-white/40 font-light leading-relaxed">{s.description}</p>
              </div>
            )) : (
              <p className="text-white/20 italic">Zatím jsme nepřidali žádné služby...</p>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg-dark border-t border-white/5 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
                 <Flame className="text-white fill-current w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tighter italic uppercase">digifire</span>
            </div>
            <p className="text-white/40 max-w-md italic text-lg leading-relaxed">
              {currentSettings.footerAbout}
            </p>
          </div>
          <div className="pt-12 border-t border-white/5 flex justify-between items-center text-white/20 text-xs font-bold tracking-[0.2em] uppercase">
            <span>© 2026 DIGIFIRE AGENCY</span>
            <div className="flex gap-8">
               <a href="@/src/App#" className="hover:text-brand transition-colors">Instagram</a>
               <a href="@/src/App#" className="hover:text-brand transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LoginPage({ user }: { user: User | null }) {
  const navigate = useNavigate();
  useEffect(() => { if (user) navigate("/admin"); }, [user, navigate]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-dark relative overflow-hidden font-display">
       <div className="absolute inset-0 bg-brand/5 blur-[150px] rounded-full" />
       <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm bg-bg-offset border border-white/10 p-12 rounded-[48px] text-center shadow-2xl relative z-10">
          <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-10 fire-glow">
            <Flame className="w-10 h-10 fill-current text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2 tracking-tighter uppercase italic">Digifire Hub</h2>
          <p className="text-white/40 mb-10 text-sm">Administrace agentury</p>
          <button onClick={handleLogin} className="w-full py-4 bg-white text-bg-dark rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-brand hover:text-white transition-all border-none cursor-pointer">
             Přihlásit se přes Google
          </button>
       </motion.div>
    </div>
  );
}

// --- Admin Sub-pages ---

function AdminDashboard() {
  const adminModules = [
    { title: "Obsah webu", link: "/admin/settings", icon: <Settings />, color: "bg-blue-500", desc: "Hero sekce, patička" },
    { title: "Služby", link: "/admin/services", icon: <LayoutDashboard />, color: "bg-brand", desc: "Správa portfolia služeb" },
    { title: "Poptávky", link: "/admin/leads", icon: <Mail />, color: "bg-emerald-500", desc: "Zájemci o spolupráci" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {adminModules.map((m, i) => (
        <Link to={m.link} key={i} className="group bg-bg-offset border border-white/5 p-10 rounded-[40px] cursor-pointer hover:border-brand/40 transition-colors no-underline text-white">
          <div className={`w-14 h-14 ${m.color} rounded-2xl flex items-center justify-center mb-8 shadow-xl transition-transform group-hover:scale-110`}>
             {m.icon}
          </div>
          <h3 className="text-2xl font-bold mb-2 tracking-tight">{m.title}</h3>
          <p className="text-white/40 text-sm mb-8">{m.desc}</p>
          <div className="flex items-center gap-2 text-brand font-bold text-xs uppercase tracking-[0.2em]">
            Administrovat <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
      ))}
    </div>
  );
}

function AdminSiteSettings() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    heroTitle: "",
    heroSubtitle: "",
    footerAbout: ""
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const d = await getDoc(doc(db, "siteSettings", "main"));
        if (d.exists()) setSettings(d.data() as SiteSettings);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, "siteSettings/main");
      }
    };
    fetch();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, "siteSettings", "main"), settings);
      alert("Uloženo!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "siteSettings/main");
      alert("Chyba při ukládání – zkontrolujte oprávnění v konzoli.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl">
       <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold tracking-tighter">Nastavení obsahu webu</h2>
          <Link to="/admin" className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white no-underline">Zpět</Link>
       </div>
       
       <form onSubmit={handleSave} className="space-y-8 bg-bg-offset border border-white/5 p-10 rounded-[40px]">
          <div className="space-y-2">
             <label className="text-[10px] uppercase font-bold tracking-widest text-brand">Hlavní nadpis (Hero)</label>
             <input 
                value={settings.heroTitle}
                onChange={e => setSettings({...settings, heroTitle: e.target.value})}
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-brand/50 transition-colors"
                placeholder="Nápady, které předběhnou dobu."
             />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] uppercase font-bold tracking-widest text-brand">Podnadpis (Hero)</label>
             <textarea 
                value={settings.heroSubtitle}
                rows={4}
                onChange={e => setSettings({...settings, heroSubtitle: e.target.value})}
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-brand/50 transition-colors"
                placeholder="Krátký popis agentury..."
             />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] uppercase font-bold tracking-widest text-brand">O nás (Patička)</label>
             <textarea 
                value={settings.footerAbout}
                rows={3}
                onChange={e => setSettings({...settings, footerAbout: e.target.value})}
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-brand/50 transition-colors"
             />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="px-10 py-5 bg-brand text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 hover:bg-brand-alt transition-all border-none cursor-pointer fire-glow"
          >
             <Save className="w-5 h-5" />
             {loading ? "Ukládám..." : "Uložit změny"}
          </button>
       </form>
    </div>
  );
}

function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);

  useEffect(() => {
    const q = query(collection(db, "services"), orderBy("order", "asc"));
    return onSnapshot(q, s => {
      setServices(s.docs.map(d => ({ id: d.id, ...d.data() } as Service)));
    }, err => handleFirestoreError(err, OperationType.LIST, "services"));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      if (editing.id) {
        await updateDoc(doc(db, "services", editing.id), editing as any);
      } else {
        await addDoc(collection(db, "services"), editing);
      }
      setEditing(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "services");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Opravdu smazat?")) {
      try {
        await deleteDoc(doc(db, "services", id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `services/${id}`);
      }
    }
  };

  return (
    <div className="max-w-5xl">
       <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold tracking-tighter">Správa služeb</h2>
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => setEditing({ title: "", description: "", icon: "Zap", order: services.length })}
              className="px-6 py-3 bg-brand text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 border-none cursor-pointer"
            >
               <Plus className="w-4 h-4" /> Nová služba
            </button>
            <Link to="/admin" className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white no-underline">Zpět</Link>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map(s => (
            <div key={s.id} className="bg-bg-offset border border-white/5 p-8 rounded-[32px] flex justify-between items-start">
               <div>
                  <div className="text-brand mb-4">{iconMap[s.icon] || <Zap />}</div>
                  <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                  <p className="text-white/30 text-sm italic">{s.description.slice(0, 60)}...</p>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => setEditing(s)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border-none cursor-pointer"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(s.id!)} className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all border-none cursor-pointer"><Trash2 className="w-4 h-4" /></button>
               </div>
            </div>
          ))}
       </div>

       {/* Edit Modal */}
       <AnimatePresence>
          {editing && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg-dark/80 backdrop-blur-md">
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="w-full max-w-xl bg-bg-offset border border-white/10 p-10 rounded-[40px] shadow-3xl">
                 <div className="flex justify-between items-center mb-8">
                   <h3 className="text-2xl font-bold">{editing.id ? "Editovat službu" : "Nová služba"}</h3>
                   <button onClick={() => setEditing(null)} className="p-2 border-none bg-transparent cursor-pointer text-white/30 hover:text-white"><X /></button>
                 </div>
                 <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand">Název</label>
                        <input value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand">Ikona (Lucide Name)</label>
                        <select value={editing.icon} onChange={e => setEditing({...editing, icon: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none">
                           {Object.keys(iconMap).map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-brand">Popis</label>
                      <textarea value={editing.description} rows={3} onChange={e => setEditing({...editing, description: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none" required />
                    </div>
                    <button type="submit" className="w-full py-5 bg-brand text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-brand-alt transition-all border-none cursor-pointer fire-glow">Uložit službu</button>
                 </form>
              </motion.div>
            </div>
          )}
       </AnimatePresence>
    </div>
  );
}

function AdminLayout({ user, children }: { user: User | null, children: React.ReactNode }) {
  const navigate = useNavigate();
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col font-sans">
       <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-bg-offset/30 backdrop-blur-md">
          <Link to="/" className="flex items-center gap-2 group no-underline text-white">
            <Flame className="text-brand w-6 h-6" />
            <span className="font-bold tracking-tighter uppercase text-sm italic">Digifire Hub</span>
          </Link>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold tracking-tight">{user.displayName}</span>
                <span className="text-[9px] text-white/30 uppercase tracking-[0.2em]">{user.email}</span>
            </div>
            <img src={user.photoURL || ""} className="w-10 h-10 rounded-full border border-white/10" alt="Avatar" />
            <button onClick={() => signOut(auth)} className="p-2.5 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all border-none cursor-pointer">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
       </header>
       <main className="p-10 max-w-7xl mx-auto w-full flex-1">
          {children}
       </main>
    </div>
  );
}

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => { 
      setUser(u); 
      setLoading(false);
      
      // Bootstrap first admin user doc if needed
      if (u && u.email?.toLowerCase() === "filipmachala88@gmail.com") {
        try {
          const userRef = doc(db, "users", u.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: u.uid,
              email: u.email,
              role: "admin"
            });
            console.log("Admin user bootstrapped successfully.");
          }
        } catch (err) {
          // This might fail if rules are not yet ready, which is fine
          console.warn("User bootstrap attempted but failed:", err);
        }
      }
    });
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-bg-dark"><div className="w-12 h-12 bg-brand rounded-xl animate-spin" /></div>;

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage user={user} />} />
      <Route path="/admin" element={<AdminLayout user={user}><AdminDashboard /></AdminLayout>} />
      <Route path="/admin/settings" element={<AdminLayout user={user}><AdminSiteSettings /></AdminLayout>} />
      <Route path="/admin/services" element={<AdminLayout user={user}><AdminServices /></AdminLayout>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
