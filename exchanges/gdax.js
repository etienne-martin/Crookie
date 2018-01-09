const helpers = require('../helpers.js');
const fetchJSON = helpers.fetchJSON;
const compareArrays = helpers.compareArrays;
const sendSlackMessage = helpers.sendSlackMessage;
const constructMessage = helpers.constructMessage;
const get = require('lodash/get');
const apiUrl = 'https://api.gdax.com/products';
const exchange = 'GDAX';
const interval = 10000;
const key = 'base_currency';

module.exports = () => {
  (async() => {
    let json = await fetchJSON(apiUrl);

    if (!get(json, '[0].' + key)) {
      setTimeout(arguments.callee, interval);

      return console.log(`An error occurred while fetching data from ${exchange}. Trying again in 10s.`);
    }

    // json.pop();
    // json.pop();
    // json.pop();
    // json.pop();
    // json.pop();

    setInterval(async () => {
      const newJson = await fetchJSON(apiUrl);

      if (!get(newJson, '[0].' + key)) return console.log(`An error occurred while fetching data from ${exchange}.`);

      const diffs = compareArrays(json, newJson, key);

      // Skip if nothing changed
      if (diffs.length === 0) return console.log(`Nothing changed on ${exchange}.`);

      const message = constructMessage(diffs, exchange, (currency) => {
        return 'https://www.gdax.com/trade/' + currency + '-USD';
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