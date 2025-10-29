# 🪙 CoinMatch — Product Description (v0.1)

## Overview

**CoinMatch** is a lightweight, web-based tool that helps museum researchers and curators **identify potentially missing or stolen ancient coins** by comparing the museum’s internal records with **auction listings collected online**.  

It provides both **image-based** and **text-based** search functions, allowing users to explore candidate matches, view side-by-side comparisons, and record verification results.  

The focus of this prototype is the **frontend user interface** — simple, elegant, and ready to connect with backend APIs and machine learning algorithms later.

---

## 🎯 Goals

- Build an **intuitive, minimalist interface** for browsing, searching, and verifying coin matches.  
- Display **image-based** and **text-based** retrieval results with clear similarity scores.  
- Allow curators to **compare coins visually**, **save match records**, and **review history**.  
- Keep the app lightweight and modular — algorithms and data sources can be attached via API.  

---

## 🖥️ Frontend Design

### 🔐 1. Login Page
- Simple institutional email + password login form.  
- Clean museum-style theme (light gray background, serif titles, gold accent color).  
- On success, redirect to the **Dashboard**.  

**Components:**
- Input fields for email and password  
- “Sign in” button  
- Museum logo placeholder  

---

### 🏠 2. Dashboard Page
- Overview of current research activity:  
  - Total missing coins in the system  
  - Number of pending matches for review  
  - Recently verified matches  
- Quick links: **Browse Missing Coins**, **Run Search**, **History**  
- Optional statistic cards (e.g. “Top 5 matched coin types”)  

**Components:**
- Summary cards (with icons)  
- Table preview of latest matches  
- Sidebar navigation  

---

### 🪙 3. Missing Coins Page
- Main table listing **all missing coins** from the museum record.  
- Each row shows:
  - Dewing card number  
  - Type / Description  
  - Period / Location  
  - Thumbnail of obverse & reverse images (if available)  
- Search bar and filter (by type, location, or period).  
- Clicking a coin opens **Coin Detail Page**.  

**Components:**
- Table view with sorting  
- Search/filter bar  
- Pagination  

---

### 🔍 4. Coin Detail Page
Displays one coin record in detail and allows the user to start a match search.

**Sections:**
- **Left side:** Coin information (metadata, type, reference numbers, inscriptions)  
- **Right side:** Coin images (obverse and reverse, zoomable)  
- Buttons:
  - **Run Image Match** → Calls `/api/search/image`
  - **Run Text Match** → Calls `/api/search/text`
  - **View Match History** → Shows previously saved results  

**Layout Example:**

```
----------------------------------------------------
| Obverse Image | Reverse Image |  [Run Image Match] |
----------------------------------------------------
| Description: AR Didrachm of Tarentum              |
| Period: 3rd century BC                           |
| Reference: Dewing 4224                           |
----------------------------------------------------
```

---

### 🧠 5. Search Results Page
Shows **candidate coins** returned by image or text retrieval algorithms.

**Features:**
- Cards or list view with:
  - Candidate coin image(s)
  - Basic description and source (e.g. CNG Auction #212)
  - Similarity score (e.g. 0.87)
- Sort by score or date.
- Click any candidate → open **Comparison View**.

**Components:**
- Result grid with cards  
- Sorting dropdown (score / recency)  
- Pagination  

---

### ⚖️ 6. Comparison View (Side-by-Side)
Key feature for visual verification.

| Museum Coin | Candidate Coin |
|--------------|----------------|
| Obverse + Reverse images | Obverse + Reverse images |
| Description | Description |
| Similarity score | Source URL |
| ✅ Confirm / ❌ Reject / 💾 Save buttons | |

**User Actions:**
- Confirm match → calls `/api/match/save`  
- Reject match → return to results  
- Save for later → stored in user’s match history  

---

### 🕓 7. Match History Page
Allows users to review their past confirmed or saved matches.

**Features:**
- Table view with:
  - Museum coin ID  
  - Matched auction entry  
  - Similarity score  
  - Verification status  
  - Date saved  
- Export to CSV or JSON  

---

### 📁 8. Layout & Navigation
**Persistent UI elements:**
- Sidebar menu:
  - Dashboard  
  - Missing Coins  
  - History  
  - (Admin) Data Upload  
- Top bar:
  - Project logo “CoinMatch”  
  - User avatar & Logout button  

**Design Language:**
- Museum aesthetic — minimal serif fonts, parchment tones, gold accent lines  
- TailwindCSS utility classes for responsiveness  
- Grid layout for images and cards  

---

## ⚙️ Backend API (for integration later)

| Route | Method | Purpose |
|-------|---------|----------|
| `/api/login` | POST | Authenticate user |
| `/api/missing-coins` | GET | Fetch missing coin list |
| `/api/coin/{uuid}` | GET | Get coin detail |
| `/api/search/image` | POST | Upload image → get ranked candidates *(algorithm placeholder)* |
| `/api/search/text` | POST | Query text → get ranked candidates *(algorithm placeholder)* |
| `/api/match/save` | POST | Save confirmed match |
| `/api/match/history` | GET | Retrieve user’s match history |

---

## 📦 Technical Stack

| Component | Technology |
|------------|-------------|
| **Frontend** | React + TailwindCSS (or SvelteKit alternative) |
| **Backend (stub)** | FastAPI |
| **Database (stub)** | PostgreSQL + pgvector |
| **Storage** | AWS S3 (signed URLs) |
| **Auth** | JWT tokens |
| **Model Interfaces** | CLIP/SigLIP (image) + Text encoder (text) |

---

## 🔩 Integration Points (Algorithm APIs)

| Module | Description | Input | Output |
|--------|--------------|--------|--------|
| `image_search_service` | Image similarity model endpoint | Image file | `[{"uuid": str, "score": float}]` |
| `text_search_service` | Text embedding similarity model | Query string | `[{"uuid": str, "score": float}]` |

---

## 📊 Data Flow (Simplified)

```
User (Frontend)
   ↓
API Request (JWT)
   ↓
FastAPI Server
   ├── PostgreSQL (coin records, matches)
   ├── S3 (images)
   ├── image_search_service (ML API)
   └── text_search_service (ML API)
```

---

## 💡 Design Philosophy

- **Clean first, complex later:** Build a visually elegant interface before model integration.  
- **Research-ready:** Algorithm endpoints can be easily swapped or updated.  
- **Transparency:** Always show scores and sources to users.  
- **Curator-focused UX:** Fast comparison, clear verification options.  
- **Lightweight:** Minimal dependencies, easy to deploy.  

---

## 🚀 Future Extensions

- Bulk matching across full collections.  
- Integration with Nomisma.org, ACSearch APIs.  
- Export PDF “Match Reports”.  
- AI captioning for coins missing descriptions.  
- Embedding fine-tuning dashboard for new datasets.

---

**Project Name:** CoinMatch  
**Institution:** Harvard Art Museums – Division of Asian and Mediterranean Art  
**Maintainer:** Yifei Bao  
**Version:** v0.1 (UI Prototype)
