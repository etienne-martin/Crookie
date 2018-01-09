const helpers = require('../helpers.js');
const fetchJSON = helpers.fetchJSON;
const compareArrays = helpers.compareArrays;
const sendSlackMessage = helpers.sendSlackMessage;
const constructMessage = helpers.constructMessage;
const get = require('lodash/get');
const apiUrl = 'https://api.binance.com/api/v1/ticker/allPrices';
const exchange = 'Binance';
const interval = 10000;
const key = 'symbol';

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
      const mergedDiffs = [];

      // Skip if nothing changed
      if (diffs.length === 0) return console.log(`Nothing changed on ${exchange}.`);

      // Remove duplicates from the diff.
      for (let diff of diffs) {
        diff = diff.replace(new RegExp('BTC' + '$'), '');
        diff = diff.replace(new RegExp('ETH' + '$'), '');
        diff = diff.replace(new RegExp('BNB' + '$'), '');

        if (mergedDiffs.includes(diff) === false) mergedDiffs.push(diff);
      }

      const message = constructMessage(mergedDiffs, exchange, (currency) => {
        return 'https://www.binance.com/tradeDetail.html?symbol=' + currency + '_BTC';
      });

      // Send the slack notification
      if (await sendSlackMessage(message)) {
        console.log(`Slack notification sent successfully for ${exchange}:`, mergedDiffs);
        json = newJson;
      } else {
        console.log('An error occurred while sending a slack notification.');
      }
    }, interval);
  })();
};