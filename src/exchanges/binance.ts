import * as get from 'lodash/get';
import * as includes from 'lodash/includes';
import * as isEmpty from 'lodash/isEmpty';
import { compareArrays, constructMessage, fetchJSON, sendSlackMessage } from '../helpers';

const API_URL = 'https://api.binance.com/api/v1/ticker/allPrices';
const EXCHANGE = 'Binance';
const INTERVAL = 10000;

export interface IData {
  symbol: string;
  price: string;
}

export interface IResponse {
  data: IData[];
  diffs: string[];
}

function handleData(newData: IData[], latestData: IData[]): string[] {
  const diffs: string[] = compareArrays(latestData, newData, 'symbol');
  const mergedDiffs: string[] = [];

  if (!get(newData, '[0].symbol')) throw new Error(`An error occurred while fetching data from ${EXCHANGE}.`);
  // Skip if nothing changed
  if (isEmpty(diffs)) return;

  // Remove duplicates from the diff.
  for (let diff of diffs) {
    diff = diff.replace(new RegExp('BTC' + '$'), '');
    diff = diff.replace(new RegExp('ETH' + '$'), '');
    diff = diff.replace(new RegExp('BNB' + '$'), '');

    if (!includes(mergedDiffs, diff)) mergedDiffs.push(diff);
  }

  return mergedDiffs;
}

// Send the slack notification
async function sendResponse(diffs: string[]): Promise<void> {
  if (isEmpty(diffs)) {
    console.log(`Nothing changed on ${EXCHANGE}.`);
    return;
  }

  const message = constructMessage(diffs, EXCHANGE, (currency) => {
    return 'https://www.binance.com/tradeDetail.html?symbol=' + currency + '_BTC';
  });

  await sendSlackMessage(message);
  console.log(`Slack notification sent successfully for ${EXCHANGE}:`, diffs);
}

async function fetchData(latestData: IData[]): Promise<IResponse> {
  const data: IData[] = await fetchJSON(API_URL);

  if (!latestData) return { data, diffs: null };

  const diffs: string[] = handleData(data, latestData);

  await sendResponse(diffs);
  return { data, diffs };
}

async function init(): Promise<void> {
  try {
    let res: IResponse = await fetchData(null);
    let latestData: IData[] = res.data;

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
