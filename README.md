

## API Endpoints

**User & Auth routes** (from `user.routes.js`)

Routes below are mounted under this router's base path (e.g. `/api/users`) — check `server.js`/`app.js` for the exact prefix used with `app.use()`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register a new user |
| POST | `/login` | Log in and receive a session token |
| POST | `/update_profile_picture` | Upload/update profile picture (via Multer + Cloudinary) |
| POST | `/user_update` | Update core user fields |
| POST | `/update_profile_data` | Update profile data (bio, experience, education) |
| GET | `/get_user_and_profile` | Get the logged-in user's user + profile data |
| GET | `/get_all_profiles` | Get all user profiles (Discover) |
| GET | `/get_profile_based_on_username` | Get a user's profile by username |
| POST | `/send_connection_request` | Send a connection request |
| POST | `/accept_connection_request` | Accept a connection request |
| GET | `/user_connection_request` | Get the current user's connections |
| GET | `/get_my_connections_requests` | Get incoming connection requests |
| GET | `/download_resume` | Generate and download PDF resume |

---

## Getting Started (Local Setup)

### Prerequisites
- Node.js (v18+ recommended)
- A MongoDB database (local instance or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### 1. Clone the repository
```bash
git clone https://github.com/Greek101God/SocialConnect---Connect-without-Hesitation.git
cd SocialConnect---Connect-without-Hesitation
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` with:
```env
MONGO_URI=mongodb+srv://<username>:<password>@socialconnect.tcsedpp.mongodb.net/connectsocially?appName=socialconnect
PORT=9090
```

Run the backend in development mode:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000` and the backend on `http://localhost:9090` by default.

---

## Technical Highlights & What I Learned

- **Connection request state machine** — modeled each connection as `pending → accepted` rather than a boolean, so the UI can show the correct action ("Connect", "Pending", "Message") for any pair of users from a single field instead of extra queries.
- **PDF generation** — used PDFKit to stream-generate resumes on the backend at request time rather than pre-rendering and storing a file, so the export always reflects the user's latest profile data and no stale PDFs pile up in storage.
- **State management** — chose Redux Toolkit over Context so post likes, comments, and connection status update predictably across the feed and profile views without re-fetching or prop-drilling between components.
- **Auth security** — hashed passwords with bcrypt before storage and kept the JWT verification in Express middleware, so protected routes reject unauthenticated requests before any controller logic runs.
- **Deployment split** — running the frontend on Vercel and the backend on Render meant configuring CORS explicitly for the production frontend origin, and keeping `MONGO_URI` and other secrets in each platform's own environment variable settings rather than a shared `.env`.

---

## Author

**Sameer Jain**
[LinkedIn](https://linkedin.com/in/sameer-jain-714b37392) · [GitHub](https://github.com/Greek101God) · [LeetCode](https://leetcode.com/u/Greek_User)
