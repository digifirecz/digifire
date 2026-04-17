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
  Edit,
  Sun,
  Moon,
  CheckCircle,
  Clock
} from "lucide-react";
import { useState, useEffect, createContext, useContext } from "react";
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

interface Project {
  id?: string;
  title: string;
  category: string;
  description: string;
  image: string;
  order: number;
}

interface Lead {
  id?: string;
  name: string;
  email: string;
  message: string;
  status: "new" | "contacted" | "closed";
  createdAt: string;
}

interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  footerAbout: string;
}

// --- Theme Manager ---

function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-brand/10 hover:border-brand/40 transition-all text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-brand cursor-pointer border-none"
    >
      {theme === "dark" ? (
        <>
          <Sun className="w-4 h-4" /> Světlý režim
        </>
      ) : (
        <>
          <Moon className="w-4 h-4" /> Tmavý režim
        </>
      )}
    </button>
  );
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
        isScrolled ? "bg-[var(--bg-main)]/80 backdrop-blur-md border-b border-[var(--border-main)] py-4" : "py-8"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group cursor-pointer no-underline text-[var(--text-main)]">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center fire-glow transform group-hover:rotate-12 transition-transform">
            <Flame className="text-white fill-current w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tighter">digifire</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-12 text-sm font-medium uppercase tracking-widest text-[var(--text-muted)]">
          <a href="#services" className="hover:text-brand transition-colors no-underline">Služby</a>
          <a href="#projects" className="hover:text-brand transition-colors no-underline">Portfolio</a>
          <Link to="/login" className="hover:text-brand transition-colors no-underline">Admin</Link>
          <a href="#contact" className="px-6 py-2.5 bg-brand text-white rounded-full hover:bg-brand-alt transition-all duration-300 font-bold border-none cursor-pointer no-underline inline-block">
            Poptávka
          </a>
        </div>
      </div>
    </nav>
  );
}

function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    
    // Fetch Services
    const qServices = query(collection(db, "services"), orderBy("order", "asc"));
    const unsubServices = onSnapshot(qServices, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "services"));

    // Fetch Projects
    const qProjects = query(collection(db, "projects"), orderBy("order", "asc"));
    const unsubProjects = onSnapshot(qProjects, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "projects"));

    // Fetch Settings
    const unsubSettings = onSnapshot(doc(db, "siteSettings", "main"), (doc) => {
      if (doc.exists()) setSettings(doc.data() as SiteSettings);
    }, (err) => handleFirestoreError(err, OperationType.GET, "siteSettings/main"));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      unsubServices();
      unsubProjects();
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
    <div className="min-h-screen overflow-x-hidden">
      <Nav isScrolled={isScrolled} />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-32 pb-32 overflow-hidden">
        {/* Immersive Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" 
            alt="Space Tech" 
            className="w-full h-full object-cover opacity-20 dark:opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-main)] via-transparent to-[var(--bg-main)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-main)] via-transparent to-transparent" />
        </div>

        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-brand/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
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
              <span className="text-[var(--text-main)]">{currentSettings.heroTitle.split(' ').slice(2).join(' ')}</span>
            </h1>
            <p className="text-xl text-[var(--text-muted)] mb-12 max-w-2xl font-light leading-relaxed">
              {currentSettings.heroSubtitle}
            </p>
            <div className="flex gap-4">
              <a href="#contact" className="group px-8 py-5 bg-brand text-white rounded-2xl flex items-center justify-center gap-3 font-bold text-lg hover:bg-brand-alt transition-all fire-glow border-none cursor-pointer no-underline">
                Začněte svůj projekt <ArrowRight />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 bg-[var(--bg-offset)] border-y border-[var(--border-main)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--brand) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="mb-20">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-brand mb-4">Naše Specializace</h2>
            <p className="text-4xl md:text-5xl font-bold tracking-tighter">Služby, které <span className="text-[var(--text-muted)] italic">fungují.</span></p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.length > 0 ? services.map((s, i) => (
              <div key={s.id} className="p-8 bg-[var(--bg-main)] rounded-[40px] border border-[var(--border-main)] transition-all hover:border-brand/40 group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand/10 transition-colors" />
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-3">
                    {iconMap[s.icon] || <Zap />}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 tracking-tight">{s.title}</h3>
                  <p className="text-[var(--text-muted)] font-light leading-relaxed mb-4">{s.description}</p>
                </div>
              </div>
            )) : (
              <p className="text-[var(--text-muted)] opacity-50 italic">Zatím jsme nepřidali žádné služby...</p>
            )}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-32 bg-[var(--bg-main)] relative overflow-hidden">
        {/* Atmospheric Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="flex justify-between items-end mb-20">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-brand mb-4">Vybrané práce</h2>
              <p className="text-4xl md:text-5xl font-bold tracking-tighter">Naše <span className="text-[var(--text-muted)] italic">Portfolio.</span></p>
            </div>
            <button className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-brand transition-colors bg-transparent border-none cursor-pointer">
              Všechny projekty <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {projects.length > 0 ? projects.map((p, i) => (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-[40px] aspect-[16/10] mb-8 bg-[var(--bg-offset)] border border-[var(--border-main)]">
                  <img 
                    src={p.image} 
                    alt={p.title} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-brand/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 bg-white text-brand rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-500">
                      <ArrowUpRight className="w-8 h-8" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand mb-2 block">{p.category}</span>
                    <h3 className="text-3xl font-bold tracking-tight text-[var(--text-main)] group-hover:text-brand transition-colors">{p.title}</h3>
                  </div>
                </div>
              </motion.div>
            )) : (
              <p className="text-[var(--text-muted)] opacity-50 italic">Na portfoliu právě pracujeme...</p>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 bg-[var(--bg-offset)] border-t border-[var(--border-main)] overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="bg-[var(--bg-offset)] border border-[var(--border-main)] rounded-[60px] p-8 md:p-20 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Flame className="w-64 h-64 text-brand" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-brand mb-6">Kontaktujte nás</h2>
                <h3 className="text-5xl md:text-6xl font-bold tracking-tighter mb-8 italic">Pojďme zapálit <br /><span className="text-gradient">váš nápad.</span></h3>
                <p className="text-lg text-[var(--text-muted)] font-light leading-relaxed mb-12 max-w-md">
                  Máte v hlavě projekt, který potřebuje digitální jiskru? Vyplňte formulář a my se vám ozveme do 24 hodin.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-brand/10 text-brand rounded-xl flex items-center justify-center"><Mail className="w-6 h-6" /></div>
                    <span className="text-lg font-medium">info@digifire.cz</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-brand/10 text-brand rounded-xl flex items-center justify-center"><Phone className="w-6 h-6" /></div>
                    <span className="text-lg font-medium">+420 777 888 999</span>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--bg-main)] border-t border-[var(--border-main)] pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-12">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
                   <Flame className="text-white fill-current w-6 h-6" />
                </div>
                <span className="text-2xl font-bold tracking-tighter italic uppercase">digifire</span>
              </div>
              <p className="text-[var(--text-muted)] max-w-md italic text-lg leading-relaxed">
                {currentSettings.footerAbout}
              </p>
            </div>
            <ThemeToggle />
          </div>
          <div className="pt-12 border-t border-[var(--border-main)] flex justify-between items-center text-[var(--text-muted)] text-xs font-bold tracking-[0.2em] uppercase">
            <span>© 2026 DIGIFIRE AGENCY</span>
            <div className="flex gap-8">
               <a href="#" className="hover:text-brand transition-colors">Instagram</a>
               <a href="#" className="hover:text-brand transition-colors">LinkedIn</a>
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
      provider.setCustomParameters({ prompt: 'select_account' });
      
      // Zkusíme nejdřív popup, ale pokud narazíme na tiché selhání, redirect je jistota
      await signInWithPopup(auth, provider).catch(async (e) => {
        console.error("Popup failed, switching to redirect:", e);
        await signInWithRedirect(auth, provider);
      });
    } catch (e: any) {
      alert("Kritická chyba: " + e.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-main)] relative overflow-hidden font-display">
       <div className="absolute inset-0 bg-brand/5 blur-[150px] rounded-full" />
       <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm bg-[var(--bg-offset)] border border-[var(--border-main)] p-12 rounded-[48px] text-center shadow-2xl relative z-10">
          <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-10 fire-glow">
            <Flame className="w-10 h-10 fill-current text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2 tracking-tighter uppercase italic text-[var(--text-main)]">Digifire Hub</h2>
          <p className="text-[var(--text-muted)] mb-10 text-sm">Administrace agentury</p>
          <button onClick={handleLogin} className="w-full py-4 bg-brand text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-brand-alt transition-all border-none cursor-pointer">
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
    { title: "Portfolio", link: "/admin/projects", icon: <FolderOpen />, color: "bg-purple-500", desc: "Ukázky realizovaných projektů" },
    { title: "Poptávky", link: "/admin/leads", icon: <Mail />, color: "bg-emerald-500", desc: "Zájemci o spolupráci" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {adminModules.map((m, i) => (
        <Link to={m.link} key={i} className="group bg-[var(--bg-offset)] border border-[var(--border-main)] p-10 rounded-[40px] cursor-pointer hover:border-brand/40 transition-colors no-underline text-white">
          <div className={`w-14 h-14 ${m.color} rounded-2xl flex items-center justify-center mb-8 shadow-xl transition-transform group-hover:scale-110`}>
             {m.icon}
          </div>
          <h3 className="text-2xl font-bold mb-2 tracking-tight text-[var(--text-main)]">{m.title}</h3>
          <p className="text-[var(--text-muted)] text-sm mb-8">{m.desc}</p>
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
  const [status, setStatus] = useState<{ type: "success" | "error" | "info", msg: string } | null>(null);
  const [settings, setSettings] = useState<SiteSettings>({
    heroTitle: "",
    heroSubtitle: "",
    footerAbout: ""
  });

  useEffect(() => {
    if (status) {
      const t = setTimeout(() => setStatus(null), 5000);
      return () => clearTimeout(t);
    }
  }, [status]);

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
    setStatus({ type: "info", msg: "Ukládám..." });
    try {
      await setDoc(doc(db, "siteSettings", "main"), settings);
      setStatus({ type: "success", msg: "Nastavení úspěšně uloženo!" });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "siteSettings/main");
      setStatus({ type: "error", msg: "Chyba při ukládání. Zkontrolujte konzoli." });
    }
    setLoading(false);
  };

  const seedProfessionalData = async () => {
    setLoading(true);
    setStatus({ type: "info", msg: "Probíhá zápis profesionálních dat..." });
    try {
      // Seed Site Settings
      const profSettings = {
        heroTitle: "Digitální inovace, které definují standardy trhu.",
        heroSubtitle: "Propojujeme špičkový produktový design a precizní engineering. Pomáháme vizionářům budovat produkty, které akcelerují růst a definují budoucnost digitálního světa.",
        footerAbout: "Jsme technologický partner pro firmy, které vyžadují víc než jen kód. V Digifire zapalujeme potenciál vaší značky skrze inovace a strategický design."
      };
      await setDoc(doc(db, "siteSettings", "main"), profSettings);
      setSettings(profSettings);

      // Seed Services
      const profServices = [
        { title: "Produktový Design", description: "Vytváříme intuitivní UX/UI rozhraní založená na datech, která maximalizují konverzi a loajalitu uživatelů.", icon: "Palette", order: 0 },
        { title: "Engineering", description: "Vyvíjíme robustní cloudové systémy a škálovatelné webové aplikace s důrazem na extrémní výkon.", icon: "Code2", order: 1 },
        { title: "AI Integrace", description: "Implementujeme pokročilé LLM modely a automatizujeme firemní procesy pro získání technologického náskoku.", icon: "Cpu", order: 2 },
        { title: "Digitální Strategie", description: "Definujeme vizuální identity a strategie, které rezonují s cílovou skupinou v moderním digitálním věku.", icon: "Globe", order: 3 }
      ];

      for (const s of profServices) {
        await addDoc(collection(db, "services"), s);
      }

      // Seed Portfolio
      const profProjects = [
        { title: "Nexia AI Platform", category: "Fintech / AI", image: "https://picsum.photos/seed/nexia/1200/800", description: "Komplexní dashboard pro analýzu trhu v reálném čase s využitím prediktivních modelů.", order: 0 },
        { title: "Ethera Brand Identity", category: "Branding", image: "https://picsum.photos/seed/ethera/1200/800", description: "Kompletní vizuální identita a designový systém pro moderní krypto-banku.", order: 1 },
        { title: "Voltify E-mobility", category: "Product Design", image: "https://picsum.photos/seed/voltify/1200/800", description: "Mobilní aplikace pro správu flotily sdílených elektrokol po celé Evropě.", order: 2 },
        { title: "Aura Smart Home", category: "IoT / UX", image: "https://picsum.photos/seed/aura/1200/800", description: "Intuitivní rozhraní pro ovládání chytré domácnosti propojené s hlasovými asistenty.", order: 3 }
      ];

      for (const p of profProjects) {
        await addDoc(collection(db, "projects"), p);
      }

      setStatus({ type: "success", msg: "Profesionální data byla zapsána!" });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "seed");
      setStatus({ type: "error", msg: "Zápis selhal. Máte administrátorská práva?" });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl">
       <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold tracking-tighter text-[var(--text-main)]">Nastavení obsahu webu</h2>
          <div className="flex gap-4">
             <button 
                onClick={seedProfessionalData}
                disabled={loading}
                className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all cursor-pointer disabled:opacity-50"
             >
                {loading ? "Pracuji..." : "Vložit profesionální data"}
             </button>
             <Link to="/admin" className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-brand no-underline flex items-center">Zpět</Link>
          </div>
       </div>

       <AnimatePresence>
         {status && (
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: 20 }}
             className={`fixed top-24 right-10 p-4 rounded-2xl shadow-2xl z-[100] border font-bold text-sm ${
               status.type === "success" ? "bg-emerald-500 text-white border-emerald-400" : 
               status.type === "error" ? "bg-red-500 text-white border-red-400" :
               "bg-brand text-white border-brand-alt"
             }`}
           >
             {status.msg}
           </motion.div>
         )}
       </AnimatePresence>
       
       <form onSubmit={handleSave} className="space-y-8 bg-[var(--bg-offset)] border border-[var(--border-main)] p-10 rounded-[40px]">
          <div className="space-y-2">
             <label className="text-[10px] uppercase font-bold tracking-widest text-brand">Hlavní nadpis (Hero)</label>
             <input 
                value={settings.heroTitle}
                onChange={e => setSettings({...settings, heroTitle: e.target.value})}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] p-5 rounded-2xl text-[var(--text-main)] outline-none focus:border-brand/50 transition-colors"
                placeholder="Nápady, které předběhnou dobu."
             />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] uppercase font-bold tracking-widest text-brand">Podnadpis (Hero)</label>
             <textarea 
                value={settings.heroSubtitle}
                rows={4}
                onChange={e => setSettings({...settings, heroSubtitle: e.target.value})}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] p-5 rounded-2xl text-[var(--text-main)] outline-none focus:border-brand/50 transition-colors"
                placeholder="Krátký popis agentury..."
             />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] uppercase font-bold tracking-widest text-brand">O nás (Patička)</label>
             <textarea 
                value={settings.footerAbout}
                rows={3}
                onChange={e => setSettings({...settings, footerAbout: e.target.value})}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] p-5 rounded-2xl text-[var(--text-main)] outline-none focus:border-brand/50 transition-colors"
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | "info", msg: string } | null>(null);

  useEffect(() => {
    if (status) {
      const t = setTimeout(() => setStatus(null), 5000);
      return () => clearTimeout(t);
    }
  }, [status]);

  useEffect(() => {
    const q = query(collection(db, "services"), orderBy("order", "asc"));
    return onSnapshot(q, s => {
      setServices(s.docs.map(d => ({ id: d.id, ...d.data() } as Service)));
    }, err => handleFirestoreError(err, OperationType.LIST, "services"));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setLoading(true);
    try {
      if (editing.id) {
        await updateDoc(doc(db, "services", editing.id), editing as any);
        setStatus({ type: "success", msg: "Služba byla aktualizována" });
      } else {
        await addDoc(collection(db, "services"), editing);
        setStatus({ type: "success", msg: "Nová služba byla přidána" });
      }
      setEditing(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "services");
      setStatus({ type: "error", msg: "Chyba při ukládání služby" });
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "services", id));
      setStatus({ type: "success", msg: "Služba byla odstraněna" });
      setDeletingId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `services/${id}`);
      setStatus({ type: "error", msg: "Službu se nepodařilo smazat" });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl">
       <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold tracking-tighter text-[var(--text-main)]">Správa služeb</h2>
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => setEditing({ title: "", description: "", icon: "Zap", order: services.length })}
              className="px-6 py-3 bg-brand text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 border-none cursor-pointer"
            >
               <Plus className="w-4 h-4" /> Nová služba
            </button>
            <Link to="/admin" className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-brand no-underline">Zpět</Link>
          </div>
       </div>

       <AnimatePresence>
         {status && (
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: 20 }}
             className={`fixed top-24 right-10 p-4 rounded-2xl shadow-2xl z-[100] border font-bold text-sm ${
               status.type === "success" ? "bg-emerald-500 text-white border-emerald-400" : 
               status.type === "error" ? "bg-red-500 text-white border-red-400" :
               "bg-brand text-white border-brand-alt"
             }`}
           >
             {status.msg}
           </motion.div>
         )}
       </AnimatePresence>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map(s => (
            <div key={s.id} className="bg-[var(--bg-offset)] border border-[var(--border-main)] p-8 rounded-[32px] flex justify-between items-start">
               <div>
                  <div className="text-brand mb-4">{iconMap[s.icon] || <Zap />}</div>
                  <h3 className="text-xl font-bold mb-2 text-[var(--text-main)]">{s.title}</h3>
                  <p className="text-[var(--text-muted)] text-sm italic">{s.description.slice(0, 60)}...</p>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => setEditing(s)} className="p-3 bg-[var(--bg-main)] hover:bg-brand/10 text-[var(--text-main)] rounded-xl transition-all border-none cursor-pointer"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => setDeletingId(s.id!)} className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all border-none cursor-pointer"><Trash2 className="w-4 h-4" /></button>
               </div>
            </div>
          ))}
       </div>

       {/* Delete Confirmation Modal */}
       <AnimatePresence>
          {deletingId && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-sm bg-[var(--bg-offset)] border border-[var(--border-main)] p-8 rounded-[32px] text-center shadow-2xl">
                  <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Trash2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-[var(--text-main)]">Smazat službu?</h3>
                  <p className="text-[var(--text-muted)] text-sm mb-8">Tato akce je nevratná. Opravdu chcete tuto službu odstranit z webu?</p>
                  <div className="flex gap-4">
                     <button onClick={() => setDeletingId(null)} className="flex-1 py-3 bg-[var(--bg-main)] hover:bg-[var(--bg-offset)] border border-[var(--border-main)] rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer text-[var(--text-main)]">Zrušit</button>
                     <button onClick={() => handleDelete(deletingId)} disabled={loading} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest border-none cursor-pointer">
                        {loading ? "Mažu..." : "Smazat"}
                     </button>
                  </div>
               </motion.div>
            </div>
          )}
       </AnimatePresence>

       {/* Edit Modal */}
       <AnimatePresence>
          {editing && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--bg-main)]/80 backdrop-blur-md">
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="w-full max-w-xl bg-[var(--bg-offset)] border border-[var(--border-main)] p-10 rounded-[40px] shadow-3xl">
                 <div className="flex justify-between items-center mb-8">
                   <h3 className="text-2xl font-bold text-[var(--text-main)]">{editing.id ? "Editovat službu" : "Nová služba"}</h3>
                   <button onClick={() => setEditing(null)} className="p-2 border-none bg-transparent cursor-pointer text-[var(--text-muted)] hover:text-brand"><X /></button>
                 </div>
                 <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand">Název</label>
                        <input value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})} className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] p-4 rounded-xl text-[var(--text-main)] outline-none" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand">Ikona (Lucide Name)</label>
                        <select value={editing.icon} onChange={e => setEditing({...editing, icon: e.target.value})} className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] p-4 rounded-xl text-[var(--text-main)] outline-none">
                           {Object.keys(iconMap).map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-brand">Popis</label>
                      <textarea value={editing.description} rows={3} onChange={e => setEditing({...editing, description: e.target.value})} className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] p-4 rounded-xl text-[var(--text-main)] outline-none" required />
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

function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | "info", msg: string } | null>(null);

  useEffect(() => {
    if (status) {
      const t = setTimeout(() => setStatus(null), 5000);
      return () => clearTimeout(t);
    }
  }, [status]);

  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("order", "asc"));
    return onSnapshot(q, s => {
      setProjects(s.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
    }, err => handleFirestoreError(err, OperationType.LIST, "projects"));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setLoading(true);
    try {
      if (editing.id) {
        await updateDoc(doc(db, "projects", editing.id), editing as any);
        setStatus({ type: "success", msg: "Projekt byl aktualizován" });
      } else {
        await addDoc(collection(db, "projects"), editing);
        setStatus({ type: "success", msg: "Nový projekt byl přidán" });
      }
      setEditing(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "projects");
      setStatus({ type: "error", msg: "Chyba při ukládání projektu" });
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "projects", id));
      setStatus({ type: "success", msg: "Projekt byl odstraněn" });
      setDeletingId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `projects/${id}`);
      setStatus({ type: "error", msg: "Projekt se nepodařilo smazat" });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl">
       <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold tracking-tighter text-[var(--text-main)]">Správa portfolia</h2>
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => setEditing({ title: "", category: "", description: "", image: "https://picsum.photos/seed/new/1200/800", order: projects.length })}
              className="px-6 py-3 bg-brand text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 border-none cursor-pointer"
            >
               <Plus className="w-4 h-4" /> Nový projekt
            </button>
            <Link to="/admin" className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-brand no-underline">Zpět</Link>
          </div>
       </div>

       <AnimatePresence>
         {status && (
           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className={`fixed top-24 right-10 p-4 rounded-2xl shadow-2xl z-[100] border font-bold text-sm ${status.type === "success" ? "bg-emerald-500 text-white border-emerald-400" : status.type === "error" ? "bg-red-500 text-white border-red-400" : "bg-brand text-white border-brand-alt"}`}>
             {status.msg}
           </motion.div>
         )}
       </AnimatePresence>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map(p => (
            <div key={p.id} className="bg-[var(--bg-offset)] border border-[var(--border-main)] rounded-[32px] overflow-hidden group">
               <div className="h-48 overflow-hidden relative">
                  <img src={p.image} className="w-full h-full object-cover" alt={p.title} referrerPolicy="no-referrer" />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => setEditing(p)} className="p-3 bg-white/10 backdrop-blur-md hover:bg-brand text-white rounded-xl transition-all border-none cursor-pointer"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => setDeletingId(p.id!)} className="p-3 bg-red-500/20 backdrop-blur-md hover:bg-red-500 text-white rounded-xl transition-all border-none cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </div>
               </div>
               <div className="p-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand mb-2 block">{p.category}</span>
                  <h3 className="text-xl font-bold text-[var(--text-main)]">{p.title}</h3>
               </div>
            </div>
          ))}
       </div>

       {/* Delete Modal */}
       <AnimatePresence>
          {deletingId && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-sm bg-[var(--bg-offset)] border border-[var(--border-main)] p-8 rounded-[32px] text-center shadow-2xl">
                  <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 className="w-6 h-6" /></div>
                  <h3 className="text-xl font-bold mb-2 text-[var(--text-main)]">Smazat projekt?</h3>
                  <p className="text-[var(--text-muted)] text-sm mb-8">Opravdu chcete tento projekt odstranit z portfolia?</p>
                  <div className="flex gap-4">
                     <button onClick={() => setDeletingId(null)} className="flex-1 py-3 bg-[var(--bg-main)] hover:bg-[var(--bg-offset)] border border-[var(--border-main)] rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer text-[var(--text-main)]">Zrušit</button>
                     <button onClick={() => handleDelete(deletingId)} disabled={loading} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest border-none cursor-pointer">{loading ? "Mažu..." : "Smazat"}</button>
                  </div>
               </motion.div>
            </div>
          )}
       </AnimatePresence>

       {/* Edit Modal */}
       <AnimatePresence>
          {editing && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--bg-main)]/80 backdrop-blur-md">
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="w-full max-w-xl bg-[var(--bg-offset)] border border-[var(--border-main)] p-10 rounded-[40px] shadow-3xl">
                 <div className="flex justify-between items-center mb-8">
                   <h3 className="text-2xl font-bold text-[var(--text-main)]">{editing.id ? "Editovat projekt" : "Nový projekt"}</h3>
                   <button onClick={() => setEditing(null)} className="p-2 border-none bg-transparent cursor-pointer text-[var(--text-muted)] hover:text-brand"><X /></button>
                 </div>
                 <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand">Název</label>
                        <input value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})} className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] p-4 rounded-xl text-[var(--text-main)] outline-none" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand">Kategorie</label>
                        <input value={editing.category} onChange={e => setEditing({...editing, category: e.target.value})} className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] p-4 rounded-xl text-[var(--text-main)] outline-none" required placeholder="Napr. Fintech / AI" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-brand">URL Obrázku</label>
                      <input value={editing.image} onChange={e => setEditing({...editing, image: e.target.value})} className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] p-4 rounded-xl text-[var(--text-main)] outline-none" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-brand">Stručný popis</label>
                      <textarea value={editing.description} rows={3} onChange={e => setEditing({...editing, description: e.target.value})} className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] p-4 rounded-xl text-[var(--text-main)] outline-none" required />
                    </div>
                    <button type="submit" className="w-full py-5 bg-brand text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-brand-alt transition-all border-none cursor-pointer fire-glow">Uložit projekt</button>
                 </form>
              </motion.div>
            </div>
          )}
       </AnimatePresence>
    </div>
  );
}

function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await addDoc(collection(db, "leads"), {
        ...formData,
        status: "new",
        createdAt: new Date().toISOString()
      });
      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "leads");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-12 text-center bg-emerald-500/10 border border-emerald-500/20 rounded-3xl">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
        <h4 className="text-2xl font-bold mb-2">Děkujeme!</h4>
        <p className="text-[var(--text-muted)]">Vaše zpráva byla úspěšně odeslána. Brzy se vám ozveme.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-[var(--bg-main)] p-10 rounded-[40px] border border-[var(--border-main)] shadow-2xl relative z-10">
      <div className="space-y-2">
        <label className="text-[10px] uppercase font-bold tracking-widest text-brand">Jméno</label>
        <input 
          required
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className="w-full bg-[var(--bg-offset)] border border-[var(--border-main)] p-5 rounded-2xl text-[var(--text-main)] outline-none focus:border-brand/50 transition-colors"
          placeholder="Vaše jméno"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] uppercase font-bold tracking-widest text-brand">Email</label>
        <input 
          required
          type="email"
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          className="w-full bg-[var(--bg-offset)] border border-[var(--border-main)] p-5 rounded-2xl text-[var(--text-main)] outline-none focus:border-brand/50 transition-colors"
          placeholder="vitezslav@vizionar.cz"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] uppercase font-bold tracking-widest text-brand">Zpráva</label>
        <textarea 
          required
          rows={4}
          value={formData.message}
          onChange={e => setFormData({ ...formData, message: e.target.value })}
          className="w-full bg-[var(--bg-offset)] border border-[var(--border-main)] p-5 rounded-2xl text-[var(--text-main)] outline-none focus:border-brand/50 transition-colors"
          placeholder="Popište nám svůj projekt..."
        />
      </div>
      <button 
        type="submit" 
        disabled={status === "loading"}
        className="w-full py-5 bg-brand text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-brand-alt transition-all border-none cursor-pointer fire-glow flex items-center justify-center gap-3"
      >
        {status === "loading" ? "Odesílám..." : "Odeslat poptávku"}
        <ArrowRight className="w-4 h-4" />
      </button>
      {status === "error" && (
        <p className="text-red-500 text-xs text-center font-bold">Omlouváme se, něco se nepovedlo. Zkuste to prosím později.</p>
      )}
    </form>
  );
}

function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [status, setStatus] = useState<{ type: "success" | "error" | "info", msg: string } | null>(null);

  useEffect(() => {
    const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
    return onSnapshot(q, s => {
      setLeads(s.docs.map(d => ({ id: d.id, ...d.data() } as Lead)));
    }, err => handleFirestoreError(err, OperationType.LIST, "leads"));
  }, []);

  const updateStatus = async (id: string, newStatus: Lead["status"]) => {
    try {
      await updateDoc(doc(db, "leads", id), { status: newStatus });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `leads/${id}`);
    }
  };

  const deleteLead = async (id: string) => {
    if (!window.confirm("Opravdu chcete tuto poptávku smazat?")) return;
    try {
      await deleteDoc(doc(db, "leads", id));
      setStatus({ type: "success", msg: "Poptávka byla smazána" });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `leads/${id}`);
    }
  };

  return (
    <div className="max-w-6xl">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold tracking-tighter text-[var(--text-main)]">Správa poptávek</h2>
        <Link to="/admin" className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-brand no-underline">Zpět</Link>
      </div>

      <div className="space-y-6">
        {leads.length > 0 ? leads.map(l => (
          <div key={l.id} className={`bg-[var(--bg-offset)] border border-[var(--border-main)] p-8 rounded-[40px] transition-all ${l.status === 'new' ? 'border-brand/40 shadow-lg' : 'opacity-80'}`}>
            <div className="flex flex-col md:flex-row justify-between gap-8 mb-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  l.status === 'new' ? 'bg-brand/20 text-brand' : 
                  l.status === 'contacted' ? 'bg-blue-500/20 text-blue-400' : 
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {l.status === 'new' ? <Flame /> : l.status === 'contacted' ? <Clock /> : <CheckCircle />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-main)]">{l.name}</h3>
                  <a href={`mailto:${l.email}`} className="text-brand text-sm hover:underline">{l.email}</a>
                </div>
              </div>
              <div className="flex bg-[var(--bg-main)] p-1.5 rounded-2xl gap-2 border border-[var(--border-main)] self-start">
                {(["new", "contacted", "closed"] as Lead["status"][]).map(s => (
                  <button 
                    key={s}
                    onClick={() => updateStatus(l.id!, s)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer ${
                      l.status === s ? 'bg-brand text-white' : 'text-[var(--text-muted)] hover:text-brand'
                    }`}
                  >
                    {s === 'new' ? "Nová" : s === 'contacted' ? "Kontaktován" : "Vyřízeno"}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-[var(--bg-main)] p-6 rounded-3xl border border-[var(--border-main)] mb-6">
              <p className="text-[var(--text-main)] leading-relaxed">{l.message}</p>
            </div>
            
            <div className="flex justify-between items-center text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest">
              <span>{new Date(l.createdAt).toLocaleString('cs-CZ')}</span>
              <button onClick={() => deleteLead(l.id!)} className="text-red-500 hover:text-red-600 transition-colors border-none bg-transparent cursor-pointer">Smazat záznam</button>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 bg-[var(--bg-offset)] rounded-[40px] border border-[var(--border-main)]">
            <Mail className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4 opacity-20" />
            <p className="text-[var(--text-muted)] italic">Zatím žádné nové poptávky...</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminLayout({ user, children }: { user: User | null, children: React.ReactNode }) {
  const navigate = useNavigate();
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col font-sans transition-colors duration-300">
       <header className="h-20 border-b border-[var(--border-main)] flex items-center justify-between px-10 bg-[var(--bg-offset)]/30 backdrop-blur-md">
          <Link to="/" className="flex items-center gap-2 group no-underline text-[var(--text-main)]">
            <Flame className="text-brand w-6 h-6" />
            <span className="font-bold tracking-tighter uppercase text-sm italic">Digifire Hub</span>
          </Link>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold tracking-tight text-[var(--text-main)]">{user.displayName}</span>
                <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-[0.2em]">{user.email}</span>
            </div>
            <img src={user.photoURL || ""} className="w-10 h-10 rounded-full border border-[var(--border-main)]" alt="Avatar" />
            <button onClick={() => signOut(auth)} className="p-2.5 bg-[var(--bg-offset)] hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all border-none cursor-pointer text-[var(--text-main)]">
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
      <Route path="/admin/projects" element={<AdminLayout user={user}><AdminProjects /></AdminLayout>} />
      <Route path="/admin/leads" element={<AdminLayout user={user}><AdminLeads /></AdminLayout>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
