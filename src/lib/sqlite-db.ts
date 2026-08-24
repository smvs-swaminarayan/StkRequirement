import path from 'path';
import fs from 'fs';

let _dbInstance: any = null;

function getDbInstance() {
  if (!_dbInstance) {
    try {
      const Database = require('better-sqlite3');
      const dbPath = path.join(process.cwd(), 'normalized_database.sqlite');
      _dbInstance = new Database(dbPath, { verbose: console.log });

      try {
        _dbInstance.exec(`
          CREATE TABLE IF NOT EXISTS meta (
            id TEXT PRIMARY KEY,
            nextProductId INTEGER DEFAULT 1
          );
        `);
        const tableInfo = _dbInstance.prepare("PRAGMA table_info(items)").all() as Array<{ name: string }>;
        const hasIsPermission = tableInfo.some((col: any) => col.name === "is_permission");
        if (!hasIsPermission) {
          _dbInstance.prepare("ALTER TABLE items ADD COLUMN is_permission TEXT DEFAULT 'NO'").run();
        }
      } catch (e) {
        console.warn("[SQLite] Migration warning:", e);
      }
    } catch (e) {
      console.warn("[SQLite] better-sqlite3 not loaded (running in MySQL mode).");
    }
  }
  return _dbInstance;
}

export const db: any = new Proxy({}, {
  get(_target, prop) {
    const instance = getDbInstance();
    if (!instance) {
      throw new Error("SQLite instance is not available in serverless MySQL mode.");
    }
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});

// Automatic Database Backup Engine for Google Drive / OneDrive Sync
export function performAutoBackup() {
  if (process.env.DB_TYPE === "mysql") return;
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const todayStr = new Date().toISOString().slice(0, 10);
    const dbPath = path.join(process.cwd(), 'normalized_database.sqlite');
    const backupFile = path.join(backupDir, `database_backup_${todayStr}.sqlite`);
    const latestBackup = path.join(backupDir, `database_backup_latest.sqlite`);
    fs.copyFileSync(dbPath, backupFile);
    fs.copyFileSync(dbPath, latestBackup);
    console.log(`[AutoBackup] Successfully backed up database to ${backupFile}`);
  } catch (err) {
    console.error("[AutoBackup] Backup failed:", err);
  }
}

import { exec } from 'child_process';

// Automatic Database & Code Git Backup Engine
export function performAutoGitBackup() {
  if (process.env.DB_TYPE === "mysql") return;
  try {
    performAutoBackup();
    exec('git status --porcelain', { cwd: process.cwd() }, (err, stdout) => {
      if (err) return;
      if (stdout && stdout.trim().length > 0) {
        const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        const commitMsg = `Auto-Backup: Database & Code update at ${timestamp}`;
        exec(`git add . && git commit -m "${commitMsg}" && git push origin main`, { cwd: process.cwd() }, (pushErr) => {
          if (!pushErr) {
            console.log(`[AutoGitBackup] Successfully committed and pushed to GitHub at ${timestamp}`);
          }
        });
      }
    });
  } catch (e) {
    console.error("[AutoGitBackup] Error:", e);
  }
}
