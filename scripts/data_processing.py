import pandas as pd
import ast
import matplotlib.pyplot as plt
import seaborn as sns

# Carregar o CSV exportado do GEE
df = pd.read_csv('C:\\Users\\monte\\OneDrive\\Documentos\\codigos\\projeto-land-use-analysis\\land_uses_analysis\\land_uses_analysis\\data\\district_stats.csv')
print("Dados carregados:")

# Remover bairros com o nome "SEM DENOMINAÇÃO"
df = df[df['nome'] != 'SEM DENOMINAÇÃO']

# Corrigir o formato da coluna 'histogram' para um dicionário válido
def fix_histogram_format(hist_str):
    if pd.notnull(hist_str):
        # Substituir "=" por ":" para que o formato fique compatível com um dicionário
        fixed_str = hist_str.replace('=', ':')
        try:
            return ast.literal_eval(fixed_str)
        except Exception as e:
            print(f"Erro ao avaliar o histograma: {e}")
            return {}
    return {}

# Corrigir e converter a coluna 'histogram'
df['histogram'] = df['histogram'].apply(fix_histogram_format)

# Função para extrair a área para uma determinada classe
def extract_area(hist, classe):
    # Tenta buscar a chave como string; se não encontrar, tenta como inteiro
    if not isinstance(hist, dict):
        return 0
    return hist.get(str(classe), hist.get(classe, 0))

# Extrair as áreas para cada classe (supondo que:
# classe 0 = Vegetation, classe 1 = Urban)
df['Vegetation_m2'] = df['histogram'].apply(lambda d: extract_area(d, 0))
df['Urban_m2'] = df['histogram'].apply(lambda d: extract_area(d, 1))
df['Total_m2'] = df['Vegetation_m2'] + df['Urban_m2']

# Calcular porcentagens (se Total_m2 > 0)
df['Pct_Vegetation'] = df.apply(lambda row: (row['Vegetation_m2'] / row['Total_m2']) * 100 
                                if row['Total_m2'] > 0 else 0, axis=1)
df['Pct_Urban'] = df.apply(lambda row: (row['Urban_m2'] / row['Total_m2']) * 100 
                           if row['Total_m2'] > 0 else 0, axis=1)

# Exibir as principais colunas
print("\nProcessed Data:")
print(df[['nome', 'Vegetation_m2', 'Urban_m2', 'Total_m2', 'Pct_Vegetation', 'Pct_Urban']])

# Salvar o DataFrame atualizado em um novo CSV
df.to_csv('district_stats_processed.csv', index=False)