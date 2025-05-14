const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API CineApp',
      version: '1.0.0',
      description: 'Documentación interactiva de la API del sistema de reservas de cine',
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Servidor local',
      },
    ],
  },
  apis: ['./controllers/*.js', './consultas/*.js'], // Archivos donde están tus rutas
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
