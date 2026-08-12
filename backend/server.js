import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from 'express';
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import postsRoutes from "./routes/posts.routes.js";
import userRoutes from "./routes/user.routes.js";
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create 'uploads' folder dynamically at startup if missing 
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
}

// Serve static assets correctly via isolated routing prefix
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes Link
app.use('/posts', postsRoutes);
app.use('/user', userRoutes); 

app.get('/', (req, res) => {
    res.json({ message: "Server is running", status: "ok" });
});

app.use((req, res) => {
    res.status(404).json({ message: "API route not found" });
});

const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("--> Connected to MongoDB successfully");

        const PORT = process.env.PORT || 9090;
        app.listen(PORT, () => {
            console.log(`--> Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Critical Server boot crash: ", error.message);
        process.exit(1);
    }
};

start();