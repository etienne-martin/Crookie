const helpers = require('../helpers.js');
const fetchJSON = helpers.fetchJSON;
const compareObject = helpers.compareObject;
const sendSlackMessage = helpers.sendSlackMessage;
const constructMessage = helpers.constructMessage;
const apiUrl = 'https://api.bithumb.com/public/ticker/ALL';
const exchange = 'Bithumb';
const interval = 10000;

module.exports = () => {
  (async function(){
    let json = (await fetchJSON(apiUrl)).data;

    if (!json) {
      setTimeout(arguments.callee, interval);

      return console.log(`An error occurred while fetching data from ${exchange}. Trying again in 10s.`);
    }

    // delete json.DASH;

    setInterval(async () => {
      const newJson = (await fetchJSON(apiUrl)).data;

      if (!newJson) return console.log(`An error occurred while fetching data from ${exchange}.`);

      const diffs = compareObject(json, newJson);

      // Skip if nothing changed
      if (diffs.length === 0) return console.log(`Nothing changed on ${exchange}.`);

      const message = constructMessage(diffs, exchange, (currency) => {
        return 'https://www.bithumb.com/trade/order/' + currency;
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