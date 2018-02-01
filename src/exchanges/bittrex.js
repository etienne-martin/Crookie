const helpers = require('../helpers.js');
const fetchJSON = helpers.fetchJSON;
const compareArrays = helpers.compareArrays;
const sendSlackMessage = helpers.sendSlackMessage;
const constructMessage = helpers.constructMessage;
const apiUrl = 'https://bittrex.com/api/v1.1/public/getmarkets';
const exchange = 'Bittrex';
const interval = 10000;

module.exports = () => {
  (async function(){
    let json = (await fetchJSON(apiUrl)).result;

    if (!json) {
      setTimeout(arguments.callee, interval);

      return console.log(`An error occurred while fetching data from ${exchange}. Trying again in 10s.`);
    }

    // json.pop();
    // json.pop();
    // json.pop();
    // json.pop();
    // json.pop();

    setInterval(async () => {
      const newJson = (await fetchJSON(apiUrl)).result;

      if (!newJson) return console.log(`An error occurred while fetching data from ${exchange}.`);

      let diffs = compareArrays(json, newJson, 'MarketCurrency');

      // Skip if nothing changed
      if (diffs.length === 0) return console.log(`Nothing changed on ${exchange}.`);

      const message = constructMessage(diffs, exchange, (currency) => {
        return 'https://bittrex.com/Market/Index?MarketName=BTC-' + currency;
      });

      // Send the slack notification
      if (await sendSlackMessage(message)) {
        console.log(`Slack notification sent successfully for ${exchange}:`, diffs);
        json = newJson;
      } else {
        console.log('An error occurred while sending a slack notification.');
      }
    }, interval);
  })();
};