import * as isEmpty from 'lodash/isEmpty';
import * as map from 'lodash/map';
import * as uniq from 'lodash/uniq';
import { fetchJSON, handleNewCryptos, stripFromEnd } from '../helpers';

const API_URL = 'https://api.bitfinex.com/v1/symbols';
const EXCHANGE = 'Bitfinex';

function buildUrl(currency: string) {
  return 'https://www.bitfinex.com/t/' + currency + ':USD';
}

function processApiResponse(data: string[]): string[] {
  const list: string[] = map(data, item => stripFromEnd(item.toUpperCase(), ['USD', 'BTC', 'EUR', 'ETH']));

  if (isEmpty(list)) throw new Error(`An error occurred while fetching data from ${EXCHANGE}.`);

  return uniq(list);
}

async function fetchData(latestData: string[]): Promise<string[]> {
  const cryptos: string[] = processApiResponse(await fetchJSON(API_URL));
  return await handleNewCryptos(EXCHANGE, cryptos, latestData, buildUrl);
}

export default { fetchData };
