const express = require('express');
const router = express.Router();
const client = require('../DB');

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Endpoints para registro y autenticación de usuarios
 */

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtener todos los usuarios (sin contraseñas)
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios registrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *                   correo:
 *                     type: string
 *                   rol:
 *                     type: string
 */
router.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT id, nombre, correo, rol FROM usuarios ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
});

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - correo
 *               - contraseña
 *               - rol
 *             properties:
 *               nombre:
 *                 type: string
 *               correo:
 *                 type: string
 *               contraseña:
 *                 type: string
 *               rol:
 *                 type: string
 *                 example: cliente
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       500:
 *         description: Error al crear usuario
 */
router.post('/', async (req, res) => {
  const { nombre, correo, contraseña, rol } = req.body;
  if (!nombre || !correo || !contraseña || !rol) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    await client.query(
      'INSERT INTO usuarios (nombre, correo, contraseña, rol) VALUES ($1, $2, $3, $4)',
      [nombre, correo, contraseña, rol]
    );
    res.status(201).json({ message: 'Usuario creado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear usuario', error: error.message });
  }
});

/**
 * @swagger
 * /usuarios/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - contraseña
 *             properties:
 *               correo:
 *                 type: string
 *               contraseña:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error interno
 */
router.post('/login', async (req, res) => {
  const { correo, contraseña } = req.body;
  if (!correo || !contraseña) {
    return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
  }

  try {
    const result = await client.query(
      'SELECT id, nombre, correo, rol FROM usuarios WHERE correo = $1 AND contraseña = $2',
      [correo, contraseña]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    res.json({
      message: 'Inicio de sesión exitoso',
      usuario: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
});

module.exports = router;
