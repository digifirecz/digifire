# Firebase & Autentizace

Tato aplikace využívá Firebase pro real-time databázi (Firestore) i pro bezpečné přihlášení správců (Google Auth).

## 🔒 Google Authentication

Pro přihlášení do administrace (`/login`) používáme **hybridní přihlašovací logiku** (Popup + Redirect fallback). 

### Proč fallback na Redirect?
Moderní prohlížeče (Chrome, Safari) začaly přísně blokovat cookies třetích stran, což často způsobuje, že se přihlašovací vyskakovací okno (Popup) okamžitě po otevření samo zavře nebo se v něm uživatel nemůže přihlásit.

Kód v `App.tsx` proto nejdříve zkusí Popup, a pokud selže (např. tiché zavření nebo blokování prohlížečem), aplikaci kompletně přesměruje na Google:

```typescript
// Implementace hybridního přihlášení
try {
  await signInWithPopup(auth, provider);
} catch (popupError) {
  // Pokud popup selže, přepneme na Redirect mode
  await signInWithRedirect(auth, provider);
}
```

### 🌍 Autorizované domény (Whitelist)
Pro správné fungování přihlášení musí být domény webu povoleny ve Firebase konzoli (**Authentication -> Settings -> Authorized domains**). 

**Seznam povinných domén:**
- `localhost`
- `gen-lang-client-0680928943.firebaseapp.com` (výchozí Firebase doména)
- `www.digifire.cz` (tvoje vlastní doména)
- `digifire.cz`

## 📊 Struktura Firestore (Databáze)

Data aplikace jsou uložena v těchto kolekcích:

1.  **`siteSettings`**: Obsahuje jeden dokument `main`, kde jsou uloženy texty pro Hero sekci (Nadpis, Podnadpis) a Text v patičce.
2.  **`services`**: Kolekce dokumentů, které definují nabízené služby (Název, Popis, Ikona, Pořadí).
3.  **`projects`**: Kolekce dokumentů pro portfolio (Název, Popis, Obrázek z Unsplash, Tagy, Pořadí).

## 📜 Bezpečnostní pravidla (`firestore.rules`)

Pravidla jsou nastavená tak, aby kdokoli mohl data **číst** (pro zobrazení webu), ale pouze přihlášený uživatel (správce) mohl data **upravovat**.
