# Uživatelské rozhraní a Vizuální řešení

Dokumentace vizuálních oprav a řešení specifických problémů s renderováním v aplikaci Digifire Hub.

## ⚡ Řešení problikávání textů (Flickering/Hydration)

Při prvním načtení stránky docházelo k vizuálnímu odskoku (Layout Shift), kdy se nejdříve zobrazily výchozí "default" texty a o zlomek sekundy později se přepsaly skutečnými daty z Firebase.

### Řešení: Loading State
Aplikovali jsme stav načítání `isSettingsLoaded`, který drží aplikaci skrytou (zobrazuje animovaný spinner), dokud není jisté, že data dorazila. 

```tsx
// App.tsx - Implementace
const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

useEffect(() => {
  const unsubSettings = onSnapshot(doc(db, "siteSettings", "main"), (doc) => {
    if (doc.exists()) setSettings(doc.data() as SiteSettings);
    setIsSettingsLoaded(true); // Označíme data jako načtená
  }, (err) => {
    setIsSettingsLoaded(true); // I při chybě uvolníme UI pro nouzové zobrazení
  });
  // ...
}, []);
```

## 🌗 Tmavý a Světlý Režim (Theming)

Aplikace používá nativní CSS proměnné definované v `src/index.css`. Přepínání funguje na úrovni `body` tříd.

### Oprava sekce Kontakt (Light Mode)
Zjistili jsme, že v Light režimu byla barva pozadí v sekci Kontaktu špatná (příliš tmavá). Opravili jsme to použitím sémantických barev:
- **Dark Mode**: `--bg-offset: #0F0F0F`
- **Light Mode**: `--bg-offset: #F4F4F4`

## 🎨 Designové principy

- **Písmo**: Pro nadpisy používáme font **Space Grotesk** (dodává technologický, agenturní vzhled).
- **Akcenty**: Barva `#7E22CE` (Brand Purple) je použita pro záři ohně (fire-glow效果) a interaktivní prvky.
- **Dostupnost**: Touch targety pro mobilní zařízení jsou nastaveny na minimálně 44px.
