const shortid = require('shortid');
const redis = require('./redis_client');
/* eslint-disable no-unused-vars */
const keyGenerator = require('./redis_key_generator');
const timeUtils = require('../../../utils/time_utils');
/* eslint-enable */

/* eslint-disable no-unused-vars */

// Challenge 7
const hitSlidingWindow = async (name, opts) => {
  const client = redis.getClient();

  // START Challenge #7
  const transaction = client.multi();
  const currentTimestamp = Date.now();
  transaction.zadd(name, currentTimestamp, currentTimestamp + shortid());
  transaction.zremrangebyscore(name, 0, currentTimestamp - opts.interval);
  transaction.zcard(name);
  const [, , zcardCommandResponse] = await transaction.execAsync();

  if (zcardCommandResponse > opts.maxHits) {
    return -1;
  }
  return opts.maxHits - zcardCommandResponse;
};

/* eslint-enable */

module.exports = {
  /**
   * Record a hit against a unique resource that is being
   * rate limited.  Will return 0 when the resource has hit
   * the rate limit.
   * @param {string} name - the unique name of the resource.
   * @param {Object} opts - object containing interval and maxHits details:
   *   {
   *     interval: 1,
   *     maxHits: 5
   *   }
   * @returns {Promise} - Promise that resolves to number of hits remaining,
   *   or 0 if the rate limit has been exceeded..
   */
  hit: hitSlidingWindow
};
