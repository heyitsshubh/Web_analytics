# 📊 Web Analytics & User Behavior Tracking System

A full-stack, production-grade analytics platform inspired by Google Analytics and Hotjar.
Track page views, click events, and user journeys — then visualize them on a premium React dashboard with click heatmaps.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **Session Tracking** | UUID-based sessions persisted in `localStorage` |
| 📄 **Page View Tracking** | Auto-fires on every page load |
| 🖱️ **Click Tracking** | Records x/y coordinates of every click |
| 👣 **User Journey** | Chronological event timeline per session |
| 🔥 **Click Heatmap** | Intensity-colored dot overlay per page URL |
| 📊 **Dashboard Overview** | Stats cards, top pages, recent sessions |
| 🔍 **Sessions Table** | Sortable, searchable session list |
| 🔄 **Auto-refresh** | Overview updates every 30 seconds |
| 🌙 **Dark UI** | Premium dark-mode analytics dashboard |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite 5**
- **Tailwind CSS 3** (custom dark theme)
- **React Router v6**
- **Axios**

### Backend
- **Node.js** (≥ 18)
- **Express 4** (MVC pattern)
- **MongoDB Atlas** (via Mongoose 8)
- **Helmet** + **CORS** + **Morgan**

### Tracking Script
- Vanilla JS (no dependencies)
- `crypto.randomUUID()` with Math.random fallback
- Fetch API with `keepalive: true`

---

## 📁 Folder Structure

```
web-analytics/
├── tracker.js              ← Embeddable tracking script
│
├── demo/
│   └── index.html          ← Test page with buttons, cards, links, images
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           ← MongoDB connection
│   │   ├── models/
│   │   │   └── Event.js        ← Mongoose schema + indexes
│   │   ├── controllers/
│   │   │   └── event.controller.js  ← Business logic (6 handlers)
│   │   ├── routes/
│   │   │   └── event.routes.js ← Express router
│   │   ├── app.js              ← Express app (middleware, error handler)
│   │   └── server.js           ← Entry point + graceful shutdown
│   ├── .env                ← Environment variables (fill in your URI)
│   ├── .env.example        ← Template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── analytics.js    ← Axios client + API helpers
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── TimelineEvent.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── EmptyState.jsx
│   │   ├── pages/
│   │   │   ├── OverviewPage.jsx
│   │   │   ├── SessionsPage.jsx
│   │   │   ├── UserJourneyPage.jsx
│   │   │   └── HeatmapPage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css           ← Tailwind + custom component classes
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)
- A modern browser

---

### 1. Clone / Navigate to the project

```bash
cd web-analytics
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

**Configure environment variables:**

Open `backend/.env` and replace the placeholder with your MongoDB Atlas connection string:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/web_analytics?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

**Start the backend dev server:**

```bash
npm run dev
```

> The API will be available at `http://localhost:5000`
> Health check: `http://localhost:5000/health`

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

> The dashboard will be available at `http://localhost:5173`

---

### 4. Test with the Demo Page

Open `demo/index.html` directly in your browser (or serve it with any static server):

```bash
# Using npx serve (one-liner)
npx serve demo

# Or using Python
python -m http.server 8080 --directory demo
```

> Navigate to `http://localhost:8080`, click around the page, then open the dashboard to see events appear.

---

## 📡 API Documentation

Base URL: `http://localhost:5000/api`

---

### POST `/api/events`
Store a new tracking event.

**Request Body:**
```json
{
  "session_id": "uuid-v4-string",
  "event_type": "page_view | click",
  "page_url": "https://example.com/page",
  "timestamp": "2025-01-01T10:00:00.000Z",
  "metadata": {
    "x": 250,
    "y": 400
  }
}
```

**Response `201`:**
```json
{ "success": true, "data": { ...savedEvent } }
```

---

### GET `/api/sessions`
Get all sessions with aggregated metrics.

**Response `200`:**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "session_id": "abc123",
      "total_events": 25,
      "page_views": 10,
      "clicks": 15,
      "unique_pages": 4,
      "first_seen": "2025-01-01T10:00:00.000Z",
      "last_seen": "2025-01-01T10:35:00.000Z"
    }
  ]
}
```

---

### GET `/api/sessions/:sessionId/events`
Get the full event timeline for a session.

**Response `200`:**
```json
{
  "success": true,
  "session_id": "abc123",
  "count": 25,
  "data": [
    { "event_type": "page_view", "page_url": "http://...", "timestamp": "..." },
    { "event_type": "click", "metadata": { "x": 120, "y": 300 }, "timestamp": "..." }
  ]
}
```

---

### GET `/api/heatmap?pageUrl=https://example.com`
Get all click coordinates for a page URL.

**Query Params:**
| Param | Required | Description |
|---|---|---|
| `pageUrl` | ✅ | Full URL to filter clicks by |

**Response `200`:**
```json
{
  "success": true,
  "count": 42,
  "data": [
    { "x": 120, "y": 300, "timestamp": "..." }
  ]
}
```

---

### GET `/api/heatmap/pages`
Get all unique page URLs with recorded click data.

**Response `200`:**
```json
{
  "success": true,
  "data": ["http://localhost:8080/", "https://mysite.com/pricing"]
}
```

---

### GET `/api/stats`
Get overview dashboard statistics.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "total_events": 1024,
    "total_sessions": 48,
    "page_views": 512,
    "clicks": 512,
    "events_last_24h": 87,
    "top_pages": [
      { "page_url": "http://localhost:8080/", "views": 120 }
    ]
  }
}
```

---

## 🧩 Embedding tracker.js

Add this script to any HTML page:

```html
<!-- Basic: defaults to http://localhost:5000 -->
<script src="path/to/tracker.js"></script>

<!-- With custom backend URL (recommended) -->
<script src="path/to/tracker.js" data-backend-url="https://your-api.com"></script>

<!-- Or set globally before loading -->
<script>
  window.__TRACKER_CONFIG__ = { backendUrl: 'https://your-api.com' };
</script>
<script src="path/to/tracker.js"></script>
```

The tracker exposes a minimal public API:
```javascript
window.WebTracker.getSessionId()   // → "uuid-string"
window.WebTracker.trackPageView()  // Manually fire a page view
```

---

## 🔧 Assumptions & Tradeoffs

| Decision | Rationale |
|---|---|
| **No authentication** | Keeps the system lightweight; suitable for internal/assignment use |
| **CORS: `*` (all origins)** | Required so tracker.js works on any host website |
| **Client-side session IDs** | UUID v4 generated in the browser, not on the server — simpler and stateless |
| **`keepalive: true` on fetch** | Ensures tracking events are sent even when the user navigates away |
| **Heatmap uses viewport coords** | `clientX/clientY` are viewport coordinates; normalized to container for display |
| **No auth on events API** | A production system would use an API key or signed beacon URL |
| **MongoDB Atlas** | Managed DB with free tier; swap URI for local MongoDB seamlessly |
| **Compound indexes** | Added for `session_id+timestamp` and `event_type+page_url` to optimize query patterns |

---

## 🐛 Common Issues

**Events not appearing in dashboard?**
- Make sure the backend is running on port 5000
- Check browser console for CORS or network errors
- Verify your MongoDB URI is correct in `backend/.env`

**Heatmap showing no data?**
- Ensure you've clicked on the demo page (not just viewed it)
- The URL must match exactly — including `http://` prefix and trailing slashes

**Tailwind styles not loading?**
- Run `npm install` inside the `frontend/` directory
- Make sure `tailwind.config.js` content paths include `./src/**/*.{js,jsx}`

---

## 📄 License

MIT — Free to use, modify, and distribute.
