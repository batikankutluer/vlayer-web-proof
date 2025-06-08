#!/usr/bin/env node

const os = require('os');
const path = require('path');
const fs = require('fs');

function checkNativeBinding() {
  const platform = os.platform();
  const arch = os.arch();
  
  console.log('🚀 vlayer-web-proof kurulumu kontrol ediliyor...');
  console.log(`💻 Platform: ${platform}-${arch}`);
  
  // Desteklenen platformları kontrol et
  const supportedPlatforms = {
    'linux-x64': 'vlayer-web-proof.linux-x64-gnu.node',
    'darwin-x64': 'vlayer-web-proof.darwin-x64.node', 
    'darwin-arm64': 'vlayer-web-proof.darwin-arm64.node',
    'win32-x64': 'vlayer-web-proof.win32-x64-msvc.node'
  };
  
  const platformKey = `${platform}-${arch}`;
  const expectedBinary = supportedPlatforms[platformKey];
  
  if (!expectedBinary) {
    console.log('⚠️  Platformunuz henüz desteklenmiyor.');
    console.log(`   Desteklenen platformlar: ${Object.keys(supportedPlatforms).join(', ')}`);
    console.log('   Package yine de kuruldu, ancak native işlevler çalışmayabilir.');
    return false;
  }
  
  // Binary dosyasını kontrol et
  const binaryPaths = [
    path.join(__dirname, '..', expectedBinary),
    path.join(__dirname, '..', 'vlayer-web-proof.linux-x64-gnu.node'), // fallback
    path.join(__dirname, '..', 'dist', expectedBinary),
    path.join(__dirname, '..', 'dist', 'vlayer-web-proof.linux-x64-gnu.node') // fallback
  ];
  
  for (const binaryPath of binaryPaths) {
    if (fs.existsSync(binaryPath)) {
      const stats = fs.statSync(binaryPath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
      console.log(`✅ Native binary bulundu: ${path.basename(binaryPath)} (${sizeMB}MB)`);
      
      // Binary'nin çalışabilir olduğunu test et
      try {
        require(binaryPath);
        console.log('✅ Native binding başarıyla yüklendi!');
        return true;
      } catch (error) {
        console.log(`⚠️  Native binding yüklenemedi: ${error.message}`);
        if (error.message.includes('Invalid ELF header') || error.message.includes('wrong ELF class')) {
          console.log('   Bu genellikle platform uyumsuzluğu nedeniyledir.');
        }
      }
    }
  }
  
  console.log('❌ Native binary bulunamadı.');
  console.log('   Package JavaScript fallback modunda çalışacak.');
  return false;
}

function printUsageInfo() {
  console.log('\n📚 Kullanım:');
  console.log('```javascript');
  console.log('import { webProof } from "vlayer-web-proof";');
  console.log('');
  console.log('const result = await webProof("https://api.example.com/data");');
  console.log('console.log(result.success ? "✅ Success!" : "❌ Failed:", result);');
  console.log('```');
  console.log('');
  console.log('📖 Daha fazla bilgi: https://github.com/vlayer-xyz/vlayer-web-proof');
}

function main() {
  try {
    console.log('═'.repeat(60));
    const bindingWorking = checkNativeBinding();
    
    if (bindingWorking) {
      console.log('\n🎉 Kurulum başarılı! vlayer-web-proof kullanıma hazır.');
    } else {
      console.log('\n⚠️  Kurulum tamamlandı ancak native binding ile sorunlar var.');
      console.log('   Sorun yaşarsanız lütfen GitHub issues\'a bildirin.');
    }
    
    printUsageInfo();
    console.log('═'.repeat(60));
    
  } catch (error) {
    console.error('❌ Kurulum kontrolü sırasında hata:', error.message);
    process.exit(0); // Hataya rağmen kurulumu başarısız sayma
  }
}

main(); 