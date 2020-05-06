require('dotenv').config();
const express = require('express');
const axios = require('axios');
const morgan = require('morgan');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(morgan('combined'));

app.get('/', (req, res) => {
	res.send(`Server up and running.`);
});

app.listen(PORT, () => {
	console.log(`App listening on PORT: ${PORT}`);
});