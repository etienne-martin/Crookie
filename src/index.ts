import * as figlet from 'figlet';
import binance from './exchanges/binance';
import gdax from './exchanges/gdax';
import kucoin from './exchanges/kucoin';
import { run } from './helpers';

run(binance.fetchData);
run(kucoin.fetchData);
run(gdax.fetchData);

figlet('Crookie', (_, data) => {
  console.log(data);
  console.log(' -----------------------------------');
  console.log('   Monitoring new cryptocurrencies  ');
  console.log(' -----------------------------------');
});
