const express = require('express');
const router = express.Router();
const client = require('../DB');

/**
 * @swagger
 * tags:
 *   name: Películas
 *   description: Endpoints para administrar películas
 */

/**
 * @swagger
 * /peliculas:
 *   get:
 *     summary: Obtener todas las películas
 *     tags: [Películas]
 *     responses:
 *       200:
 *         description: Lista de películas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM pelicula');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener películas', error: error.message });
  }
});

/**
 * @swagger
 * /peliculas:
 *   post:
 *     summary: Crear una nueva película
 *     tags: [Películas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - genero
 *               - duracion
 *             properties:
 *               titulo:
 *                 type: string
 *               genero:
 *                 type: string
 *               duracion:
 *                 type: integer
 *                 description: Duración en minutos
 *     responses:
 *       201:
 *         description: Película creada exitosamente
 *       500:
 *         description: Error al crear la película
 */
router.post('/', async (req, res) => {
  const { titulo, genero, duracion } = req.body;
  try {
    await client.query(
      'INSERT INTO pelicula (titulo, genero, duracion) VALUES ($1, $2, $3)',
      [titulo, genero, duracion]
    );
    res.status(201).json({ message: 'Película creada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear película', error: error.message });
  }
});

/**
 * @swagger
 * /peliculas/{id}:
 *   put:
 *     summary: Actualizar una película
 *     tags: [Películas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la película
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - genero
 *               - duracion
 *             properties:
 *               titulo:
 *                 type: string
 *               genero:
 *                 type: string
 *               duracion:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Película actualizada
 *       404:
 *         description: Película no encontrada
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, genero, duracion } = req.body;
  try {
    const result = await client.query(
      'UPDATE pelicula SET titulo=$1, genero=$2, duracion=$3 WHERE pelicula_id=$4',
      [titulo, genero, duracion, id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: 'Película no encontrada' });

    res.json({ message: 'Película actualizada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar película', error: error.message });
  }
});

/**
 * @swagger
 * /peliculas/{id}:
 *   delete:
 *     summary: Eliminar una película
 *     tags: [Películas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la película
 *     responses:
 *       200:
 *         description: Película eliminada
 *       404:
 *         description: Película no encontrada
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM pelicula WHERE pelicula_id = $1', [id]);
    if (result.rowCount === 0)
      return res.status(404).json({ message: 'Película no encontrada' });

    res.json({ message: 'Película eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar película', error: error.message });
  }
});

module.exports = router;
