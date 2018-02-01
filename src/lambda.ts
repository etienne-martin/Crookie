import * as isEmpty from 'lodash/isEmpty';
import * as map from 'lodash/map';
import * as reduce from 'lodash/reduce';
import * as redis from 'redis';
import config from './config';
import binance from './exchanges/binance';
import gdax from './exchanges/gdax';
import kucoin from './exchanges/kucoin';

interface ITarget {
  name: string;
  fetch: (latestData: any[]) => Promise<string[]>;
}

interface IData {
  name: string;
  data: any[];
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

async function getData(latestData: any): Promise<any> {
  // TODO: Add a setTimeout to cancel a request if any exchanges isn't responding (use axios?)
  // So we can get results from other responding exchanges and only skip the exchanges that are unresponsive
  // TODO: Handle exchange fetch errors
  const promises: Array<Promise<IData>> = map(targets, async ({ fetch, name }) => {
    const data: string[] = await fetch(latestData ? latestData[name] : null);
    return { data, name };
  });

  const exchangesData: IData[] = await Promise.all(promises);
  return reduce(exchangesData, (res, item) => {
    res[item.name] = item.data;
    return res;
  }, {});
}

function saveData(client: redis.RedisClient, key: string, data: any): Promise<void> {
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

    const latestData: any = await getLatestData(client);
    const data: any = await getData(latestData);
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
