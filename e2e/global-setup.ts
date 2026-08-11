import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

export default function globalSetup() {
  const testDbPath = path.join(process.cwd(), 'data', 'e2e-test.sqlite');

  if (fs.existsSync(testDbPath)) {
    const db = new Database(testDbPath);
    db.exec(`DELETE FROM tasks`);
    db.close();
  }
}