const helpers = require('../helpers.js');
const fetchJSON = helpers.fetchJSON;
const compareArrays = helpers.compareArrays;
const sendSlackMessage = helpers.sendSlackMessage;
const constructMessage = helpers.constructMessage;
const get = require('lodash/get');
const apiUrl = 'https://www.bitstamp.net/api/v2/trading-pairs-info/';
const exchange = 'Bitstamp';
const interval = 10000;
const key = 'name';

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
        diff = diff.replace(new RegExp('/USD' + '$'), '');
        diff = diff.replace(new RegExp('/EUR' + '$'), '');
        diff = diff.replace(new RegExp('/BTC' + '$'), '');

        if (mergedDiffs.includes(diff) === false) mergedDiffs.push(diff);
      }

      const message = constructMessage(mergedDiffs, exchange, () => {
        return 'https://www.bitstamp.net/market/tradeview/';
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