const express = require('express');
const router = express.Router();
const client = require('../DB');

/**
 * @swagger
 * tags:
 *   name: Reservas
 *   description: Endpoints para gestionar reservas de funciones
 */

/**
 * @swagger
 * /reservas:
 *   get:
 *     summary: Obtener todas las reservas
 *     tags: [Reservas]
 *     responses:
 *       200:
 *         description: Lista de reservas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM reserva ORDER BY reserva_id');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener reservas:', error);
    res.status(500).json({ message: 'Error al obtener reservas', error: error.message });
  }
});

/**
 * @swagger
 * /reservas:
 *   post:
 *     summary: Crear una nueva reserva
 *     tags: [Reservas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - funcion_id
 *               - nombre_cliente
 *               - cantidad
 *             properties:
 *               funcion_id:
 *                 type: integer
 *               nombre_cliente:
 *                 type: string
 *               cantidad:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Reserva creada correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Función no encontrada
 */
router.post('/', async (req, res) => {
  let { funcion_id, nombre_cliente, cantidad } = req.body;

  funcion_id = parseInt(funcion_id);
  cantidad = parseInt(cantidad);

  if (!Number.isInteger(funcion_id) || !nombre_cliente || !Number.isInteger(cantidad) || cantidad <= 0) {
    return res.status(400).json({ message: '❌ Datos inválidos para la reserva' });
  }

  try {
    const validFunction = await client.query('SELECT funcion_id FROM funcion WHERE funcion_id = $1', [funcion_id]);
    if (validFunction.rows.length === 0) {
      return res.status(404).json({ message: `❌ No existe una función con ID ${funcion_id}` });
    }

    await client.query(
      'INSERT INTO reserva (funcion_id, nombre_cliente, cantidad) VALUES ($1, $2, $3)',
      [funcion_id, nombre_cliente, cantidad]
    );

    res.status(201).json({ message: '✅ Reserva creada correctamente' });

  } catch (error) {
    console.error('❌ Error al crear reserva:', error);
    res.status(500).json({ message: 'Error al crear reserva', error: error.message });
  }
});

/**
 * @swagger
 * /reservas/{id}:
 *   put:
 *     summary: Actualizar una reserva
 *     tags: [Reservas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la reserva a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               funcion_id:
 *                 type: integer
 *               nombre_cliente:
 *                 type: string
 *               cantidad:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Reserva actualizada
 *       404:
 *         description: Reserva no encontrada
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { funcion_id, nombre_cliente, cantidad } = req.body;

  try {
    const result = await client.query(
      'UPDATE reserva SET funcion_id=$1, nombre_cliente=$2, cantidad=$3 WHERE reserva_id=$4',
      [funcion_id, nombre_cliente, cantidad, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: '❌ Reserva no encontrada' });
    }

    res.json({ message: '✅ Reserva actualizada' });

  } catch (error) {
    console.error('❌ Error al actualizar reserva:', error);
    res.status(500).json({ message: 'Error al actualizar reserva', error: error.message });
  }
});

/**
 * @swagger
 * /reservas/{id}:
 *   delete:
 *     summary: Eliminar una reserva
 *     tags: [Reservas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la reserva a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reserva eliminada
 *       404:
 *         description: Reserva no encontrada
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await client.query('DELETE FROM reserva WHERE reserva_id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: '❌ Reserva no encontrada' });
    }

    res.json({ message: '✅ Reserva eliminada' });

  } catch (error) {
    console.error('❌ Error al eliminar reserva:', error);
    res.status(500).json({ message: 'Error al eliminar reserva', error: error.message });
  }
});

module.exports = router;
