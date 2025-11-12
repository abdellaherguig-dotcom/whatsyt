// نقوم باستيراد (import) الدالة 'createSession'
// التي قمنا بتعريفها في ملف 'session.js'
const { createSession } = require('./session.js');

// نطبع رسالة ترحيبية في الطرفية
console.log('... بدء تشغيل بوت واتساب ...');

// نقوم باستدعاء الدالة لبدء عملية إنشاء الجلسة
createSession();