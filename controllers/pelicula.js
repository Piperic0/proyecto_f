const express = require('express');
const router = express.Router();
const client = require('../DB');

router.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM pelicula');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener películas', error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { titulo, genero, duracion } = req.body;
  try {
    await client.query('INSERT INTO pelicula (titulo, genero, duracion) VALUES ($1, $2, $3)', [titulo, genero, duracion]);
    res.status(201).json({ message: 'Película creada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear película', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, genero, duracion } = req.body;
  try {
    const result = await client.query('UPDATE pelicula SET titulo=$1, genero=$2, duracion=$3 WHERE pelicula_id=$4', [titulo, genero, duracion, id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Película no encontrada' });
    res.json({ message: 'Película actualizada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar película', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM pelicula WHERE pelicula_id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Película no encontrada' });
    res.json({ message: 'Película eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar película', error: error.message });
  }
});

module.exports = router;
