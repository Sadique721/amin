const nodemailer = require('nodemailer');

async function test() {
  console.log('Testing Gmail SMTP 587...');
  const transporter587 = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'mdsadiqueamin721786@gmail.com',
      pass: 'thvmiexrbpfekwqz'
    },
    tls: { rejectUnauthorized: false }
  });

  try {
    const info = await transporter587.sendMail({
      from: '"AMIN Luxury Atelier" <mdsadiqueamin721786@gmail.com>',
      to: 'mdsadiqueamin721721@gmail.com',
      subject: '🔒 888777 — Your AMIN Verification Code',
      text: 'Testing direct delivery to mdsadiqueamin721721@gmail.com'
    });
    console.log('✅ 587 SUCCESS:', info.response);
  } catch (err) {
    console.error('❌ 587 FAILED:', err.message);
  }
}
test();
