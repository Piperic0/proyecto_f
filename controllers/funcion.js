const express = require('express');
const router = express.Router();
const client = require('../DB');

router.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM funcion');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener funciones', error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { pelicula_id, sala_id, fecha, hora } = req.body;
  try {
    await client.query('INSERT INTO funcion (pelicula_id, sala_id, fecha, hora) VALUES ($1, $2, $3, $4)', [pelicula_id, sala_id, fecha, hora]);
    res.status(201).json({ message: 'Función creada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear función', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { pelicula_id, sala_id, fecha, hora } = req.body;
  try {
    const result = await client.query('UPDATE funcion SET pelicula_id=$1, sala_id=$2, fecha=$3, hora=$4 WHERE funcion_id=$5', [pelicula_id, sala_id, fecha, hora, id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Función no encontrada' });
    res.json({ message: 'Función actualizada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar función', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM funcion WHERE funcion_id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Función no encontrada' });
    res.json({ message: 'Función eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar función', error: error.message });
  }
});

module.exports = router;
