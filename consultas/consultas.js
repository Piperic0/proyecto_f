const express = require('express');
const router = express.Router();
const client = require('../DB');

/**
 * @swagger
 * tags:
 *   name: Consultas
 *   description: Consultas personalizadas sobre reservas, películas y funciones
 */

/**
 * @swagger
 * /consultas/reservas-funcion/{id}:
 *   get:
 *     summary: Obtener reservas de una función específica
 *     tags: [Consultas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la función
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de reservas de la función
 */
router.get('/reservas-funcion/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query(
      `SELECT r.nombre_cliente, r.cantidad, p.titulo, s.nombre AS sala, f.fecha, f.hora
       FROM reserva r
       JOIN funcion f ON r.funcion_id = f.funcion_id
       JOIN pelicula p ON f.pelicula_id = p.pelicula_id
       JOIN sala s ON f.sala_id = s.sala_id
       WHERE f.funcion_id = $1`, [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /consultas/peliculas-mas-reservadas/{min}:
 *   get:
 *     summary: Películas con más reservas que un mínimo de entradas
 *     tags: [Consultas]
 *     parameters:
 *       - in: path
 *         name: min
 *         required: true
 *         description: Mínimo de entradas reservadas
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de películas con alto número de reservas
 */
router.get('/peliculas-mas-reservadas/:min', async (req, res) => {
  const { min } = req.params;
  try {
    const result = await client.query(
      `SELECT p.titulo, SUM(r.cantidad) AS total_reservado
       FROM reserva r
       JOIN funcion f ON r.funcion_id = f.funcion_id
       JOIN pelicula p ON f.pelicula_id = p.pelicula_id
       GROUP BY p.titulo
       HAVING SUM(r.cantidad) > $1
       ORDER BY total_reservado DESC`, [min]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /consultas/ventas-por-sala:
 *   get:
 *     summary: Obtener ventas totales por sala
 *     tags: [Consultas]
 *     responses:
 *       200:
 *         description: Número de entradas vendidas por sala
 */
router.get('/ventas-por-sala', async (req, res) => {
  try {
    const result = await client.query(
      `SELECT s.nombre AS sala, SUM(r.cantidad) AS total_entradas
       FROM reserva r
       JOIN funcion f ON r.funcion_id = f.funcion_id
       JOIN sala s ON f.sala_id = s.sala_id
       GROUP BY s.nombre
       ORDER BY total_entradas DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /consultas/funciones-por-fecha/{fecha}:
 *   get:
 *     summary: Obtener funciones por una fecha específica
 *     tags: [Consultas]
 *     parameters:
 *       - in: path
 *         name: fecha
 *         required: true
 *         description: Fecha en formato YYYY-MM-DD
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de funciones en la fecha dada
 */
router.get('/funciones-por-fecha/:fecha', async (req, res) => {
  const { fecha } = req.params;
  try {
    const result = await client.query(
      `SELECT f.funcion_id, p.titulo, s.nombre AS sala, f.fecha, f.hora
       FROM funcion f
       JOIN pelicula p ON f.pelicula_id = p.pelicula_id
       JOIN sala s ON f.sala_id = s.sala_id
       WHERE f.fecha::DATE = $1`, [fecha]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /consultas/reservas-por-pelicula:
 *   get:
 *     summary: Cantidad de reservas por película
 *     tags: [Consultas]
 *     responses:
 *       200:
 *         description: Lista de películas y su número de reservas
 */
router.get('/reservas-por-pelicula', async (req, res) => {
  try {
    const result = await client.query(
      `SELECT p.titulo, COUNT(r.reserva_id) AS total_reservas
       FROM reserva r
       JOIN funcion f ON r.funcion_id = f.funcion_id
       JOIN pelicula p ON f.pelicula_id = p.pelicula_id
       GROUP BY p.titulo
       ORDER BY total_reservas DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
