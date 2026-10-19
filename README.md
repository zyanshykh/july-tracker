# 📅 July Tracker

Personal productivity and freelance-earnings dashboard. Pure HTML, CSS and JavaScript (ES modules), no build step, no backend and no external JS libraries. All data is stored in your browser's `localStorage`.

**Live demo:** https://julytracker.vercel.app/

## ✨ What's new in Version 3.0

*   **Charts (no library, pure SVG):** Revenue by month (last 6 months) and revenue by status (donut) on Analytics, and missions completed in the last 7 days on the Dashboard. Charts follow the light/dark theme.
*   **Backup & Restore:** Export all your data as a `.json` file and import it back (Settings). Imports are validated and ask for confirmation before replacing anything.
*   **Task upgrades:** Priority, due date, overdue highlighting, search, All / Active / Done filter, "Clear completed", and smart sorting (overdue and soonest first).
*   **Project progress:** Status (Todo / In Progress / Done), a 0-100% progress slider, a progress bar on every card, a status filter and a summary line.
*   **More stats:** Active Projects card on the Dashboard, revenue breakdown by status, transaction dates in the ledger.
*   **Old data keeps working:** Data saved with v2.0 is upgraded automatically, nothing is lost.

## 📋 Features

*   **Dashboard:** Welcome hero with a live progress bar for the current month, stat cards (missions, revenue, daily streak, active projects), mission checklist, weekly chart and a random motivational quote.
*   **Projects:** Title, priority, deadline, logged hours, status and progress. Edit, delete and filter.
*   **Analytics (Revenue Ledger):** Log earnings per client with date and status (Paid / Pending / Proposed), edit or delete entries, see totals and charts. The total is synced to the Dashboard.
*   **Settings:** Auto-saving notes scratchpad, backup export/import, and a "Purge Application Cache" button that resets all app data.
*   **Dark / Light theme** (remembered between visits) and a live clock.
*   **Daily Streak:** counts consecutive days you opened the tracker.

## 🗂️ Project Structure

```
index.html              App shell: sidebar, header, footer, #router-view
pages/                  Page fragments loaded by the router
  dashboard.html  projects.html  analytics.html  settings.html
assets/css/
  style.css             Layout, theme variables, base components
  components.css        Page-level components, charts, v3 additions
assets/js/
  app.js                Single hash router (#dashboard, #projects, ...)
  modules/              storage (+ shared helpers), charts, backup, theme,
                        datetime, dashboard, checklist, project, analytics,
                        notes, quotes
data/quotes.json        Motivational quotes
```

## 💾 Data & Backup

Everything is stored in your browser only, so clearing site data or switching browser/device loses it. Use **Settings → Export Backup** regularly. To restore or move to another device use **Settings → Import Backup**.

Backup format (`july-tracker-backup-YYYY-MM-DD.json`):

```json
{ "app": "july-tracker", "version": 3, "exportedAt": "…", "data": { "july_tasks": [], "july_projects": [], "july_earnings": [], "july_streak": {}, "daily_scratchpad": "" } }
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
