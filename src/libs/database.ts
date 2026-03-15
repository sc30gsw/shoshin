import { type SQLiteDatabase } from "expo-sqlite";

export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  const targetVersion = 2;

  await db.execAsync(`
    PRAGMA journal_mode = 'wal';
    PRAGMA foreign_keys = ON;
  `);

  const result = await db.getFirstAsync<{ user_version: number } | null>(
    "PRAGMA user_version"
  );
  let currentVersion = result?.user_version ?? 0;

  if (currentVersion >= targetVersion) {
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        name TEXT NOT NULL,
        goal TEXT NOT NULL,
        why TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'skill',
        target_date TEXT,
        reminder_interval TEXT NOT NULL DEFAULT 'daily',
        reminder_hour INTEGER NOT NULL DEFAULT 9,
        reminder_minute INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        notification_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    currentVersion = 1;
  }

  if (currentVersion === 1) {
    await db.execAsync(`
      ALTER TABLE goals ADD COLUMN reminder_weekday INTEGER NOT NULL DEFAULT 2;
      ALTER TABLE goals ADD COLUMN reminder_day INTEGER NOT NULL DEFAULT 1;
    `);
    currentVersion = 2;
  }

  await db.execAsync(`PRAGMA user_version = ${targetVersion}`);
}
