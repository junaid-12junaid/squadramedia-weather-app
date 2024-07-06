
const express = require('express');
const weatherRoutes = require('./routes/weatherRoutes');
require('dotenv').config();

const app = express();

app.use('/api', weatherRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/api/graphql`);
});
