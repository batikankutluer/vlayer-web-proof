const { webProof, simpleWebProof } = require('../dist/index.js'); 

// Basit test
async function test() {
  try {
    console.log('Testing webProof with httpbin.org...');
    const result = await webProof('https://httpbin.org/get', { 
      method: 'GET',
      notary: "http://127.0.0.1:7047",
    }); 

    console.log("WebProof result:", result.success ? "SUCCESS" : "FAILED");
    if (result.error) {
      console.error("Error:", result.error);
    }

    console.log('\nTesting simpleWebProof...');
    const simpleResult = await simpleWebProof('127.0.0.1', 7047, 'https://httpbin.org/get');
    console.log("SimpleWebProof result: SUCCESS!\n",simpleResult);
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

test();