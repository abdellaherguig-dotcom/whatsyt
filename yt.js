// استيراد المكتبة
const ytDlpExec = require('yt-dlp-exec');
// استيراد أدوات إدارة المسارات والملفات
const path = require('path');
const fs = require('fs');

// تحديد مسار مجلد التحميلات
const downloadsDir = path.join(__dirname, 'downloads');

// التأكد من وجود مجلد التحميلات، وإلا يتم إنشاؤه
if (!fs.existsSync(downloadsDir)){
    fs.mkdirSync(downloadsDir, { recursive: true });
}

/**
 * دالة لتحميل فيديو من يوتيوب باستخدام yt-dlp
 * @param {string} url - رابط الفيديو على يوتيوب
 * @returns {Promise<string>} - مسار الملف الذي تم تحميله
 */
async function downloadVideo(url) {
    console.log(`[YT] بدء عملية التحميل لـ: ${url}`);
    
    // سنستخدم اسم ملف عشوائي لتجنب أخطاء الأسماء الطويلة
    const safeTitle = `video_${Date.now()}`;
    const filePath = path.join(downloadsDir, `${safeTitle}.mp4`);

    try {
        console.log(`[YT] جاري تحميل الفيديو (بأفضل جودة) إلى '${filePath}'...`);

        // نقوم بتحميل الفيديو بأفضل جودة MP4 متاحة
        await ytDlpExec(url, {
            cookies: 'cookies.txt', // استخدام ملف الكوكيز
            
            // === (التعديلات الجديدة هنا) ===
            // العودة إلى أفضل صيغة MP4 بدون قيود
            format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            // (تمت إزالة 'maxFilesize' و 'height<=720')
            // === (نهاية التعديلات) ===
            
            // تحديد مسار الإخراج
            output: filePath
        });

        console.log(`[YT] اكتمل التحميل: ${filePath}`);
        
        // التحقق إذا كان الملف موجوداً
        if (!fs.existsSync(filePath)) {
            throw new Error('فشل تحميل الفيديو (لم يتم العثور على الملف بعد انتهاء yt-dlp).');
        }

        // إرجاع المسار الكامل للملف
        return filePath;

    } catch (error) {
        console.error('[YT] خطأ في تحميل الفيديو:', error.message);
        
        // تنظيف الملف إذا كان قد تم إنشاؤه جزئياً
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // إطلاق خطأ ليتم التقاطه في session.js
        // (قمنا بتحديث رسالة الخطأ)
        throw new Error('فشل تحميل الفيديو. (قد يكون السبب مشكلة في yt-dlp أو الرابط).');
    }
}

// تصدير الدالة لاستخدامها في ملفات أخرى
module.exports = { downloadVideo };