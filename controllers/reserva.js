const express = require('express');
const router = express.Router();
const client = require('../DB');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

/**
 * @swagger
 * tags:
 *   name: Reservas
 *   description: Endpoints para gestionar reservas de funciones
 */

// =================== GET reservas ===================
router.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM reserva ORDER BY reserva_id');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener reservas:', error);
    res.status(500).json({ message: 'Error al obtener reservas', error: error.message });
  }
});

// =================== POST reservas ===================
router.post('/', async (req, res) => {
  let { funcion_id, nombre_cliente, cantidad } = req.body;

  funcion_id = parseInt(funcion_id);
  cantidad = parseInt(cantidad);
  nombre_cliente = (nombre_cliente || '').trim();

  if (!Number.isInteger(funcion_id) || !nombre_cliente || !Number.isInteger(cantidad) || cantidad <= 0) {
    return res.status(400).json({ message: 'Datos inválidos para la reserva' });
  }

  try {
    const funcionResult = await client.query('SELECT * FROM funcion WHERE funcion_id = $1', [funcion_id]);
    if (funcionResult.rowCount === 0) {
      return res.status(404).json({ message: `Función ID ${funcion_id} no encontrada` });
    }

    const insertResult = await client.query(
      'INSERT INTO reserva (funcion_id, nombre_cliente, cantidad) VALUES ($1, $2, $3) RETURNING reserva_id',
      [funcion_id, nombre_cliente, cantidad]
    );
    const reserva_id = insertResult.rows[0].reserva_id;
    const funcion = funcionResult.rows[0];
    const fecha = new Date(funcion.fecha).toLocaleDateString('es-ES');

    const carpeta = path.join(__dirname, '..', 'archivos');
    if (!fs.existsSync(carpeta)) fs.mkdirSync(carpeta);

    const nombreBase = `reserva_${reserva_id}`;

    // PDF
    const pdfPath = path.join(carpeta, `${nombreBase}.pdf`);
    const pdfDoc = new PDFDocument();
    pdfDoc.pipe(fs.createWriteStream(pdfPath));

    pdfDoc.fontSize(20).text('🎟️ Reserva CineApp', { align: 'center' }).moveDown();
    pdfDoc.fontSize(12).text(`ID Reserva: ${reserva_id}`);
    pdfDoc.text(`Cliente: ${nombre_cliente}`);
    pdfDoc.text(`Función ID: ${funcion_id}`);
    pdfDoc.text(`Sala ID: ${funcion.sala_id}`);
    pdfDoc.text(`Fecha: ${fecha}`);
    pdfDoc.text(`Hora: ${funcion.hora}`);
    pdfDoc.text(`Entradas: ${cantidad}`);
    pdfDoc.end();

    // TXT
    const txtPath = path.join(carpeta, `${nombreBase}.txt`);
    const contenidoTXT = `
Reserva CineApp
------------------------
ID Reserva: ${reserva_id}
Cliente: ${nombre_cliente}
Función ID: ${funcion_id}
Sala ID: ${funcion.sala_id}
Fecha: ${fecha}
Hora: ${funcion.hora}
Entradas: ${cantidad}
`.trim();
    fs.writeFileSync(txtPath, contenidoTXT);

    // Excel
    const excelPath = path.join(carpeta, `${nombreBase}.xlsx`);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Reserva');

    sheet.columns = [
      { header: 'Campo', key: 'campo', width: 25 },
      { header: 'Valor', key: 'valor', width: 30 }
    ];

    sheet.addRows([
      { campo: 'ID Reserva', valor: reserva_id },
      { campo: 'Cliente', valor: nombre_cliente },
      { campo: 'Función ID', valor: funcion_id },
      { campo: 'Sala ID', valor: funcion.sala_id },
      { campo: 'Fecha', valor: fecha },
      { campo: 'Hora', valor: funcion.hora },
      { campo: 'Entradas', valor: cantidad }
    ]);

    await workbook.xlsx.writeFile(excelPath);

    res.status(201).json({ message: '✅ Reserva creada correctamente', reserva_id });

  } catch (error) {
    console.error('❌ Error al crear reserva:', error);
    res.status(500).json({ message: 'Error al crear reserva', error: error.message });
  }
});

// =================== PUT reservas/:id ===================
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { funcion_id, nombre_cliente, cantidad } = req.body;

  if (!Number.isInteger(id) || !funcion_id || !nombre_cliente || !cantidad) {
    return res.status(400).json({ message: 'Datos inválidos para actualización' });
  }

  try {
    const result = await client.query(
      'UPDATE reserva SET funcion_id=$1, nombre_cliente=$2, cantidad=$3 WHERE reserva_id=$4',
      [funcion_id, nombre_cliente.trim(), cantidad, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    res.json({ message: '✅ Reserva actualizada correctamente' });

  } catch (error) {
    console.error('❌ Error al actualizar reserva:', error);
    res.status(500).json({ message: 'Error al actualizar reserva', error: error.message });
  }
});

// =================== DELETE reservas/:id ===================
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const result = await client.query('DELETE FROM reserva WHERE reserva_id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    res.json({ message: '✅ Reserva eliminada correctamente' });

  } catch (error) {
    console.error('❌ Error al eliminar reserva:', error);
    res.status(500).json({ message: 'Error al eliminar reserva', error: error.message });
  }
});

module.exports = router;