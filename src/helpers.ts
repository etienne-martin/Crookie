import * as clone from 'lodash/clone';
import * as isEmpty from 'lodash/isEmpty';
import * as pullAll from 'lodash/pullAll';
import * as uniq from 'lodash/uniq';
import * as rp from 'request-promise';
import config from './config';

export type UrlConstructor = (currency: string) => string;
export type FetchData = (latestData: string[]) => Promise<string[]>;

function constructMessage(diffs: string[], exchange: string, urlConstructor: UrlConstructor): string {
  const messages: string[] = [];
  const exclamations: string[] = [
    'Yay!',
    'Yeah!',
    'Hurrah!',
    'Wee!',
    'Whoa!',
    'Yee-haw!',
    'Woot woot!'
  ];

  // Add the title
  if (diffs.length === 1) {
    messages.push('>*' + randomItem(exclamations) + ' There\'s a new crypto recruit on ' + exchange + '*');
  } else {
    messages.push('>*' + randomItem(exclamations) + ' There are new crypto recruits on ' + exchange + '*');
  }

  // Add a line for each new currencies
  for (const diff of diffs) {
    messages.push('>`' + diff.toUpperCase() + '`: ' + urlConstructor(diff));
  }

  return messages.join('\n');
}

export function fetchJSON(uri) {
  const options = {
    uri,
    json: true,
    headers: {
      'User-Agent': 'Crookie' // We must pass a User-Agent when querying GDAX
    }
  };
  return rp(options);
}

function getDiff(newData: string[], latestData: string[]): string[] {
  const diff: string[] = clone(newData); // need to clone as pullAll mutate the array
  pullAll(diff, latestData);
  return diff;
}

export async function handleNewCryptos(exchange, data: string[], latestData: string[], urlConstructor: UrlConstructor): Promise<string[]> {
  if (isEmpty(latestData)) return data;

  const diffs: string[] = getDiff(data, latestData);
  const message: string = constructMessage(diffs, exchange, urlConstructor);

  if (isEmpty(diffs)) {
    console.log(`Nothing changed on ${exchange}.`);
    return;
  }

  await sendSlackMessage(message);
  console.log(`Slack notification sent successfully for ${exchange}:`, diffs);

  return uniq(data.concat(latestData));
}

export function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function stripFromEnd(string: string, tokensToRemove: string[]) {
  for (const token of tokensToRemove) {
    if (string.endsWith(token)) {
      return string.replace(new RegExp(token + '$'), '');
    }
  }

  return string;
}

async function sendSlackMessage(message) {
  const url = config.get('webhookUrl');
  const options = {
    method: 'POST',
    uri: url,
    body: { text: message },
    json: true
  };

  if (config.env === 'test') {
    return console.log(message);
  }

  try {
    const response = await rp(options);
    return response === 'ok';
  } catch (err) {
    console.error(err);
  }
}

export async function run(fetchData: FetchData, interval: number = 1000 * 10): Promise<void> {
  try {
    let cryptos: string[] = await fetchData(null);
    let latestData: string[] = cryptos;

    // Test that errthing's working fine.
    // latestData.pop();

    setInterval(async () => {
      cryptos = await fetchData(latestData);
      latestData = cryptos;
    }, interval);
  } catch (err) {
    console.error(err);
  }
}
