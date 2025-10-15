import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('treinos.db');

export function initDb() {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS treinos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        atividade TEXT NOT NULL,
        duracaoMin INTEGER,
        categoria TEXT
    );
`);
}