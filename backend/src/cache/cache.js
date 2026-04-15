const NodeCache = require('node-cache');

// stdTTL: 60 seconds — cache entries expire after 1 minute
const cache = new NodeCache({ stdTTL: 60 });

module.exports = cache;
