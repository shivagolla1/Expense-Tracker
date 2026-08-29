const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static assets (HTML, CSS, JS)
app.use(express.static(__dirname));

// Fallback all routes to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Atelier Flow running on port ${PORT}`);
});
