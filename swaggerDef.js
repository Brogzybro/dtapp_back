module.exports = {
  openapi: '3.0.1',
  info: {
    // API informations (required)
    title: 'DTApp', // Title (required)
    version: '0.0.1', // Version (required)
    description: 'Digital Twin Application, unfinished.' // Description (optional)
  },
  apis: ['./routes/routes.js']
};
