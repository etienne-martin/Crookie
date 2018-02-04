import * as assert from 'assert';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import kucoin from '../../dist/exchanges/kucoin';

describe('Retrieving kucoin data', () => {
  let data = [];

  before(async () => {
    try {
      data = await kucoin.fetchData(null);
    } catch (err) {
      console.error(err);
    }
  });

  describe('Fetch response', () => {
    it('should return data', () => {
      assert.equal(isEmpty(data), false);
    });

    it('should be an array of string', () => {
      assert.equal(typeof(get(data, '[0]')), 'string');
    });

    it('should not be pairings', () => {
      assert.equal(get(data, '[0]').indexOf('-'), -1);
    });
  });
});
