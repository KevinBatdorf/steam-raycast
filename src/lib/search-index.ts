import { environment } from "@raycast/api";
import { mkdirSync } from "fs";
import { DatabaseSync } from "node:sqlite";
import { join } from "path";
import { SteamGameHit } from "../types";
import { steamFetch } from "./http";

const SCHEMA_VERSION = 2;
const PAGE_SIZE = 50_000;
const CANDIDATES = 1_000;
const WRITE_CHUNK = 2_000;

type AppListResponse = {
  response?: {
    apps?: { appid: number; name?: string }[];
    have_more_results?: boolean;
    last_appid?: number;
  };
};

export class IndexSyncError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

let database: DatabaseSync | undefined;
let syncing: Promise<void> | undefined;

// SQLite's LIKE folds ASCII case only, so names are stored and searched in this folded form
export const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

function db() {
  if (database) return database;
  mkdirSync(environment.supportPath, { recursive: true });
  const opened = new DatabaseSync(join(environment.supportPath, "apps.sqlite"));
  try {
    // A command and its AI tools can open the file at once, so wait for locks and migrate atomically
    opened.exec("PRAGMA busy_timeout = 5000");
    opened.exec("PRAGMA journal_mode = WAL");
    opened.exec("BEGIN IMMEDIATE");
    try {
      const { user_version } = opened.prepare("PRAGMA user_version").get() as { user_version: number };
      if (user_version !== SCHEMA_VERSION) {
        opened.exec(`
          DROP TABLE IF EXISTS app_fts;
          DROP TABLE IF EXISTS app;
          DROP TABLE IF EXISTS meta;
          CREATE TABLE app (
            appid INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            search_name TEXT NOT NULL COLLATE NOCASE
          );
          CREATE INDEX app_search_name ON app (search_name);
          CREATE VIRTUAL TABLE app_fts USING fts5(
            search_name, content = 'app', content_rowid = 'appid', tokenize = 'trigram', detail = 'none'
          );
          CREATE TRIGGER app_insert AFTER INSERT ON app BEGIN
            INSERT INTO app_fts (rowid, search_name) VALUES (new.appid, new.search_name);
          END;
          CREATE TRIGGER app_update AFTER UPDATE ON app BEGIN
            INSERT INTO app_fts (app_fts, rowid, search_name) VALUES ('delete', old.appid, old.search_name);
            INSERT INTO app_fts (rowid, search_name) VALUES (new.appid, new.search_name);
          END;
          CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
          PRAGMA user_version = ${SCHEMA_VERSION};
        `);
      }
      opened.exec("COMMIT");
    } catch (error) {
      opened.exec("ROLLBACK");
      throw error;
    }
  } catch (error) {
    opened.close();
    throw error;
  }
  database = opened;
  return database;
}

function syncedAt() {
  const row = db().prepare("SELECT value FROM meta WHERE key = 'synced_at'").get() as { value: string } | undefined;
  return Number(row?.value ?? 0);
}

export function isIndexReady() {
  try {
    return syncedAt() > 0;
  } catch {
    return false;
  }
}

export function indexAgeDays() {
  return (Date.now() / 1000 - syncedAt()) / 86_400;
}

export function isIndexStale(maxAgeDays: number) {
  return indexAgeDays() > maxAgeDays;
}

export function syncIndex(key: string) {
  syncing ??= runSync(key).finally(() => {
    syncing = undefined;
  });
  return syncing;
}

async function runSync(key: string) {
  const since = syncedAt();
  const startedAt = Math.floor(Date.now() / 1000);
  const upsert = db().prepare(
    `INSERT INTO app (appid, name, search_name) VALUES (?, ?, ?)
     ON CONFLICT (appid) DO UPDATE SET name = excluded.name, search_name = excluded.search_name
     WHERE name != excluded.name`,
  );
  let lastAppid = 0;
  for (;;) {
    const url = new URL("https://api.steampowered.com/IStoreService/GetAppList/v1/");
    url.searchParams.set("key", key);
    url.searchParams.set("max_results", String(PAGE_SIZE));
    url.searchParams.set("include_games", "true");
    url.searchParams.set("include_software", "true");
    if (since) url.searchParams.set("if_modified_since", String(since));
    if (lastAppid) url.searchParams.set("last_appid", String(lastAppid));

    const response = await steamFetch(url);
    if (!response.ok) {
      throw new IndexSyncError(
        response.status === 401 || response.status === 403
          ? "Steam rejected the Web API Key"
          : `Could not download the Steam game list (${response.status})`,
        response.status,
      );
    }
    const { response: page } = (await response.json()) as AppListResponse;

    const apps = page?.apps ?? [];
    for (let start = 0; start < apps.length; start += WRITE_CHUNK) {
      db().exec("BEGIN");
      try {
        for (const app of apps.slice(start, start + WRITE_CHUNK)) {
          if (app.appid && app.name) upsert.run(app.appid, app.name, normalize(app.name));
        }
        db().exec("COMMIT");
      } catch (error) {
        db().exec("ROLLBACK");
        throw error;
      }
      // Writes share a thread with the open list, so yield between chunks to keep it responsive
      await new Promise((resolve) => setImmediate(resolve));
    }

    if (!page?.have_more_results || !page.last_appid) break;
    lastAppid = page.last_appid;
  }
  db()
    .prepare(
      "INSERT INTO meta (key, value) VALUES ('synced_at', ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value",
    )
    .run(String(startedAt));
}

function rank(searchName: string, query: string, words: string[]) {
  if (searchName === query) return 0;
  if (searchName.startsWith(query)) return 1;
  const nameWords = searchName.split(" ");
  if (words.every((word) => nameWords.some((nameWord) => nameWord.startsWith(word)))) return 2;
  return 3;
}

type IndexRow = { appid: number; name: string; search_name: string };

export function searchIndex(term: string, limit = 50): SteamGameHit[] {
  const query = normalize(term);
  const words = query.split(" ").filter(Boolean);
  if (!words.length) return [];

  // Trigrams need three characters, so shorter words filter the candidates instead of the index
  const indexed = words.filter((word) => word.length >= 3);
  const filters = words.filter((word) => word.length < 3);
  let rows: IndexRow[];
  if (indexed.length) {
    // Words are letters and digits only, and an ESCAPE clause stops FTS5 using the trigram index
    const where = [
      ...indexed.map(() => "app_fts.search_name LIKE ?"),
      ...filters.map(() => "app.search_name LIKE ?"),
    ].join(" AND ");
    rows = db()
      .prepare(
        `SELECT app.appid, app.name, app.search_name FROM app_fts JOIN app ON app.appid = app_fts.rowid WHERE ${where} ORDER BY length(app.name) LIMIT ${CANDIDATES}`,
      )
      .all(...[...indexed, ...filters].map((word) => `%${word}%`)) as IndexRow[];
  } else {
    rows = db()
      .prepare(
        `SELECT appid, name, search_name FROM app WHERE search_name LIKE ? ORDER BY length(name) LIMIT ${CANDIDATES}`,
      )
      .all(`${query}%`) as IndexRow[];
  }

  return rows
    .map((row) => ({ row, score: rank(row.search_name, query, words) }))
    .sort((a, b) => a.score - b.score || a.row.name.length - b.row.name.length)
    .slice(0, limit)
    .map(({ row }) => ({ appid: row.appid, name: row.name }));
}
