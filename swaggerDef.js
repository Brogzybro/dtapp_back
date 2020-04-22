module.exports = {
  openapi: '3.0.1',
  info: {
    // API informations (required)
    title: 'Digital Twin for Health Data', // Title (required)
    version: '1.0.0', // Version (required)
    description:
      'Welcome to the Digital Twin API. This API can be used to manage users, create connections to new services like Fitbit and WIthings, retrieve samples and devices saved for a user and those shared with them.' // Description (optional)
  },
  apis: ['./routes/routes.js']
};
