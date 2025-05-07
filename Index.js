const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/api/prueba', (req, res) => {
  res.json({ message: 'API FUNCIONANDO CORRECTAMENTE', port: PORT });
});

app.use('/api/reservas', require('./controllers/reserva'));
app.use('/api/peliculas', require('./controllers/pelicula'));
app.use('/api/salas', require('./controllers/sala'));
app.use('/api/funciones', require('./controllers/funcion'));
app.use('/api/consultas', require('./consultas/consultas'));


app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
