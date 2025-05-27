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
 *                 properties:
 *                   pelicula_id:
 *                     type: integer
 *                   titulo:
 *                     type: string
 *                   genero:
 *                     type: string
 *                   duracion:
 *                     type: integer
 *                   imagen:
 *                     type: string
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
 *               imagen:
 *                 type: string
 *                 description: URL de la imagen (opcional)
 *     responses:
 *       201:
 *         description: Película creada exitosamente
 *       500:
 *         description: Error al crear la película
 */
router.post('/', async (req, res) => {
  const { titulo, genero, duracion, imagen } = req.body;

  // Validación básica de campos requeridos
  if (!titulo || !genero || !duracion) {
    return res.status(400).json({ message: 'Faltan campos requeridos: titulo, genero o duracion' });
  }

  try {
    await client.query(
      'INSERT INTO pelicula (titulo, genero, duracion, imagen) VALUES ($1, $2, $3, $4)',
      [titulo, genero, duracion, imagen || null]
    );
    res.status(201).json({ message: 'Película creada exitosamente' });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear película',
      error: error.message
    });
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
 *               imagen:
 *                 type: string
 *     responses:
 *       200:
 *         description: Película actualizada
 *       404:
 *         description: Película no encontrada
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, genero, duracion, imagen } = req.body;
  try {
    const result = await client.query(
      'UPDATE pelicula SET titulo=$1, genero=$2, duracion=$3, imagen=$4 WHERE pelicula_id=$5',
      [titulo, genero, duracion, imagen || null, id]
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
