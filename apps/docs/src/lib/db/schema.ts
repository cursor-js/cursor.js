import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

// Landing Page Love it / Hate it tablosu
export const feedbacks = pgTable('feedbacks', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  type: varchar('type', { length: 20 }).notNull(), // 'love', 'hate'
  message: text('message').notNull(),
  ipAddress: varchar('ip_address', { length: 45 }), // IPv4 / IPv6
  createdAt: timestamp('created_at').defaultNow(),
});

// Satın alınan lisanslar tablosu (Lemon Squeezy entegrasyonu)
export const licenses = pgTable('licenses', {
  id: varchar('id', { length: 255 }).primaryKey(), // Lemon Squeezy'den gelen sipariş ID'si
  key: varchar('key', { length: 255 }).notNull().unique(), // Kullanılacak API anahtarı
  status: varchar('status', { length: 50 }).notNull().default('active'), // active, expired, cancelled
  plan: varchar('plan', { length: 50 }).notNull().default('pro_solo'),
  userId: varchar('user_id', { length: 255 }),
  lemonSqueezyCustomerId: varchar('lemon_squeezy_customer_id', { length: 255 }),
  lemonSqueezyOrderId: varchar('lemon_squeezy_order_id', { length: 255 }),
  lemonSqueezySubscriptionId: varchar('lemon_squeezy_subscription_id', { length: 255 }),
  lemonSqueezyVariantId: varchar('lemon_squeezy_variant_id', { length: 255 }),
  customerEmail: varchar('customer_email', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// TTS (Ses) Önbellekleme Tablosu
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expiresAt').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)],
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [index('account_userId_idx').on(table.userId)],
);

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expiresAt').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
);

export const ttsCache = pgTable(
  'tts_cache',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    hash: varchar('hash', { length: 255 }).notNull(), // md5(text + speaker + language + style + model)
    prompt: text('prompt').notNull(),
    text: text('text').notNull(),
    speaker: varchar('speaker', { length: 100 }).notNull(),
    style: text('style').notNull().default(''),
    model: varchar('model', { length: 100 }).notNull().default('gemini-2.5-flash-preview-tts'),
    language: varchar('language', { length: 10 }).notNull().default('tr'),
    audioUrl: text('audio_url').notNull(), // Vercel Blob URL'si
    userId: varchar('user_id', { length: 255 }),
    licenseId: varchar('license_id', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [uniqueIndex('hash_idx').on(table.hash)],
);

export const ttsRequests = pgTable(
  'tts_requests',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    prompt: text('prompt').notNull(),
    text: text('text').notNull(),
    speaker: varchar('speaker', { length: 100 }).notNull(),
    style: text('style').notNull().default(''),
    model: varchar('model', { length: 100 }).notNull().default('gemini-2.5-flash-preview-tts'),
    language: varchar('language', { length: 10 }).notNull().default('tr'),
    status: varchar('status', { length: 50 }).notNull().default('pending'),
    userId: varchar('user_id', { length: 255 }).notNull(),
    licenseId: varchar('license_id', { length: 255 }).notNull(),
    requestedAt: timestamp('requested_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('tts_requests_user_id_idx').on(table.userId),
    index('tts_requests_status_idx').on(table.status),
  ],
);
