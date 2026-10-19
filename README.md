# 📅 July Tracker

Personal productivity and freelance-earnings dashboard. Pure HTML, CSS and JavaScript (ES modules), no build step and no backend. All data is stored in your browser's `localStorage`.

**Live demo:** https://julytracker.vercel.app/

## 📋 Version 2.0 Features

*   **Dashboard:** Welcome hero with a live progress bar for the current month, plus stat cards for today's missions, total revenue and daily streak.
*   **Mission Checklist:** Add, edit, complete and delete daily tasks. The "Today's Missions" counter updates automatically.
*   **Projects:** Create projects with priority (High / Medium / Low), deadline and logged hours. Cards are colour-coded by priority and can be edited or deleted.
*   **Analytics (Revenue Ledger):** Log earnings per client with a status (Paid / Pending / Proposed), edit or delete entries, and see the running total. The total is synced to the Dashboard.
*   **Settings:** Auto-saving notes scratchpad, wipe-notes button and a "Purge Application Cache" button that resets all app data.
*   **Dark / Light theme** (remembered between visits), live clock and a random motivational quote.
*   **Daily Streak:** counts consecutive days you opened the tracker.

## 🗂️ Project Structure

```
index.html              App shell: sidebar, header, footer, #router-view
pages/                  Page fragments loaded by the router
  dashboard.html  projects.html  analytics.html  settings.html
assets/css/
  style.css             Layout, theme variables, base components
  components.css        Page-level components (cards, forms, tables, buttons)
assets/js/
  app.js                Single hash router (#dashboard, #projects, ...)
  modules/              storage, theme, datetime, dashboard, checklist,
                        project, analytics, notes, quotes
data/quotes.json        Motivational quotes
```

## 🚀 Getting Started

ES modules and `fetch` need a web server, so opening `index.html` directly from disk will not work.

```bash
git clone https://github.com/zyanshykh/july-tracker.git
cd july-tracker
python3 -m http.server 8000
```

Then open http://localhost:8000

## 📝 License

See [LICENSE](LICENSE).
