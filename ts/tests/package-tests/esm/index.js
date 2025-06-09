import { webProof } from 'vlayer-web-proof';

(async () => {

    console.log("Starting web proof generation...");
  
      const proof = await webProof("https://lichess.org/game/export/s33Pzn5W", {
          notary_url: "http://0.0.0.0:7047",
        });
        
      console.log(JSON.parse(proof.proof));
      process.exit(0);
  
  })()
  