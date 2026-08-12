# SocialConnect – Connect Without Hesitation

A full-stack professional networking platform where users can create profiles, connect with others, share posts, and build their professional presence — built with the MERN-adjacent stack (MongoDB, Express.js, React/Next.js, Node.js).

🔗 **Live Demo:** [social-connect-connect-without-hesi.vercel.app](https://social-connect-connect-without-hesi.vercel.app/)

---

## Features

- **User Authentication** — secure registration and login with bcrypt password hashing and token-based session management
- **Profile Management** — editable bio, current position, past work experience, and education history
- **Profile Picture Upload** — image uploads via Multer
- **Social Feed** — create posts (text + image), like posts, and browse a live feed of user activity
- **Comments & Replies** — comment on posts, reply to comments, and like individual comments
- **Connections** — send, accept, or reject connection requests with other users
- **Discover Profiles** — browse other users' profiles on the platform
- **Resume Export** — generate and download a PDF resume/profile summary on demand using PDFKit
- **Username-based Profile Lookup** — view any user's public profile via their username

---

## Tech Stack

**Frontend**
- [Next.js](https://nextjs.org/) 16 (Pages Router)
- [React](https://react.dev/) 19 (with React Compiler)
- [Redux Toolkit](https://redux-toolkit.js.org/) + React-Redux — global state management
- [Axios](https://axios-http.com/) — API requests
- CSS Modules — component-scoped styling

**Backend**
- [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) — REST API
- [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) — database and schema modeling
- [bcrypt](https://www.npmjs.com/package/bcrypt) — password hashing
- [Multer](https://www.npmjs.com/package/multer) — file/image upload handling
- [PDFKit](https://pdfkit.org/) — PDF resume generation
- [CORS](https://www.npmjs.com/package/cors) — cross-origin request handling
- [dotenv](https://www.npmjs.com/package/dotenv) — environment variable management

**Deployment**
- Frontend deployed on [Vercel](https://vercel.com/)
- Backend deployed on [Render](https://render.com/)
- Database hosted on [MongoDB Atlas](https://www.mongodb.com/atlas)

---

## Project Structure

```
project/
├── backend/
│   ├── controllers/       # Route logic (users, posts, comments, connections)
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express route definitions
│   ├── uploads/            # Uploaded media (dev only)
│   ├── server.js           # App entry point
│   └── .env                # Environment variables (not committed)
│
└── frontend/
    ├── src/
    │   ├── Components/     # Reusable UI components (Navbar, etc.)
    │   ├── config/          # App configuration
    │   ├── layout/          # Layout components
    │   ├── pages/            # Next.js pages (routes)
    │   └── styles/           # Global and module styles
    ├── public/               # Static assets
    └── next.config.mjs
```

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

## Author

**Sameer Jain**
[LinkedIn](https://linkedin.com/in/sameer-jain-714b37392) · [GitHub](https://github.com/Greek101God) · [LeetCode](https://leetcode.com/u/Greek_User)

---

## License

This project is open source and available for educational purposes.
