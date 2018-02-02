import * as isEmpty from 'lodash/isEmpty';
import * as map from 'lodash/map';
import * as reduce from 'lodash/reduce';
import * as redis from 'redis';
import config from './config';
import binance from './exchanges/binance';
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
  gdax: string[];
  kucoin: string[];
}

const KEY: string = 'exchanges';
const targets: ITarget[] = [
  { name: 'binance', fetch: binance.fetchData },
  { name: 'gdax', fetch: gdax.fetchData },
  { name: 'kucoin', fetch: kucoin.fetchData }
];

function createRedisClient(): redis.RedisClient {
  const redisOptions: redis.ClientOpts = {
    host: config.get('redisUrl'),
    port: 6379,
    connect_timeout: 1000
  };

  return redis.createClient(redisOptions);
}

async function getLatestData(client: redis.RedisClient): Promise<any> {
  return new Promise((resolve, reject) => {
    client.get(KEY, (err, res) => {
      if (err) reject(err);
      const data: any = isEmpty(res) ? null : JSON.parse(res);
      resolve(data);
    });
  });
}

// Cancel a call after x seconds to make sure we still get data from the lambda even if one exchange isn't responding
function cancelableFetch(fetch: FetchData, latestData: string[], timeout = 3000): Promise<string[]> {
  return new Promise(async (resolve, reject) => {
    const cancelTimeout = setTimeout(() => {
      reject(new Error('Fetch timed out'));
    }, timeout);

    try {
      const data: string[] = await fetch(latestData);
      clearTimeout(cancelTimeout);
      resolve(data);
    } catch (err) {
      clearTimeout(timeout);
      reject(err);
    }
  });

}

async function getData(latestData: IData): Promise<IData> {
  const promises: Array<Promise<IItem>> = map(targets, async ({ fetch, name }) => {
    let data: string[] = null;

    try {
      data = await cancelableFetch(fetch, latestData ? latestData[name] : null);
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

function saveData(client: redis.RedisClient, key: string, data: IData): Promise<void> {
  return new Promise((resolve, reject) => {
    client.set(key, JSON.stringify(data), (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export default async function init(callback, defaultClient?: redis.RedisClient): Promise<void> {
  let client: redis.RedisClient = defaultClient;

  try {
    if (!client) client = createRedisClient();

    client.on('error', (err) => {
      client.quit();
      callback(err);
    });

    const latestData: IData = await getLatestData(client);
    const data: IData = await getData(latestData);
    await saveData(client, KEY, data);

    client.quit();
    callback(null, data);
  } catch (err) {
    callback(err);
    if (client) client.quit();
  }
}

// @ts-ignore
exports.handler = async function lambda(event, context, callback) {
  init((err) => {
    if (err) callback(null, err.message);
    callback(null, 'Done.');
  });
};
