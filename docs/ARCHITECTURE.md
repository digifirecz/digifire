# Architektura a Server (Full-stack setup)

Tato aplikace využívá **Full-stack architekturu** (Express.js + Vite), aby zajistila správné fungování webu v produkci a vyřešila omezení statických serverů.

## 🛠️ Server (`server.ts`)

Původně byla aplikace čistě statická (SPA). To ale způsobovalo chybu **404: NOT_FOUND** při obnovení stránky (refresh) na jakékoli jiné podstránce než hlavní (např. `/login`).

### Proč používáme Express?
Prohlížeč při refreshu na `/login` hledá skutečný soubor `login.html`, který na serveru neexistuje. Express server tento problém řeší pomocí tzv. **catch-all route**:

```typescript
// server.ts - klíčová část pro SPA routing
if (process.env.NODE_ENV !== "production") {
  app.use(vite.middlewares); // Ve vývoji obsluhuje Vite
} else {
  app.get("*", (req, res) => {
    // V produkci pošleme index.html pro jakoukoli neznámou cestu
    res.sendFile(path.join(distPath, "index.html"));
  });
}
```

## 🔄 Vývoj vs. Produkce

- **Vývoj (`npm run dev`)**: Server používá `vite.middlewares`, což umožňuje rychlou odezvu při změnách kódu.
- **Produkce (`npm start`)**: Server obsluhuje statické soubory ze složky `/dist` a zajišťuje, že navigace v rámci aplikace (React Router) funguje bez přerušení.

## 📦 Správa závislostí

Klíčové balíčky pro server:
- `express`: Webový framework.
- `tsx`: Umožňuje spouštět TypeScript soubory přímo bez předchozí kompilace (použito ve `scripts.dev`).
- `vite`: Použito jako middleware pro vývojový režim.
