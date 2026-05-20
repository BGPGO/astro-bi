"""Le vendas_tiny_bu.parquet (95 cols, 413k rows) e gera vendas_dash.parquet (17 cols)
com so o necessario pra tela Dash. Tipos otimizados. Filtra Cancelado.
"""
from pathlib import Path
import pandas as pd

SRC = Path(r"C:\Projects\astro-giro-bi\data\vendas_tiny_bu.parquet")
DST = Path(__file__).parent.parent / "public" / "data" / "vendas_dash.parquet"

COLS = [
    "data_pedido", "numero", "situacao",
    "marca", "categoria_mae", "sub_categoria", "seo_title",
    "valor_rateado", "preco_custo", "quantidade",
    "cliente_uf", "cliente_tipo_pessoa", "cliente_bairro", "cliente_cidade",
    "forma_pagamento", "nome_transportador", "Recompra",
]

print(f"Reading {SRC}...")
df = pd.read_parquet(SRC, columns=COLS)
print(f"  shape: {df.shape}")

# Tipos
df["data_pedido"] = pd.to_datetime(df["data_pedido"], errors="coerce")
df = df[df["data_pedido"].notna()]
df["valor_rateado"] = pd.to_numeric(df["valor_rateado"], errors="coerce").fillna(0).astype("float32")
df["preco_custo"] = pd.to_numeric(df["preco_custo"], errors="coerce").fillna(0).astype("float32")
df["quantidade"] = pd.to_numeric(df["quantidade"], errors="coerce").fillna(0).astype("float32")

# Filtra fora Cancelado
df = df[df["situacao"] != "Cancelado"].copy()

# Strings limpas + categoricals onde faz sentido
for c in ("marca", "categoria_mae", "sub_categoria", "seo_title", "nome_transportador",
          "forma_pagamento", "cliente_uf", "cliente_bairro", "cliente_cidade",
          "cliente_tipo_pessoa", "Recompra"):
    df[c] = df[c].fillna("").astype(str).str.strip()
    df[c] = df[c].replace("", None)

df["cliente_uf"] = df["cliente_uf"].str.upper()
df["categoria_mae"] = df["categoria_mae"].fillna("(sem categoria)")
df["sub_categoria"] = df["sub_categoria"].fillna("(sem sub)")
df["marca"] = df["marca"].fillna("(sem marca)")
df["seo_title"] = df["seo_title"].fillna("(sem seo)")

# Categoricals pra reduzir tamanho
for c in ("marca", "categoria_mae", "sub_categoria", "cliente_uf",
          "cliente_tipo_pessoa", "Recompra", "forma_pagamento", "nome_transportador"):
    df[c] = df[c].astype("category")

# numero como string (vai virar string no DuckDB)
df["numero"] = df["numero"].astype(str)
df = df.drop(columns=["situacao"])  # nao precisa mais

# Salva com zstd + dictionary encoding
DST.parent.mkdir(parents=True, exist_ok=True)
df.to_parquet(DST, compression="zstd", compression_level=15, engine="pyarrow")
print(f"Wrote {DST}")
print(f"  size: {DST.stat().st_size / 1024 / 1024:.2f} MB")
print(f"  shape: {df.shape}")
print(f"  dtypes:\n{df.dtypes}")
