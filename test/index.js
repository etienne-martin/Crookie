import * as assert from 'assert';
import get from 'lodash/get';
import * as sinon from 'sinon';
import lambda from '../dist/lambda';

const previousData = {
  binance: [{ symbol: 'ETHBTC' }]
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
    });
  });

  // describe('Redis', () => {
  //
  // });

  describe('Binance', () => {
    it('should return data', () => {
      assert.notEqual(get(data, 'binance', []).length, 0);
    });

    it('should be an array of string', () => {
      assert.equal(typeof(get(data, 'binance[0]')), 'string');
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
  });
});

// test each directory with modifications
// test normal run each directories data length
