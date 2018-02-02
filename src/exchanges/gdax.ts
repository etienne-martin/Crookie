import * as isEmpty from 'lodash/isEmpty';
import * as map from 'lodash/map';
import * as uniq from 'lodash/uniq';
import { fetchJSON, handleNewCryptos } from '../helpers';

const API_URL = 'https://api.gdax.com/products';
const EXCHANGE = 'GDAX';

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

function buildUrl(currency: string) {
  return 'https://www.gdax.com/trade/' + currency + '-USD';
}

function processApiResponse(data: IData[]): string[] {
  const rawList: string[] = map(data, (item: IData) => item.base_currency);
  const list: string[] = uniq(rawList);

  if (isEmpty(list)) throw new Error(`An error occurred while fetching data from ${EXCHANGE}.`);

  return list;
}

async function fetchData(latestData: string[]): Promise<string[]> {
  const res: IData[] = await fetchJSON(API_URL);
  const cryptos: string[] = processApiResponse(res);
  return await handleNewCryptos(EXCHANGE, cryptos, latestData, buildUrl);
}

export default { fetchData };
