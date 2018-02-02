# Crookie
A slack bot that sends notifications whenever new cryptocurrency is added to Binance, Bithumb, Bitfinex, Bittrex, Polonyx, Bitstamp, GDAX, Huobi, Coinone and Hitbtc.

## Usage

1. Go on https://api.slack.com/apps and create a new slack app.
2. In the "Add features and functionality" dropdown, click on "Incoming Webhooks" and turn that feature ON.
3. Click on "Add New Webhook to Workspace" and select the channel where you want your notifications to be delivered.
4. Scroll down, copy the Webhook URL in your clipboard and keep it for step 5.
5. Rename the `.env-template` file to `.env` and paste the Webhook URL there (ie: `SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...`)

6. Make sure you have node > 6 installed. We suggest using [NVM](https://github.com/creationix/nvm) ([nvmw](https://github.com/coreybutler/nvm-windows) if you're on windows), to install and use the correct npm/node version using: `nvm install 6.10 && nvm use`

7. Run `npm install` to install the dependencies.

8. Build the project: `npm run build`

9. Run the server with the following command: `npm run serve`.

## Usage with aws lambdas/elasticache

1. Create a vpc 
2. Create a redis instance on elasticache
3. Create a role that has access to the vpc
4. Create a lambda, set `lambda.handler` as the handler, select node 6.10 for the engine and set the SLACK_WEBHOOK_URL and REDIS_URL variable environment.
5. Assign the correct role and vpc you just created in the lambda configuration
6. Follow this [blog post](https://medium.com/@philippholly/aws-lambda-enable-outgoing-internet-access-within-vpc-8dd250e11e12) to give your lambda access to internet
7. Create a CloudWatch events rule to run your lambda like a cron job
8. `npm run build-lambda` and upload lambda.zip on your lambda

## Tests

You can run the test suite to make sure that everything is working correctly with
`npm test`

## Built with

* [node.js](https://github.com/moment/moment) - Node.js is an open-source, cross-platform JavaScript run-time environment for executing JavaScript code server-side.
* [slack](https://api.slack.com/apps) - Slack is a cloud-based set of proprietary team collaboration tools and services.
* [love](https://en.wikipedia.org/wiki/Love) - Love encompasses a variety of different emotional and mental states, typically strongly and positively experienced, ranging from the deepest interpersonal affection to the simplest pleasure.


## Contributing

When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.

Update the [README.md](https://github.com/etienne-martin/crookie/blob/master/README.md) with details of changes to the library.

Build the project and test all the features before submitting your pull request.

## Authors

* **Etienne Martin** - *Initial work* - [etiennemartin.ca](http://etiennemartin.ca/)  
XRB/Nano: `xrb_3dmrpbcii5d1mi31u8bep317giq7oyp9jmoihuyizb1ynrhqcod6hxwdprnf`  
ETH: `0xe17dc88be6e10ef5c0fdef74fa6388e7f4213b70`
* **Alex Beauchemin** - *Improvements* - [@AlexBeauchemin](https://github.com/AlexBeauchemin)  
XRB/Nano: `xrb_14z4m3rpphhbobns4dmt7coqoqoid7h7kp9ejqargontp557jd3a4b43z7oo`  
ETH: `0x6a25a9566bf6c2D731ab3b1E3CD0B4D1205D5794`
 

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/etienne-martin/crookie/blob/master/LICENSE) file for details.
