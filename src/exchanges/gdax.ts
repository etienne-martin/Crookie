import * as clone from 'lodash/clone';
import * as isEmpty from 'lodash/isEmpty';
import * as map from 'lodash/map';
import * as pullAll from 'lodash/pullAll';
import * as uniq from 'lodash/uniq';
import { constructMessage, fetchJSON, sendSlackMessage } from '../helpers';

const API_URL = 'https://api.gdax.com/products';
const EXCHANGE = 'GDAX';
const INTERVAL = 10000;

export interface IData {
  id: string;
  base_currency: string;
  quote_currency: string;
  base_min_size: string;
  base_max_size: string;
  quote_increment: string;
  display_name: string;
  status: string;
  margin_enabled: boolean;
  status_message: string | null;
  min_market_funds: string;
  max_market_funds: string;
  post_only: boolean;
  limit_only: boolean;
  cancel_only: boolean;
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
  const rawList: string[] = map(data, (item: IData) => item.base_currency);
  const list: string[] = uniq(rawList);

  if (isEmpty(list)) throw new Error(`An error occurred while fetching data from ${EXCHANGE}.`);

  return list;
}

// Send the slack notification
async function sendResponse(diffs: string[]): Promise<void> {
  if (isEmpty(diffs)) {
    console.log(`Nothing changed on ${EXCHANGE}.`);
    return;
  }

  const message = constructMessage(diffs, EXCHANGE, (currency) => {
    return 'https://www.gdax.com/trade/' + currency + '-USD';
  });

  await sendSlackMessage(message);
  console.log(`Slack notification sent successfully for ${EXCHANGE}:`, diffs);
}

async function fetchData(latestData: string[]): Promise<IResponse> {
  const res: IData[] = await fetchJSON(API_URL);
  const cryptos: string[] = handleData(res);

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
