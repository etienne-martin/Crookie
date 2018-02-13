import * as map from 'lodash/map';
import * as reduce from 'lodash/reduce';
import binance from './exchanges/binance';
import bitfinex from './exchanges/bitfinex';
import gdax from './exchanges/gdax';
import kucoin from './exchanges/kucoin';
import { FetchData } from './helpers';

interface ITarget {
  name: string;
  fetch: FetchData;
}

interface IItem {
  name: string;
  data: string[];
}

interface IData {
  binance: string[];
  bitfinex: string[];
  gdax: string[];
  kucoin: string[];
}

let latestData: IData = null;
const targets: ITarget[] = [
  { name: 'binance', fetch: binance.fetchData },
  { name: 'bitfinex', fetch: bitfinex.fetchData },
  { name: 'gdax', fetch: gdax.fetchData },
  { name: 'kucoin', fetch: kucoin.fetchData }
];

// Cancel a call after x seconds to make sure we still get data from the lambda even if one exchange isn't responding
function cancelableFetch(fetch: FetchData, name: string, timeout = 3000): Promise<string[]> {
  return new Promise(async (resolve, reject) => {
    const cancelTimeout = setTimeout(() => {
      reject(new Error('Fetch timed out for ' + name));
    }, timeout);

    try {
      const data: string[] = await fetch(latestData ? latestData[name] : null);
      clearTimeout(cancelTimeout);
      resolve(data);
    } catch (err) {
      clearTimeout(timeout);
      reject(err);
    }
  });

}

async function getData(): Promise<IData> {
  const promises: Array<Promise<IItem>> = map(targets, async ({ fetch, name }) => {
    let data: string[] = null;

    try {
      data = await cancelableFetch(fetch, name);
    } catch (err) {
      console.error(err);
    }

    return { data, name };
  });

  const exchangesData: IItem[] = await Promise.all(promises);
  return reduce(exchangesData, (res, item) => {
    res[item.name] = item.data;
    return res;
  }, {});
}

export default async function init(callback): Promise<void> {
  try {
    const data: IData = await getData();
    latestData = data;
    callback(null, data);
  } catch (err) {
    callback(err);
  }
}

// @ts-ignore
exports.handler = async function lambda(event, context, callback) {
  // do not wait until the even loop is empty before freezing the process
  // https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
  context.callbackWaitsForEmptyEventLoop = false;

  init((err) => {
    if (err) callback(null, err.message);
    callback(null, 'Done.');
  });
};
