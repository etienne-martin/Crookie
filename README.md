# Crookie
A slack bot that sends notifications whenever new crypto is added to Binance, Bithumb, Bitfinex, Bittrex, Polonyx, Bitstamp, GDAX, Huobi, Coinone and Hitbtc.

## Usage

1. Go on https://api.slack.com/apps and create a new slack app.
2. In the "Add features and functionality" dropdown, click on "Incoming Webhooks" and turn that feature ON.
3. Click on "Add New Webhook to Workspace" and select the channel where you want your notifications to be delivered.
4. Scroll down, copy the Webhook URL in your clipboard and keep it for later.
5. Create a `config.json` file in the root of the project and paste your webhook URL.

```json
{
  "webhookUrl": "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
}
```

6. Run `npm install` to install the dependencies.

7. Run the server with the following command: `node index.js`.
