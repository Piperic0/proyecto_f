const express = require('express');
const router = express.Router();
const client = require('../DB');

/**
 * @swagger
 * tags:
 *   name: Salas
 *   description: Endpoints para administrar salas de cine
 */

/**
 * @swagger
 * /salas:
 *   get:
 *     summary: Obtener todas las salas
 *     tags: [Salas]
 *     responses:
 *       200:
 *         description: Lista de salas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM sala');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener salas', error: error.message });
  }
});

/**
 * @swagger
 * /salas:
 *   post:
 *     summary: Crear una nueva sala
 *     tags: [Salas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - capacidad
 *             properties:
 *               nombre:
 *                 type: string
 *               capacidad:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Sala creada
 */
router.post('/', async (req, res) => {
  const { nombre, capacidad } = req.body;
  try {
    await client.query(
      'INSERT INTO sala (nombre, capacidad) VALUES ($1, $2)',
      [nombre, capacidad]
    );
    res.status(201).json({ message: 'Sala creada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear sala', error: error.message });
  }
});

/**
 * @swagger
 * /salas/{id}:
 *   put:
 *     summary: Actualizar una sala
 *     tags: [Salas]
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID de la sala
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - capacidad
 *             properties:
 *               nombre:
 *                 type: string
 *               capacidad:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Sala actualizada
 *       404:
 *         description: Sala no encontrada
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, capacidad } = req.body;
  try {
    const result = await client.query(
      'UPDATE sala SET nombre=$1, capacidad=$2 WHERE sala_id=$3',
      [nombre, capacidad, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Sala no encontrada' });
    }
    res.json({ message: 'Sala actualizada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar sala', error: error.message });
  }
});

/**
 * @swagger
 * /salas/{id}:
 *   delete:
 *     summary: Eliminar una sala
 *     tags: [Salas]
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID de la sala a eliminar
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sala eliminada
 *       404:
 *         description: Sala no encontrada
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM sala WHERE sala_id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Sala no encontrada' });
    }
    res.json({ message: 'Sala eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar sala', error: error.message });
  }
});

module.exports = router;
