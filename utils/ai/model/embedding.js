const { cosineSimilarity } = require('./utils/common'); 

const queryEmbedding = getEmbedding('What are your hours of operation?');

const responseEmbeddings = [
  getEmbedding('Our opening hours are 9 AM to 5 PM.'),
  getEmbedding('We are open from 8 AM to 6 PM.'),
  // More response embeddings
];

const similarities = responseEmbeddings.map(responseEmbedding => cosineSimilarity(queryEmbedding, responseEmbedding));
const bestResponseIndex = similarities.indexOf(Math.max(...similarities));

const response = getResponse(bestResponseIndex);
