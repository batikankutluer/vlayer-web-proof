import { webProof } from 'vlayer-web-proof';

console.log("Starting web proof generation...");
const result = await webProof('https://lichess.org/game/export/s33Pzn5W');

console.log(result);
process.exit(0);