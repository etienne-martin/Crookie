import * as clone from 'lodash/clone';
import * as isEmpty from 'lodash/isEmpty';
import * as pullAll from 'lodash/pullAll';
import * as reduce from 'lodash/reduce';
import * as uniq from 'lodash/uniq';
import { constructMessage, fetchJSON, sendSlackMessage } from '../helpers';

const API_URL = 'https://kitchen-4.kucoin.com/v1/market/open/symbols?market=&c=&lang=en_US';
const EXCHANGE = 'Kucoin';
const INTERVAL = 10000;

export interface IApiResponse {
  success: boolean;
  code: string;
  msg: string;
  timestamp: number;
  data: IData[];
}

export interface IData {
  coinType: string;
  trading: boolean;
  symbol: string;
  lastDealPrice: number;
  buy: number;
  sell: number;
  change: number;
  coinTypePair: string;
  sort: number;
  feeRate: number;
  volValue: number;
  high: number;
  datetime: number;
  vol: number;
  low: number;
  changeRate: number;
}

export interface IResponse {
  data: string[];
  diffs: string[];
}

function getDiff(newData: string[], latestData: string[]): string[] {
  const diff: string[] = clone(newData); // need to close as pullAll mutate the array
  pullAll(diff, latestData);
  return diff;
}

function handleData(data: IData[]): string[] {
  const list: string[] = reduce(data, (sum: string[], item: IData) => {
    const pair: string[] = item.symbol.split('-');
    return sum.concat(pair);
  }, []);

  return uniq(list);
}

// Send the slack notification
async function sendResponse(diffs: string[]): Promise<void> {
  if (isEmpty(diffs)) {
    console.log(`Nothing changed on ${EXCHANGE}.`);
    return;
  }

  const message = constructMessage(diffs, EXCHANGE, (currency) => {
    return `https://www.kucoin.com/#/trade.pro/${currency}`;
  });

  await sendSlackMessage(message);
  console.log(`Slack notification sent successfully for ${EXCHANGE}:`, diffs);
}

async function fetchData(latestData: string[]): Promise<IResponse> {
  const res: IApiResponse = await fetchJSON(API_URL);
  const cryptos: string[] = handleData(res.data);

  if (!latestData) return { data: cryptos, diffs: null };

  const diffs: string[] = getDiff(cryptos, latestData);

  await sendResponse(diffs);
  return { data: cryptos, diffs };
}

async function init(): Promise<void> {
  try {
    let res: IResponse = await fetchData(null);
    let latestData: string[] = res.data;

    setInterval(async () => {
      res = await fetchData(latestData);
      latestData = res.data;
    }, INTERVAL);
  } catch (err) {
    console.error(err);
  }
}

export default {
  fetchData,
  init
};
