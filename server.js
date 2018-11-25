const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Routes
const login = require('./routes/login');
const members = require('./routes/members');

const PORT = 5001;
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api', login);
app.use('/api', members);

app.listen(PORT, () => {
  console.log('# Server running on http://localhost:' + PORT);
});