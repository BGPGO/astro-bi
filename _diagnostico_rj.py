"""Por que RJ da prejuizo? Diagnostico mecanismo."""
import pandas as pd
import duckdb

PARQUET = r"C:\Projects\astro-giro-bi\data\vendas_tiny_bu.parquet"
CSV = r"C:\Projects\astro-giro-bi\data\frete_empresa_rj.csv"

pd.set_option('display.max_columns', None)
pd.set_option('display.width', 200)
pd.set_option('display.float_format', '{:,.2f}'.format)

# Carrega CSV limpo
df = pd.read_csv(CSV, sep=',', encoding='utf-8-sig')
def parse_br(s):
    s = str(s).strip()
    # Formato BR: 1.096,71 ou 1096,71 → remove pontos de milhar, troca vírgula
    if ',' in s:
        # vírgula é decimal
        s = s.replace('.', '').replace(',', '.')
    return float(s) if s else 0.0
df['frete'] = df['frete'].apply(parse_br)
df['freteEmpresa'] = df['freteEmpresa'].apply(parse_br)
df['pesoBruto'] = df['pesoBruto'].apply(parse_br)
df['gap'] = df['freteEmpresa'] - df['frete']

# 1. Distribuicao quem paga
print("="*100)
print("BLOCO 1: fretePorConta (R=remetente Astro / D=destinatario cliente)")
print("="*100)
print(df.groupby('fretePorConta').agg(
    n=('id_request', 'count'),
    frete_cobrado_total=('frete', 'sum'),
    frete_custo_total=('freteEmpresa', 'sum'),
    gap_total=('gap', 'sum'),
    frete_cobrado_med=('frete', 'mean'),
    frete_custo_med=('freteEmpresa', 'mean'),
).round(2).to_string())

# 2. Por transportadora
print()
print("="*100)
print("BLOCO 2: Por transportadora")
print("="*100)
g = df.groupby('transportador').agg(
    n=('id_request', 'count'),
    peso_med=('pesoBruto', 'mean'),
    frete_cobrado_med=('frete', 'mean'),
    frete_custo_med=('freteEmpresa', 'mean'),
    gap_med=('gap', 'mean'),
    gap_total=('gap', 'sum'),
    cobrado_por_kg=('frete', lambda x: (x.sum() / df.loc[x.index, 'pesoBruto'].sum()) if df.loc[x.index, 'pesoBruto'].sum() else 0),
    custo_por_kg=('freteEmpresa', lambda x: (x.sum() / df.loc[x.index, 'pesoBruto'].sum()) if df.loc[x.index, 'pesoBruto'].sum() else 0),
).round(2).sort_values('gap_total', ascending=False)
print(g.to_string())

# 3. Top 20 prejuizos individuais
print()
print("="*100)
print("BLOCO 3: Top 20 piores prejuizos individuais")
print("="*100)
top = df.nlargest(20, 'gap')[['id_request', 'transportador', 'pesoBruto', 'frete', 'freteEmpresa', 'gap', 'fretePorConta']]
print(top.to_string(index=False))

# 4. Distribuicao do gap (qts pedidos com gap>X)
print()
print("="*100)
print("BLOCO 4: Quantos pedidos com cada faixa de gap")
print("="*100)
bins = [-1000, 0, 10, 50, 100, 200, 500, 99999]
labels = ['gap<=0_lucro', '0-10', '10-50', '50-100', '100-200', '200-500', '500+']
df['faixa_gap'] = pd.cut(df['gap'], bins=bins, labels=labels)
fx = df.groupby('faixa_gap', observed=True).agg(n=('id_request', 'count'), gap_total=('gap', 'sum'), gap_med=('gap', 'mean')).round(2)
fx['pct_n'] = (fx['n'] / fx['n'].sum() * 100).round(1)
print(fx.to_string())

# 5. Frete cobrado = 0 ou negativo
print()
print("="*100)
print("BLOCO 5: Pedidos com FRETE COBRADO ZERO (subsidio total)")
print("="*100)
zero = df[df['frete'] == 0]
print(f"Total: {len(zero)} pedidos com frete cobrado=0")
print(f"Custo total que Astro pagou nesses pedidos: R$ {zero['freteEmpresa'].sum():,.2f}")
print(f"Custo medio: R$ {zero['freteEmpresa'].mean():.2f}")
print(f"Peso medio: {zero['pesoBruto'].mean():.2f} kg")
print()
print("Por transportadora nos frete-zero:")
print(zero.groupby('transportador').agg(n=('id_request', 'count'), custo_total=('freteEmpresa', 'sum')).round(2).sort_values('custo_total', ascending=False).to_string())

# 6. Cruzar com parquet pra ver valor do pedido nesses zerados
print()
print("="*100)
print("BLOCO 6: Pedidos frete-zero — qual o valor do pedido?")
print("="*100)
con = duckdb.connect()
ids = ','.join(map(str, zero['id_request'].astype(int).tolist()[:5000]))
q = f"""
SELECT id, SUM(valor_rateado) AS valor_pedido, MAX(situacao) AS situacao,
  MAX(cliente_uf) AS uf
FROM read_parquet('{PARQUET}')
WHERE id IN ({ids})
GROUP BY id
"""
df_vendas = con.execute(q).fetchdf()
ze = zero.merge(df_vendas, left_on='id_request', right_on='id', how='left')
# Faixas de valor do pedido
ze['faixa_valor'] = pd.cut(ze['valor_pedido'].fillna(0),
                            bins=[-1, 100, 500, 1000, 3000, 10000, 99999],
                            labels=['<100', '100-500', '500-1k', '1k-3k', '3k-10k', '>10k'])
fv = ze.groupby('faixa_valor', observed=True).agg(
    n=('id_request', 'count'),
    valor_pedido_total=('valor_pedido', 'sum'),
    custo_frete_total=('freteEmpresa', 'sum'),
    custo_med=('freteEmpresa', 'mean'),
    peso_med=('pesoBruto', 'mean'),
).round(2)
fv['pct_pedidos'] = (fv['n']/fv['n'].sum()*100).round(1)
fv['frete_custo_pct_valor'] = (fv['custo_frete_total']/fv['valor_pedido_total']*100).round(2)
print(fv.to_string())

# 7. Identificar a REGRA — quando frete vira zero
print()
print("="*100)
print("BLOCO 7: Procura padrao — qual valor de pedido aciona frete zero?")
print("="*100)
ze_valid = ze.dropna(subset=['valor_pedido'])
print(f"Frete-zero com valor de pedido conhecido: {len(ze_valid)}")
print(f"Min valor pedido: R$ {ze_valid['valor_pedido'].min():.2f}")
print(f"Mediana: R$ {ze_valid['valor_pedido'].median():.2f}")
print(f"Media: R$ {ze_valid['valor_pedido'].mean():.2f}")
print(f"Quantil 25: R$ {ze_valid['valor_pedido'].quantile(0.25):.2f}")
print()
print("Por transportadora:")
print(ze_valid.groupby('transportador').agg(
    n=('id_request', 'count'),
    valor_pedido_min=('valor_pedido', 'min'),
    valor_pedido_med=('valor_pedido', 'median'),
    custo_frete_med=('freteEmpresa', 'mean'),
).round(2).to_string())

# 8. Comparar Braspress vs Jadlog — peso
print()
print("="*100)
print("BLOCO 8: BRASPRESS vs JADLOG — peso, custo/kg, mecanismo")
print("="*100)
for t in ['BRASPRESS LOGISTICA E TRANSPORTE LTDA', 'TRANSPORTADORA JADLOG']:
    sub = df[df['transportador'] == t]
    if len(sub) == 0: continue
    print(f"\n{t}:")
    print(f"  n envios:           {len(sub)}")
    print(f"  peso medio:         {sub['pesoBruto'].mean():.2f} kg")
    print(f"  peso mediano:       {sub['pesoBruto'].median():.2f} kg")
    print(f"  peso max:           {sub['pesoBruto'].max():.2f} kg")
    print(f"  frete cobrado med:  R$ {sub['frete'].mean():.2f}")
    print(f"  frete custo med:    R$ {sub['freteEmpresa'].mean():.2f}")
    print(f"  R$/kg cobrado:      R$ {(sub['frete'].sum()/sub['pesoBruto'].sum()):.2f}")
    print(f"  R$/kg custo real:   R$ {(sub['freteEmpresa'].sum()/sub['pesoBruto'].sum()):.2f}")
    print(f"  ratio custo/cobr:   {(sub['freteEmpresa'].sum()/sub['frete'].sum()):.1f}x")
    print(f"  % com frete zero:   {(sub['frete']==0).sum()*100/len(sub):.1f}%")
