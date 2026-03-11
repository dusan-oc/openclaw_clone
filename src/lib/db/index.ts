import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

import path from 'path'
const DB_PATH = path.join(process.cwd(), 'glimr.db')

declare global {
  // eslint-disable-next-line no-var
  var __db: ReturnType<typeof drizzle> | undefined
  // eslint-disable-next-line no-var
  var __sqlite: Database.Database | undefined
}

function initDb() {
  const sqlite = new Database(DB_PATH)

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      bio TEXT,
      avatar_url TEXT,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','admin')),
      theme TEXT NOT NULL DEFAULT 'classic' CHECK(theme IN ('classic','neon','soft')),
      enabled INTEGER NOT NULL DEFAULT 1,
      link_style TEXT NOT NULL DEFAULT 'overlay' CHECK(link_style IN ('default','overlay')),
      layout TEXT NOT NULL DEFAULT 'list' CHECK(layout IN ('list','grid')),
      show_blurred_bg INTEGER NOT NULL DEFAULT 1,
      show_bio INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT '🔗',
      thumbnail_url TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      enabled INTEGER NOT NULL DEFAULT 1,
      click_count INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS page_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      timestamp INTEGER NOT NULL,
      ip_hash TEXT,
      user_agent TEXT,
      referrer TEXT,
      country TEXT
    );

    CREATE TABLE IF NOT EXISTS link_clicks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      link_id INTEGER NOT NULL REFERENCES links(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      timestamp INTEGER NOT NULL,
      ip_hash TEXT,
      referrer TEXT
    );
  `)

  return { sqlite, db: drizzle(sqlite, { schema }) }
}

function getDb() {
  if (process.env.NODE_ENV === 'production') {
    const { sqlite, db } = initDb()
    global.__sqlite = sqlite
    return db
  }
  // In dev, use a global singleton to survive hot reloads
  if (!global.__db) {
    const { sqlite, db } = initDb()
    global.__sqlite = sqlite
    global.__db = db
  }
  return global.__db
}

export const db = getDb()
