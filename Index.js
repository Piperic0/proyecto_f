const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// Servir archivos estáticos (PDF, Excel, etc.)
app.use('/archivos', express.static(path.join(__dirname, 'archivos')));

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta raíz para probar que el backend funciona
app.get('/api', (req, res) => {
  res.json({ message: '✅ API FUNCIONANDO CORRECTAMENTE', port: PORT });
});

// Rutas organizadas por módulos
app.use('/api/reservas', require('./controllers/reserva'));
app.use('/api/peliculas', require('./controllers/pelicula'));
app.use('/api/salas', require('./controllers/sala'));
app.use('/api/funciones', require('./controllers/funcion'));
app.use('/api/consultas', require('./consultas/consultas'));
app.use('/api/usuarios', require('./controllers/usuarios'));

// Swagger (documentación API) — asegúrate que existe este archivo y exporta una función
require('./swagger/swagger')(app);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
}
);