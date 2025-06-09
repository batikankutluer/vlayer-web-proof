import { webProof } from "../src/index";

const result = await webProof("https://dummyjson.com/quotes", {
    notary_url: "http://0.0.0.0:7047",
})

console.log(JSON.parse(result.proof))
process.exit(0)