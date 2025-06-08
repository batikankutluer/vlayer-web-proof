const { webProof } = require("vlayer-web-proof");

(async () => {

    const proof = await webProof("https://lichess.org/game/export/s33Pzn5W", {
        notary: "https://test-notary.vlayer.xyz",
      });
      
    console.log(proof);

})()
