const helpers = require('../helpers.js');
const fetchJSON = helpers.fetchJSON;
const sendSlackMessage = helpers.sendSlackMessage;
const constructMessage = helpers.constructMessage;
const apiUrl = 'https://api.bitfinex.com/v1/symbols';
const exchange = 'Bitfinex';
const interval = 10000;

Array.prototype.diff = function(a) {
  return this.filter(function(i) {return a.indexOf(i) < 0;});
};

module.exports = () => {
  (async function(){
    const mergedDiffs = [];
    let json = await fetchJSON(apiUrl);

    if (Array.isArray(json) === false) {
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

      if (Array.isArray(newJson) === false) return console.log(`An error occurred while fetching data from ${exchange}.`);

      const diffs = newJson.diff(json);

      // Skip if nothing changed
      if (diffs.length === 0) return console.log(`Nothing changed on ${exchange}.`);

      // Remove duplicates from the diff.
      for (let diff of diffs) {
        diff = diff.replace(new RegExp('usd' + '$'), '');
        diff = diff.replace(new RegExp('btc' + '$'), '');
        diff = diff.replace(new RegExp('eur' + '$'), '');
        diff = diff.replace(new RegExp('eth' + '$'), '');
        diff = diff.toUpperCase();

        if (mergedDiffs.includes(diff) === false) mergedDiffs.push(diff);
      }

      const message = constructMessage(mergedDiffs, exchange, (currency) => {
        return 'https://www.bitfinex.com/t/' + currency + ':USD';
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