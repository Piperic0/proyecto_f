const express = require('express');
const router = express.Router();
const client = require('../DB');

/**
 * @swagger
 * tags:
 *   name: Funciones
 *   description: Endpoints para administrar funciones de películas
 */

/**
 * @swagger
 * /funciones:
 *   get:
 *     summary: Obtener todas las funciones
 *     tags: [Funciones]
 *     responses:
 *       200:
 *         description: Lista de funciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM funcion');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener funciones', error: error.message });
  }
});

/**
 * @swagger
 * /funciones:
 *   post:
 *     summary: Crear una nueva función
 *     tags: [Funciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pelicula_id:
 *                 type: integer
 *               sala_id:
 *                 type: integer
 *               fecha:
 *                 type: string
 *                 format: date
 *               hora:
 *                 type: string
 *                 example: "18:30"
 *     responses:
 *       201:
 *         description: Función creada
 */
router.post('/', async (req, res) => {
  const { pelicula_id, sala_id, fecha, hora } = req.body;
  try {
    await client.query(
      'INSERT INTO funcion (pelicula_id, sala_id, fecha, hora) VALUES ($1, $2, $3, $4)',
      [pelicula_id, sala_id, fecha, hora]
    );
    res.status(201).json({ message: 'Función creada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear función', error: error.message });
  }
});

/**
 * @swagger
 * /funciones/{id}:
 *   put:
 *     summary: Actualizar una función
 *     tags: [Funciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la función
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pelicula_id:
 *                 type: integer
 *               sala_id:
 *                 type: integer
 *               fecha:
 *                 type: string
 *                 format: date
 *               hora:
 *                 type: string
 *                 example: "20:00"
 *     responses:
 *       200:
 *         description: Función actualizada
 *       404:
 *         description: Función no encontrada
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { pelicula_id, sala_id, fecha, hora } = req.body;
  try {
    const result = await client.query(
      'UPDATE funcion SET pelicula_id=$1, sala_id=$2, fecha=$3, hora=$4 WHERE funcion_id=$5',
      [pelicula_id, sala_id, fecha, hora, id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: 'Función no encontrada' });
    res.json({ message: 'Función actualizada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar función', error: error.message });
  }
});

/**
 * @swagger
 * /funciones/{id}:
 *   delete:
 *     summary: Eliminar una función
 *     tags: [Funciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la función a eliminar
 *     responses:
 *       200:
 *         description: Función eliminada
 *       404:
 *         description: Función no encontrada
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM funcion WHERE funcion_id = $1', [id]);
    if (result.rowCount === 0)
      return res.status(404).json({ message: 'Función no encontrada' });
    res.json({ message: 'Función eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar función', error: error.message });
  }
});

module.exports = router;
