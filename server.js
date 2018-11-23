const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = 5001;
const api = require('./routes/api');
const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use('/api', api);

app.listen(PORT, () => {
  console.log('# Server running on http://localhost:' + PORT);
});