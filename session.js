// استيراد المكتبات المطلوبة
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs'); 

// استيراد دالة التحميل الخاصة بنا
const { downloadVideo } = require('./yt.js');


/**
 * دالة لإنشاء وبدء جلسة واتساب
 */
function createSession() {
    console.log('جاري تهيئة العميل...');

    const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
            ],
        }
    });

    // ... (أحداث 'qr' و 'ready' تبقى كما هي) ...

    client.on('qr', (qr) => {
        console.log('تم استلام رمز QR، يرجى مسحه بهاتفك:');
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('====================================');
        console.log('العميل جاهز! تم تسجيل الدخول بنجاح.');
        console.log('====================================');
    });

    client.on('message', async (message) => {
        const msgBody = message.body;
        console.log(`[${message.from}] ${msgBody}`);

        // 1. الأمر القديم (ping)
        if (msgBody === 'ping') {
            client.sendMessage(message.from, 'pong');
        }

        // 2. أمر تحميل يوتيوب
        if (msgBody.startsWith('!download ')) {
            const url = msgBody.split(' ')[1];

            if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
                message.reply('الرابط غير صالح. يرجى إرسال أمر كالتالي:\n!download https://www.youtube.com/watch?v=...');
                return;
            }

            try {
                console.log(`[BOT] استلام أمر تحميل لـ: ${url}`);
                message.reply('جاري تحميل الفيديو... قد يستغرق هذا وقتاً طويلاً جداً ⏳');

                const filePath = await downloadVideo(url);

                console.log(`[BOT] جاري إرسال الملف: ${filePath}`);

                // 3. إرسال الملف (فيديو)
                const media = MessageMedia.fromFilePath(filePath);
                
                // === (التعديل الأهم هنا) ===
                
                // إرسال الفيديو كـ "مستند" لتجاوز حدود الذاكرة
                await client.sendMessage(message.from, media, { 
                    caption: 'تم التحميل بنجاح! ✅',
                    sendAsDocument: true // <-- هذا هو الخيار الجديد
                });
                
                // === (نهاية التعديل) ===

                // 4. (مهم جداً) حذف الملف من الخادم
                fs.unlinkSync(filePath);
                console.log(`[BOT] تم حذف الملف المحلي: ${filePath}`);

            } catch (error) {
                // في حال فشل التحميل
                console.error('[BOT] خطأ أثناء عملية التحميل:', error.message);
                // (تم تحديث رسالة الخطأ)
                message.reply(`حدث خطأ أثناء محاولة تحميل الفيديو. 😞\n\nالسبب: ${error.message}`);
            }
        }
    });

    client.on('auth_failure', (msg) => {
        console.error('فشل المصادقة:', msg);
    });

    client.on('disconnected', (reason) => {
        console.log('تم قطع اتصال العميل:', reason);
    });

    // --- (بدء التشغيل) ---
    console.log('جاري بدء تشغيل العميل (initialize)...');
    client.initialize();
}

// تصدير الدالة
module.exports = { createSession };