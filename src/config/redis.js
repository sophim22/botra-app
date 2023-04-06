import "dotenv/config";

import { createClient } from "redis";
import redisScan from "node-redis-scan";

const host = process.env.REDIS_HOST || "localhost";
const port = process.env.REDIS_PORT || 6379;
const redisOption = { url: `redis://${host}:${port}/8`, network_timeout: 5 };
const client = createClient(redisOption);
const scanner = new redisScan(client);

const findMatchKey = (regKey) => {
  return new Promise((resolve, reject) => {
    client.keys(regKey, (err, foundKeys) => {
      if (err) return reject(err);
      resolve(foundKeys[0]);
    });
  });
};

client.findMatchKey = findMatchKey;
client.delByMatchKeys = (regKeys) => {
  regKeys = [].concat(regKeys);
  for (let i = 0, len = regKeys.length; i < len; i++) {
    client.keys(regKeys[i], (err, foundKeys) => {
      if (err) return;
      if (foundKeys.length > 0) {
        client.del(foundKeys);
      }
    });
  }
};
client.findByMatchKeys = (regKeys) => {
  return new Promise(async (resolve, reject) => {
    let result;
    let key;
    regKeys = [].concat(regKeys);
    for (let i = 0, len = regKeys.length; !key && i < len; i++) {
      key = await findMatchKey(regKeys[i]);
    }
    if (key) result = await client.get(key);
    resolve(result);
  });
};

client.getPrefix = (query) => {
  return new Promise((resolve, reject) => {
    scanner.scan(query, (err, matchingKeys) => {
      if (err) reject(err);
      resolve(matchingKeys);
    });
  });
};

client.delByPrefix = async (prefix) => {
  const keys = await client.getPrefix(prefix);
  if (keys) client.delByMatchKeys(keys);
};

client.invokeToken = (token) => client.set(token, "invoke");

export default client;
