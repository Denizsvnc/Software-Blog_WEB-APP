import app from './server.js';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma.js'; // Veritabanı bağlantısını test etmek için

dotenv.config(); // .env dosyasını oku
    
const PORT = process.env.PORT || 3000;

async function main() {
  try {
    
    await prisma.$connect();
    console.log('✅ Veritabanı bağlantısı başarılı.');

    // Sunucuyu başlat
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`🚀 Sunucu port ${PORT} üzerinde ve dış dünyaya açık çalışıyor.`);
    });

  } catch (error) {
    console.error('❌ Sunucu başlatılamadı:', error);
    process.exit(1);
  }
}

main();