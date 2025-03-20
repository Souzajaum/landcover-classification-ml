// Carregar a coleção de bairros
var bairros = ee.FeatureCollection('projects/land-use-analysis/assets/saida-1742236366843');

// Exportar a coleção como GeoJSON
Export.table.toDrive({
  collection: bairros,
  description: 'Bairros_SM_GeoJSON',
  fileFormat: 'GeoJSON'
});
