import * as assert from 'assert';
import get from 'lodash/get';
import * as sinon from 'sinon';
import lambda from '../dist/lambda';

const previousData = {
  binance: [{ symbol: 'ETHBTC' }]
}
const fakeRedisClient = {
  on(e, cb) {},
  quit() {},
  get(key, cb) { cb(null, previousData[key]); },
  set(key, data, cb) { cb(); }
}

describe('Retrieving exchanges data', () => {
  let data;
  // let redisOn = sinon.spy();
  // let redisQuit = sinon.spy();
  // let redisGet =

  before((done) => {
    lambda((err, res) => {
      data = res;
      done();
    }, fakeRedisClient);
  });

  // describe('Redis', () => {
  //
  // });

  describe('Binance', () => {
    it('should return data', () => {
      assert.notEqual(get(data, 'binance', []).length, 0);
    });

    it('should have a "symbol" property', () => {
      assert.equal(typeof(get(data, 'binance[0].symbol')), 'string');
    });

    it('should have a "symbol" value', () => {
      assert.notEqual(get(data, 'binance[0].symbol').length, 0);
    });
  });

  describe('Kucoin', () => {
    it('should return data', () => {
      assert.notEqual(get(data, 'kucoin', []).length, 0);
    });

    it('should be an array of string', () => {
      assert.equal(typeof(get(data, 'kucoin[0]')), 'string');
    });

    it('should not be pairings', () => {
      assert.equal(get(data, 'kucoin[0]').indexOf('-'), -1);
    });
  });

  describe('GDAX', () => {
    it('should return data', () => {
      assert.notEqual(get(data, 'gdax', []).length, 0);
    });

    it('should be an array of string', () => {
      assert.equal(typeof(get(data, 'gdax[0]')), 'string');
    });

    it('should not be pairings', () => {
      assert.equal(get(data, 'gdax[0]').indexOf('-'), -1);
    });
  });
});

// test each directory with modifications
// test normal run each directories data length
