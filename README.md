# Digifire Hub - Dokumentace Projektu

Tento projekt je moderní full-stack webová aplikace pro digitální agenturu **digifire.cz**. Kombinuje rychlost Reactu s robustním backendem v Expressu a real-time databází Firebase.

## 🚀 Technologie (Tech Stack)

- **Frontend**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Motion](https://motion.dev/) (animace)
- **Backend**: [Express.js](https://expressjs.com/) (pro obsluhu SPA routingu a produkční start)
- **Databáze & Auth**: [Firebase](https://firebase.google.com/) (Firestore + Google Authentication)
- **Ikony**: [Lucide React](https://lucide.dev/)

## 📂 Struktura dokumentace

Pro detailní informace o jednotlivých částech systému nahlédněte do složky `/docs`:

1.  **[Architektura a Server](./docs/ARCHITECTURE.md)** – Jak funguje propojení Vite + Express a řešení 404 chyb.
2.  **[Firebase & Auth](./docs/FIREBASE.md)** – Nastavení Google přihlášení, povolených domén a struktury dat.
3.  **[Uživatelské rozhraní](./docs/UI_UX.md)** – Řešení vizuálních problémů (flickering) a tmavého režimu.

## 🛠️ Vývojové příkazy

Všechny příkazy spouštějte v kořenovém adresáři:

- `npm run dev`: Spustí vývojový server (Express + Vite) na portu 3000.
- `npm run build`: Sestaví produkční verzi do složky `/dist`.
- `npm start`: Spustí produkční server (používá `server.ts`).
- `npm run lint`: Provede kontrolu typů v TypeScriptu.

## 🔗 Důležité odkazy

- **Produkční web**: [www.digifire.cz](https://www.digifire.cz)
- **Firebase Konzole**: [Konzole projektu](https://console.firebase.google.com/project/gen-lang-client-0680928943/)
