const nodemailer = require('nodemailer');

function renderLuxuryEmailLayout(opts) {
  const FRONTEND_URL = 'https://temp-sanab.vercel.app';
  const year = new Date().getFullYear();

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${opts.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050811; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <div style="display: none; font-size: 1px; color: #050811; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${opts.preheader}
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #050811; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 24px 12px 36px 12px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #0d1322; border-radius: 20px; overflow: hidden; border: 1px solid #1e293b;">
          
          <!-- Brand Header -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #090d16 0%, #171f38 50%, #2a1b0a 100%); padding: 36px 24px 28px 24px; border-bottom: 2px solid #f59e0b;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <div style="display: inline-block; padding: 6px 16px; border-radius: 9999px; background-color: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.4);">
                      <span style="color: #f59e0b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; font-family: -apple-system, sans-serif;">✨ ${opts.badge || 'AMIN & PRAO PARIS'}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="color: #ffffff; font-size: 32px; font-weight: 900; margin: 0; font-family: Georgia, 'Times New Roman', serif; letter-spacing: 2px;">AMIN</h1>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 4px;">
                    <p style="color: #94a3b8; font-size: 11px; margin: 0; letter-spacing: 2px; text-transform: uppercase; font-weight: 600;">FINE JEWELLERY &bull; PRAO ANTI-TARNISH &bull; COSMETICS</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Area -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; background-color: #0d1322;">
              <h2 style="color: #f8fafc; font-size: 24px; font-weight: 800; margin: 0 0 10px 0; font-family: Georgia, 'Times New Roman', serif; line-height: 1.3;">
                ${opts.title}
              </h2>
              ${opts.subtitle ? `
              <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                ${opts.subtitle}
              </p>` : ''}

              ${opts.contentHtml}
            </td>
          </tr>

          <!-- Security / Privilege Assurance Footer Banner -->
          <tr>
            <td style="background-color: #090e1a; padding: 20px 32px; border-top: 1px solid #1e293b; border-bottom: 1px solid #1e293b;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="color: #cbd5e1; font-size: 12px; line-height: 1.7;">
                    <span style="color: #f59e0b; font-weight: 700;">✨ 100% BIS Hallmarked Gold</span> &bull; 
                    <span style="color: #f59e0b; font-weight: 700;">🛡️ Lifetime Anti-Tarnish</span> &bull; 
                    <span style="color: #f59e0b; font-weight: 700;">🚚 Insured Delivery</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Brand Footer -->
          <tr>
            <td align="center" style="background-color: #03060d; padding: 32px 24px; color: #64748b; font-size: 12px; line-height: 1.7; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 4px 0; color: #f8fafc; font-weight: 800; font-size: 14px; letter-spacing: 0.5px;">
                AMIN Luxury E-Commerce Platform
              </p>
              <p style="margin: 0 0 16px 0; color: #94a3b8; font-size: 11px;">
                100% BIS Hallmarked Gold &bull; PRAO Anti-Tarnish Lifetime Guarantee &bull; Express Delivery
              </p>
              
              <div style="border-top: 1px dotted #334155; margin: 16px 0 16px 0;"></div>
              
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 16px auto;">
                <tr>
                  <td style="padding: 0 12px;"><a href="${FRONTEND_URL}/shop" style="color: #f59e0b; text-decoration: none; font-weight: 700; font-size: 12px;">Collections</a></td>
                  <td style="color: #475569;">&bull;</td>
                  <td style="padding: 0 12px;"><a href="${FRONTEND_URL}/about" style="color: #f59e0b; text-decoration: none; font-weight: 700; font-size: 12px;">About Atelier</a></td>
                  <td style="color: #475569;">&bull;</td>
                  <td style="padding: 0 12px;"><a href="${FRONTEND_URL}/contact" style="color: #f59e0b; text-decoration: none; font-weight: 700; font-size: 12px;">Concierge Support</a></td>
                </tr>
              </table>
              
              <p style="margin: 0; color: #475569; font-size: 10px; letter-spacing: 0.3px;">
                &copy; ${year} AMIN Platform. All rights reserved. Confidential transaction communication.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendTestOtp() {
  const otp = '915247';
  const to = 'mdsadiqueamin721721@gmail.com';

  const contentHtml = `
    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
      Enter the 6-digit verification code below to sign in or confirm your security authorization on <strong>AMIN</strong>.
    </p>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0;">
      <tr>
        <td align="center" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(244, 63, 94, 0.10) 100%); border: 2px dashed #f59e0b; border-radius: 16px; padding: 28px 16px;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #f59e0b; margin-bottom: 8px;">YOUR 6-DIGIT OTP</div>
          <div style="font-size: 44px; font-weight: 900; letter-spacing: 14px; color: #ffffff; font-family: 'Courier New', Courier, monospace; text-shadow: 0 2px 16px rgba(245, 158, 11, 0.5);">${otp.split('').join(' ')}</div>
        </td>
      </tr>
    </table>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0; background-color: rgba(15, 23, 42, 0.8); border: 1px solid #1e293b; border-radius: 12px; padding: 14px 18px;">
      <tr>
        <td style="color: #94a3b8; font-size: 12px; line-height: 1.6;">
          <strong style="color: #f59e0b;">⏱️ Code Expires in 5 Minutes:</strong> For your security, this single-use code will expire shortly.
        </td>
      </tr>
    </table>

    <p style="color: #64748b; font-size: 12px; line-height: 1.6; margin: 0;">
      🛡️ <em>If you did not initiate this sign-in request, please ignore this email or contact AMIN Concierge immediately.</em>
    </p>
  `;

  const html = renderLuxuryEmailLayout({
    preheader: `Your verification code is ${otp}. Valid for 5 minutes.`,
    badge: 'AMIN & PRAO PARIS',
    title: 'Verification Code Required',
    subtitle: 'Sign in to access your luxury jewellery & cosmetics account.',
    contentHtml,
  });

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'mdsadiqueamin721786@gmail.com',
      pass: 'thvmiexrbpfekwqz'
    },
    tls: { rejectUnauthorized: false }
  });

  console.log('Sending Master Luxury OTP Email to:', to);
  const info = await transporter.sendMail({
    from: '"AMIN Luxury Atelier" <mdsadiqueamin721786@gmail.com>',
    to,
    subject: `🔒 ${otp} — Your AMIN Verification Code`,
    html,
    text: `Your AMIN verification code is ${otp}. Valid for 5 minutes.`
  });

  console.log('✅ DELIVERED TO GMAIL:', info.response);
}

sendTestOtp();
