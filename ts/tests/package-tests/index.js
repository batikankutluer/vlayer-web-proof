const { webProof } = require('vlayer-web-proof');

const result = await webProof('https://lichess.org/game/export/s33Pzn5W');

const proof = JSON.parse(result.proof);

console.log("Proof:", proof);
console.log("=============")
console.log("Proof is string:", typeof proof.data === "string");