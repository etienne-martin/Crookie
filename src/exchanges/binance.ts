import * as isEmpty from 'lodash/isEmpty';
import * as map from 'lodash/map';
import * as uniq from 'lodash/uniq';
import { fetchJSON, handleNewCryptos, stripFromEnd } from '../helpers';

const API_URL = 'https://api.binance.com/api/v1/ticker/allPrices';
const EXCHANGE = 'Binance';

export interface IData {
  symbol: string;
  price: string;
}

function buildUrl(currency: string) {
  return 'https://www.binance.com/tradeDetail.html?symbol=' + currency + '_BTC';
}

function processApiResponse(data: IData[]): string[] {
  const list: string[] = map(data, item => stripFromEnd(item.symbol, ['USDT', 'BTC', 'ETH', 'BNB']));

  if (isEmpty(list)) throw new Error(`An error occurred while fetching data from ${EXCHANGE}.`);

  return uniq(list);
}

async function fetchData(latestData: string[]): Promise<string[]> {
  const cryptos: string[] = processApiResponse(await fetchJSON(API_URL));
  return await handleNewCryptos(EXCHANGE, cryptos, latestData, buildUrl);
}

export default { fetchData };
