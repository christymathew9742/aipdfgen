const NodeCache = require('node-cache');

const sessionPdfData = new NodeCache({ stdTTL: 3600, checkperiod: 60 });

module.exports = sessionPdfData;

