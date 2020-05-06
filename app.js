require('dotenv').config();
const fs = require('fs');
const express = require('express');
const axios = require('axios');
const morgan = require('morgan');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(morgan('combined', {
	stream: fs.createWriteStream('server.log', { flags: 'a' })
}));

let productUrl = 'https://www.costco.com/nintendo-switch-bundle-with-12-month-online-family-plan-and-case.product.100519747.html';
const testUrl = 'https://www.costco.com/springfield-club-chair.product.11659957.html'; // product that was in stock at time of testing, for testing purposes.
const inStockString = '<img class="oos-overlay hide" src="/wcsstore/CostcoGLOBALSAS/images/OOS-overlay-en.png" alt="Out of Stock" title="Out of Stock"/>'; // a string only found on the page when it IS in stock

app.get('/', (req, res) => {
	let html = '<p>App up and running, go ';
	html += '<a href="/checkcostco">here</a>'
	html += ' to run <strong>Costco Switch Checker</strong>.'
	res.send(html);
});

app.get('/checkcostco/:test?', (req, res) => {
	if (req.params.test) {
		console.log(`Running test request against product that should be in stock.`);
		productUrl = testUrl;
	}

	axios.get(productUrl)
		.then((response) => {
			console.log(`Request happened sucessfully to ${productUrl}`);
			// console.log(Object.keys(response));

			const now = new Date();

			response.data.includes(inStockString) ?
				res.send('Looks like the Nintendo Switch is back in stock!') :
				res.send(`Alas, still out of stock :( @ ${now.toLocaleString()}`);

			fs.writeFile('costco-response.html', response.data, function (err) {
				if (err) { throw err }

				console.log('Response from Costco website written to costco-response.html file.');
			});
		}).catch((err) => {
			console.error(`Uh-oh, looks like there was an error. Message: ${err}`);
		});

	// lol instant 403 response when I ran this
	// const makeRequest = () => {
	// 	axios.get(`http://localhost:${PORT}/checkcostco`)
	// 		.then((response) => {
	// 			console.log('Request itself');
	// 		})
	// 		.catch((err) => {
	// 			console.log(`Didn't like that! Error: ${err}`);
	// 		});
	// };

	// setInterval(makeRequest, 5000);


});

app.listen(PORT, () => {
	console.log(`App listening on PORT: ${PORT}`);
});