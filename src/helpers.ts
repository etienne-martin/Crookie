import * as get from 'lodash/get';
import * as rp from 'request-promise';
import config from './config';

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

export function compareArrays(arr1, arr2, key) {
  const diff = [];

  for (const index in arr2) {
    const value1 = get(arr1[index], key);
    const value2 = get(arr2[index], key);

    if (value1 !== value2 && value2) diff.push(value2);
  }

  return removeDuplicatesFromArray(diff);
}

export function compareObject(obj1, obj2) {
  const diff = [];

  for (const property in obj2) {
    if (obj1.hasOwnProperty(property) === false) {
      diff.push(property);
    }
  }

  return removeDuplicatesFromArray(diff);
}

export async function sendSlackMessage(message) {
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

export function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function removeDuplicatesFromArray(array) {
  return array.filter((item, pos) => {
    return array.indexOf(item) === pos;
  });
}

export function constructMessage(diffs: string[], exchange: string, urlConstructor: any): string {
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
