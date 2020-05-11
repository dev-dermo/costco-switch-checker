require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const chalk = require('chalk');
const player = require('play-sound')(opts = {});

let productUrl;
let intervalTime;

// product that was in stock at time of testing, for testing purposes.
const testUrl = 'https://www.costco.com/kirkland-signature-coffee-breakfast-blend-recyclable-k-cup-pods%2c-120-count.product.100499603.html'; 
const safeTest = 'http://diarmuidmurphy.com/'
const inStockString = '<img class="oos-overlay hide" src="/wcsstore/CostcoGLOBALSAS/images/OOS-overlay-en.png" alt="Out of Stock" title="Out of Stock"/>'; // a string only found on the page when it IS in stock

switch (process.argv[2]) {
	case 'sanity':
		productUrl = testUrl; // product that was in stock at time of testing, for testing purposes.
		intervalTime = 10000;
		console.log(chalk.gray.bgYellow(`About to run a sanity check.`));
		break;
	case 'test':
		productUrl = safeTest;
		intervalTime = 2500;
		console.log(chalk.gray.bgYellow(`About to run a generic test ${safeTest}.`));
		break;
	case 'run':
		productUrl = 'https://www.costco.com/nintendo-switch-bundle-with-12-month-online-family-plan-and-case.product.100519747.html';
		intervalTime = 30*60*1000;
		break;
	default:
		return console.log('Invalid operation argument.');
}

const repeatedRequest = () => {
	axios.get(productUrl)
		.then((response) => {
			// console.log(`Requested ${productUrl} sucessfully.`);
			player.play('juntos.mp3', (err) => {
				if (err) { console.log(`Notification sound did not play.`) } 

				fs.writeFile('costco-response.html', response.data, (err) => { if (err) { throw err } });

				const now = new Date();
	
				if (response.data.includes(inStockString)) {
					const msg = `Looks like the Nintendo Switch is back in stock! @ ${now}`;
					console.log(chalk.gray.bgGreen(msg));
					fs.appendFile('app.log', msg, (err) => { if (err) throw err; });
				} else {
					const msg = `Alas, still out of stock :( @ ${now.toLocaleString()}`;
					console.log(chalk.bgRed(msg));
					fs.appendFile('app.log', msg, (err) => { if (err) throw err; });
				}
	
				const nextScheduled = new Date(now.getTime() + 30*60*1000);
	
				console.log(`Next check scheduled for ${nextScheduled}`);
				console.log('\r\n--------------------------------------------------------------------\r\n');
			});
		}).catch((err) => {
			console.error(`Uh-oh, looks like there was an error. Message: ${err}`);
		});
};
repeatedRequest();
setInterval(repeatedRequest, intervalTime);
