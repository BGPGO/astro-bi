# astro-bi-spa

Dash da Astro Distribuidora — SPA estática com DuckDB-WASM rodando SQL no browser sobre parquet. Substitui a página Dash do Streamlit antigo (que vai pra `astro-bi-legacy.*`).

## Stack
- Vite + React + TypeScript + Tailwind
- DuckDB-WASM (SQL no browser sobre parquet)
- Apache ECharts
- nginx no Coolify

## Dev local
```sh
npm install
npm run dev        # http://localhost:5173
```

## Build do parquet slim
O parquet servido em `public/data/vendas_dash.parquet` é gerado por:
```sh
python scripts/slim_parquet.py
```
Lê `vendas_tiny_bu.parquet` de `C:\Projects\astro-giro-bi\data\` (alimentado pelo cron diário do BGPSERVER em G:\Meu Drive\BGP\CLIENTES\STRATEGY\ASTRO\07. BI\tiny_automatica.R), filtra colunas + Cancelado e compacta em zstd. ~3.8MB.

## Build / deploy
```sh
npm run build      # gera dist/
docker build .     # multi-stage Dockerfile (node build → nginx serve)
```
Coolify: app no `BGPGO/astro-bi-spa`, build pack dockerfile, domínio `astro-bi.187.77.238.125.sslip.io`.
