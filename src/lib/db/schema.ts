import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  display_name: text('display_name'),
  bio: text('bio'),
  avatar_url: text('avatar_url'),
  role: text('role', { enum: ['user', 'admin'] }).notNull().default('user'),
  theme: text('theme', { enum: ['classic', 'neon', 'soft'] }).notNull().default('classic'),
  enabled: integer('enabled').notNull().default(1),
  link_style: text('link_style', { enum: ['default', 'overlay'] }).notNull().default('overlay'),
  layout: text('layout', { enum: ['list', 'grid'] }).notNull().default('list'),
  show_blurred_bg: integer('show_blurred_bg').notNull().default(1),
  show_bio: integer('show_bio').notNull().default(1),
  bg_mode: text('bg_mode', { enum: ['blur', 'color', 'ai'] }).notNull().default('blur'),
  bg_value: text('bg_value'),
  bg_prompt: text('bg_prompt'),
  created_at: integer('created_at').notNull(),
})

export const links = sqliteTable('links', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  url: text('url').notNull(),
  icon: text('icon').notNull().default('🔗'),
  thumbnail_url: text('thumbnail_url'),
  card_size: text('card_size').notNull().default('full'),
  show_in_header: integer('show_in_header').notNull().default(0),
  position: integer('position').notNull().default(0),
  enabled: integer('enabled').notNull().default(1),
  click_count: integer('click_count').notNull().default(0),
  created_at: integer('created_at').notNull(),
})

export const page_views = sqliteTable('page_views', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull().references(() => users.id),
  timestamp: integer('timestamp').notNull(),
  ip_hash: text('ip_hash'),
  user_agent: text('user_agent'),
  referrer: text('referrer'),
  country: text('country'),
})

export const link_clicks = sqliteTable('link_clicks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  link_id: integer('link_id').notNull().references(() => links.id),
  user_id: integer('user_id').notNull().references(() => users.id),
  timestamp: integer('timestamp').notNull(),
  ip_hash: text('ip_hash'),
  referrer: text('referrer'),
})
