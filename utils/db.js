import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient()
export default prisma


























// import Database from "better-sqlite3";

// const db = new Database('database.db');

// db.exec(`CREATE TABLE IF NOT EXISTS users (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT NOT NULL,
//     username TEXT UNIQUE NOT NULL,
//     password TEXT NOT NULL
// )`);

// db.exec(`CREATE TABLE IF NOT EXISTS posts (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     title TEXT NOT NULL,
//     content TEXT UNIQUE NOT NULL,
//     user_id INTEGER NOT NULL,
//     FOREIGN KEY (user_id) REFERENCES users(id)
// )`);

// export default db;
