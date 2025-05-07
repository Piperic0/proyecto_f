const express = require('express');
const router = express.Router();
const client = require('../DB');

router.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM reserva');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reservas', error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { funcion_id, nombre_cliente, cantidad } = req.body;
  try {
    await client.query('INSERT INTO reserva (funcion_id, nombre_cliente, cantidad) VALUES ($1, $2, $3)', [funcion_id, nombre_cliente, cantidad]);
    res.status(201).json({ message: 'Reserva creada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear reserva', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { funcion_id, nombre_cliente, cantidad } = req.body;
  try {
    const result = await client.query('UPDATE reserva SET funcion_id=$1, nombre_cliente=$2, cantidad=$3 WHERE reserva_id=$4', [funcion_id, nombre_cliente, cantidad, id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Reserva no encontrada' });
    res.json({ message: 'Reserva actualizada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar reserva', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM reserva WHERE reserva_id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Reserva no encontrada' });
    res.json({ message: 'Reserva eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar reserva', error: error.message });
  }
});

module.exports = router;
