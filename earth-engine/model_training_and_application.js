// Carregando os pontos de treino de ambos os arquivos CSV
var urbano = ee.FeatureCollection('projects/land-use-analysis/assets/urbano_pontos_treino');
var vegetacao = ee.FeatureCollection('projects/land-use-analysis/assets/vegetacao_pontos_treino');

// Definindo as classes para os pontos de treino
urbano = urbano.map(function(feature) {
  return feature.set('class', 0);  // Classe 0 para urbano
});

vegetacao = vegetacao.map(function(feature) {
  return feature.set('class', 1);  // Classe 1 para vegetação
});

// Unificando os pontos de treino
var pontosDeTreino = urbano.merge(vegetacao);

// Verificando a coleção unificada de pontos de treino
print('Pontos de treino unificados:', pontosDeTreino);

// Carregando a imagem do Sentinel-2 (ou qualquer imagem de satélite de sua escolha)
var imagem = ee.ImageCollection('COPERNICUS/S2')
              .filterBounds(pontosDeTreino)
              .filterDate('2023-01-01', '2023-12-31')
              .median();  // Selecionando a imagem média para o ano de 2023

// Verificando se a imagem foi carregada corretamente
print('Imagem do Sentinel-2:', imagem);

// Selecionando as bandas para o treinamento
var bandas = ['B2', 'B3', 'B4', 'B8'];  // Azul, Verde, Vermelho e NIR (pode variar dependendo da sua escolha)

// Extraindo as amostras de treinamento para o modelo
var treino = imagem.select(bandas).sampleRegions({
  collection: pontosDeTreino,
  properties: ['class'],
  scale: 10
});

// Verificando se as amostras foram extraídas corretamente
print('Amostras de treino:', treino);

// Treinando o classificador (RandomForest)
var classificador = ee.Classifier.smileRandomForest(50).train({
  features: treino,
  classProperty: 'class',
  inputProperties: bandas
});

// Verificando se o classificador foi treinado corretamente
print('Classificador treinado:', classificador);

// Aplicando o classificador à imagem
var classificado = imagem.select(bandas).classify(classificador);

// Visualizando a classificação no mapa
Map.centerObject(pontosDeTreino, 12);
Map.addLayer(classificado, {min: 0, max: 1, palette: ['yellow', 'green']}, 'Classificação');

// Verificando a imagem classificada no mapa
print('Imagem classificada:', classificado);

// Exportando a imagem classificada
Export.image.toDrive({
  image: classificado,
  description: 'classified_image',
  scale: 10,
  region: pontosDeTreino.geometry(),
  fileFormat: 'GeoTIFF'
});

// Confirmando a exportação da imagem
print('Exportação da imagem classificada foi iniciada.');

// Exportando o classificador treinado
Export.table.toDrive({
  collection: ee.FeatureCollection([
    ee.Feature(null, {classificador: classificador})
  ]),
  description: 'trained_classifier',
  fileFormat: 'TFRecord'
});

// Confirmando a exportação do classificador
print('Exportação do classificador foi iniciada.');