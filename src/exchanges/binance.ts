import * as isEmpty from 'lodash/isEmpty';
import * as map from 'lodash/map';
import { fetchJSON, handleNewCryptos } from '../helpers';

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
  const list: string[] = map(data, item => item.symbol);

  if (isEmpty(list)) throw new Error(`An error occurred while fetching data from ${EXCHANGE}.`);

  return list;
}

async function fetchData(latestData: string[]): Promise<string[]> {
  const res: IData[] = await fetchJSON(API_URL);
  const cryptos: string[] = processApiResponse(res);
  return await handleNewCryptos(EXCHANGE, cryptos, latestData, buildUrl);
}

export default { fetchData };
