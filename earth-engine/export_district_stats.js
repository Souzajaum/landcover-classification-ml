// Carregar os limites dos bairros (asset do GEE)
var bairros = ee.FeatureCollection('projects/land-use-analysis/assets/saida-1742236366843');

// Carregar a imagem classificada (resultado do seu modelo de classificação)
var classificado = ee.Image('projects/land-use-analysis/assets/classified_image'); // ajuste conforme seu asset

// Defina a área de cada pixel (por exemplo, 10m x 10m = 100 m²)
var pixelArea = 100;

// Calcular a contagem de pixels (histograma) para cada classe em cada bairro
var stats = classificado.reduceRegions({
  collection: bairros,
  reducer: ee.Reducer.frequencyHistogram(),  // Calcula um histograma dos valores de pixel
  scale: 10,
  maxPixelsPerRegion: 1e9
});

// Para cada bairro, multiplique cada contagem pelo pixelArea para obter a área em m²
var statsWithArea = stats.map(function(feature) {
  // A propriedade 'histogram' é criada pelo frequencyHistogram reducer
  var hist = ee.Dictionary(feature.get('histogram'));
  // Multiplicar cada contagem (valor) pelo pixelArea
  var areaDict = hist.map(function(key, count) {
    return ee.Number(count).multiply(pixelArea);
  });
  return feature.set('area_by_class', areaDict);
});

// Exportar a tabela com os resultados para o Google Drive
Export.table.toDrive({
  collection: statsWithArea,
  description: 'district_stats',
  fileFormat: 'CSV'
});
