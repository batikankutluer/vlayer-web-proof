import { webProof } from 'vlayer-web-proof';

const result = await webProof('https://lichess.org/game/export/s33Pzn5W');

console.log(result);