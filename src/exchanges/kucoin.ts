import * as isEmpty from 'lodash/isEmpty';
import * as reduce from 'lodash/reduce';
import * as uniq from 'lodash/uniq';
import { fetchJSON, handleNewCryptos} from '../helpers';

const API_URL = 'https://kitchen-4.kucoin.com/v1/market/open/symbols?market=&c=&lang=en_US';
const EXCHANGE = 'Kucoin';

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

function buildUrl(currency: string) {
  return `https://www.kucoin.com/#/trade.pro/${currency}-BTC`;
}

function processApiResponse(data: IData[]): string[] {
  const list: string[] = reduce(data, (sum: string[], item: IData) => {
    const pair: string[] = item.symbol.split('-');
    return sum.concat(pair);
  }, []);

  if (isEmpty(list)) throw new Error(`An error occurred while fetching data from ${EXCHANGE}.`);

  return uniq(list);
}

async function fetchData(latestData: string[]): Promise<string[]> {
  const res: IApiResponse = await fetchJSON(API_URL);
  const cryptos: string[] = processApiResponse(res.data);
  return await handleNewCryptos(EXCHANGE, cryptos, latestData, buildUrl);
}

export default { fetchData };
