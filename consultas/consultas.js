const express = require('express');
const router = express.Router();
const client = require('../DB');


router.get('/producto-pedido/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query(
      `SELECT p.nombre, p.precio, dp.cantidad
       FROM detallepedido dp
       JOIN producto p ON dp.id_prod = p.id_prod
       WHERE dp.id_pedido = $1`, [id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/productos-mas-vendidos/:min', async (req, res) => {
  const { min } = req.params;
  try {
    const result = await client.query(
      `SELECT p.nombre, SUM(dp.cantidad) AS total_vendido
       FROM detallepedido dp
       JOIN producto p ON dp.id_prod = p.id_prod
       GROUP BY p.nombre
       HAVING SUM(dp.cantidad) > $1`, [min]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/ventas-por-restaurante', async (req, res) => {
  try {
    const result = await client.query(
      `SELECT r.nombre AS restaurante, SUM(p.total) AS total_ventas
       FROM pedido p
       JOIN restaurante r ON p.id_rest = r.id_rest
       GROUP BY r.nombre`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/pedidos-por-fecha/:fecha', async (req, res) => {
  const { fecha } = req.params;
  try {
    const result = await client.query(
      `SELECT * FROM pedido
       WHERE fecha::DATE = $1`, [fecha]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/empleados-por-rol/:restauranteId/:rol', async (req, res) => {
  const { restauranteId, rol } = req.params;
  try {
    const result = await client.query(
      `SELECT nombre, rol
       FROM empleado
       WHERE id_rest = $1 AND rol = $2`, [restauranteId, rol]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
