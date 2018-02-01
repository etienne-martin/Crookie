import * as figlet from 'figlet';
import binance from './exchanges/binance';
import gdax from './exchanges/gdax';
import kucoin from './exchanges/kucoin';

binance.init();
kucoin.init();
gdax.init();

figlet('Crookie', (_, data) => {
  console.log(data);
  console.log(' -----------------------------------');
  console.log('   Monitoring new cryptocurrencies  ');
  console.log(' -----------------------------------');
});
