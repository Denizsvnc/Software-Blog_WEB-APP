// --- 1. AYARLAR VE KONTROLLER ---
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_ID; // Senin Chat ID'n

if (!TELEGRAM_TOKEN || !ADMIN_CHAT_ID) {
    console.warn("⚠️ UYARI: Telegram Token veya Chat ID .env dosyasında eksik!");
}

const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

// --- 2. YARDIMCI FONKSİYON (Telegram'a İstek Atan) ---
const sendTelegramMessage = async (text: string): Promise<void> => {
    try {
        if (!TELEGRAM_TOKEN || !ADMIN_CHAT_ID) return;

        const response = await fetch(`${BASE_URL}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: ADMIN_CHAT_ID,
                text: text,
                parse_mode: 'HTML', 
                disable_web_page_preview: true
            })
        });

        const data = await response.json();
        
        if (!data.ok) {
            console.error(`❌ Telegram API Hatası: ${data.description}`);
        } else {
            console.log("✅ Telegram bildirimi gönderildi.");
        }

    } catch (error: any) {
        console.error("❌ Telegram bağlantı hatası:", error.message);
        // Hata fırlatmıyoruz, akış bozulmasın.
    }
};

// --- 3. DOĞRULAMA MAİLİ (Simüle Edilmiş) ---
// Controller bu fonksiyonu çağırınca aslında Telegram'a mesaj gidecek.
export const sendVerificationEmail = async (to: string, code: string): Promise<void> => {
    
    // Mesaj Tasarımı
    const message = `
🔐 <b>DOĞRULAMA KODU</b>

👤 <b>Kullanıcı:</b> ${to}
🔑 <b>Kod:</b> <code>${code}</code>

<i>(Bu mesaj email servisi yerine Telegram üzerinden geliştiriciye iletilmiştir.)</i>
    `;

    console.log(`📨 Mail simülasyonu: ${to} için kod Telegram'a gönderiliyor...`);
    await sendTelegramMessage(message);
};

// --- 4. BÜLTEN MAİLİ (Simüle Edilmiş) ---
export const sendNewsletterEmail = async (to: string, subject: string, html: string): Promise<void> => {
    
   
    const cleanContent = html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]*>?/gm, '')     // Diğer tüm HTML etiketlerini sil
        .trim()
        .substring(0, 300);            // Çok uzunsa kes

    const message = `
📢 <b>YENİ BÜLTEN GÖNDERİMİ</b>

📬 <b>Alıcı:</b> ${to}
📌 <b>Konu:</b> ${subject}

📝 <b>İçerik Özeti:</b>
${cleanContent}...
    `;

    await sendTelegramMessage(message);
};