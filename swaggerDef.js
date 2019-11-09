module.exports = {
  openapi: '3.0.0',
  info: {
    // API informations (required)
    title: 'Hello World', // Title (required)
    version: '1.0.0', // Version (required)
    description: 'A sample API' // Description (optional)
  },
  apis: ['./routes/routes.js']
};
