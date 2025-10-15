import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('filmes.db');

export function initDb() {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS filmes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        ano INTEGER,
        genero TEXT
    );
`);
}