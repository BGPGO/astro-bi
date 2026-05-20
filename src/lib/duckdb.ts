import * as duckdb from "@duckdb/duckdb-wasm";

let dbInstance: duckdb.AsyncDuckDB | null = null;
let initPromise: Promise<duckdb.AsyncDuckDB> | null = null;

async function initDB(): Promise<duckdb.AsyncDuckDB> {
  const JSDELIVR = duckdb.getJsDelivrBundles();
  const bundle = await duckdb.selectBundle(JSDELIVR);

  const worker_url = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker!}");`], {
      type: "text/javascript",
    })
  );

  const worker = new Worker(worker_url);
  const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  URL.revokeObjectURL(worker_url);

  return db;
}

export async function getDB(): Promise<duckdb.AsyncDuckDB> {
  if (dbInstance) return dbInstance;
  if (!initPromise) {
    initPromise = initDB().then((db) => {
      dbInstance = db;
      return db;
    });
  }
  return initPromise;
}

// Carrega o parquet como tabela `vendas`. Idempotente.
let parquetLoaded = false;
let parquetPromise: Promise<void> | null = null;

export async function ensureVendasLoaded(parquetUrl = "/data/vendas_dash.parquet"): Promise<void> {
  if (parquetLoaded) return;
  if (parquetPromise) return parquetPromise;
  parquetPromise = (async () => {
    const db = await getDB();
    const conn = await db.connect();
    // duckdb-wasm consegue ler URL HTTP via httpfs (built-in no wasm bundle moderno)
    // Mas pra evitar CORS, registramos como arquivo virtual
    const resp = await fetch(parquetUrl);
    if (!resp.ok) throw new Error(`fetch parquet ${resp.status}`);
    const buf = await resp.arrayBuffer();
    await db.registerFileBuffer("vendas.parquet", new Uint8Array(buf));
    await conn.query(`CREATE OR REPLACE VIEW vendas AS SELECT * FROM read_parquet('vendas.parquet')`);
    await conn.close();
    parquetLoaded = true;
  })();
  return parquetPromise;
}

// Helper de query que retorna array de objetos.
export async function query<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  const db = await getDB();
  const conn = await db.connect();
  try {
    const result = await conn.query(sql);
    // toArray() retorna Arrow Rows; cada row tem toJSON()
    const rows = result.toArray().map((r) => {
      const obj: Record<string, unknown> = {};
      for (const k of Object.keys(r)) {
        const v = (r as Record<string, unknown>)[k];
        // BigInt -> Number (cuidado com overflow, mas pra contagens ok)
        if (typeof v === "bigint") obj[k] = Number(v);
        else obj[k] = v;
      }
      return obj as T;
    });
    return rows;
  } finally {
    await conn.close();
  }
}

// Single-value query (primeira linha, primeira coluna)
export async function queryScalar<T = number>(sql: string): Promise<T | null> {
  const rows = await query<Record<string, T>>(sql);
  if (!rows.length) return null;
  const first = rows[0];
  const keys = Object.keys(first);
  if (!keys.length) return null;
  return first[keys[0]] ?? null;
}
