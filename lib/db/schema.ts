import { pgTable, text, timestamp, boolean, serial, integer, jsonb } from "drizzle-orm/pg-core"

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// --- App tables ------------------------------------------------------------
// Every table carries a plain `userId` column for per-user scoping (no RLS on
// Neon). No foreign keys by request of the default stack guidance.

// The person being cared for (one active per user, but we allow multiple)
export const careRecipient = pgTable("care_recipient", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  name: text("name").notNull(),
  age: integer("age"),
  relationship: text("relationship"),
  conditions: text("conditions"),
  notes: text("notes"),
  isPrimary: boolean("isPrimary").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  name: text("name").notNull(),
  dosage: text("dosage"),
  frequency: text("frequency"),
  // comma-separated times of day, e.g. "08:00,20:00"
  times: text("times"),
  color: text("color").notNull().default("primary"),
  notes: text("notes"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// A log of each dose taken/skipped for adherence tracking
export const medLogs = pgTable("med_logs", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  medicationId: integer("medicationId").notNull(),
  scheduledFor: text("scheduledFor").notNull(), // "YYYY-MM-DD HH:mm"
  status: text("status").notNull().default("taken"), // taken | skipped
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  title: text("title").notNull(),
  doctor: text("doctor"),
  location: text("location"),
  startsAt: timestamp("startsAt").notNull(),
  reminderMinutes: integer("reminderMinutes").notNull().default(60),
  notes: text("notes"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  title: text("title").notNull(),
  dueAt: timestamp("dueAt"),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const familyMembers = pgTable("family_members", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  name: text("name").notNull(),
  relationship: text("relationship"),
  email: text("email"),
  role: text("role").notNull().default("viewer"), // caregiver | viewer
  status: text("status").notNull().default("active"), // active | pending
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const familyInvites = pgTable("family_invites", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  code: text("code").notNull().unique(),
  email: text("email"),
  name: text("name"),
  role: text("role").notNull().default("viewer"),
  status: text("status").notNull().default("pending"), // pending | accepted
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const wellnessCheckins = pgTable("wellness_checkins", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  mood: integer("mood").notNull().default(3),
  energy: integer("energy").notNull().default(3),
  stress: integer("stress").notNull().default(3),
  sleep: integer("sleep").notNull().default(3),
  note: text("note"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const aiSessions = pgTable("ai_sessions", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Latest row per careProfileId is the current status; older rows are history.
export const patientStatus = pgTable("patient_status", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  careProfileId: integer("careProfileId").notNull(),
  status: text("status").notNull(), // well | soso | unwell
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const notificationPrefs = pgTable("notification_prefs", {
  userId: text("userId").primaryKey(),
  language: text("language").notNull().default("pt"),
  timeZone: text("timeZone"),
  familyUpdates: boolean("familyUpdates").notNull().default(true),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// One row per reminder already sent, so the scheduled check never sends twice.
export const notificationLog = pgTable("notification_log", {
  key: text("key").primaryKey(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Medication and appointment reminders waiting to be pushed at an exact time.
// dedupeKey stops the daily cron and Home visits from queueing the same reminder twice.
export const notificationQueue = pgTable("notification_queue", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  type: text("type").notNull(), // medication | appointment
  dedupeKey: text("dedupeKey").notNull().unique(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  payload: jsonb("payload").notNull(),
  sent: boolean("sent").notNull().default(false),
  sentAt: timestamp("sentAt"),
  outcome: text("outcome"), // push | email | none | skipped
  runId: text("runId"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull().unique(),
  plan: text("plan").notNull().default("free"), // free | pro
  status: text("status").notNull().default("inactive"), // active | canceled | inactive
  stripeCustomerId: text("stripeCustomerId"),
  stripeSubscriptionId: text("stripeSubscriptionId"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").notNull().default(false),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})
