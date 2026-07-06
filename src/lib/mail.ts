import nodemailer from 'nodemailer';

export async function sendCredentialsEmail(
  toEmail: string,
  name: string,
  password: string,
  role: string
): Promise<boolean> {
  const loginUrl = 'http://localhost:3000/login';
  
  // Clean fallback logging
  const printMockCredentials = () => {
    console.log(`
========================================================================
[SMTP MAIL MOCK] CREDENTIAL DISPATCH FOR: ${name}
Role: ${role}
Recipient Email: ${toEmail}
Portal Login Link: ${loginUrl}
Password: ${password}
========================================================================
    `);
  };

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || '587';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    printMockCredentials();
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port, 10),
      secure: port === '465', // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: `"Excellence Academy Admissions" <${user}>`,
      to: toEmail,
      subject: `Your Excellence Academy Portal Credentials`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">Excellence Academy</h1>
            <p style="color: #64748b; font-size: 12px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 0.1em;">Institutional ERP Portal</p>
          </div>
          
          <div style="margin-bottom: 24px;">
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">Your portal access account has been successfully configured and activated by the Super Admin. Below are your login credentials to access the portal dashboard.</p>
          </div>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #f1f5f9; margin-bottom: 24px;">
            <table style="width: 100%; font-size: 13px; color: #475569; border-spacing: 0 8px;">
              <tr>
                <td style="font-weight: bold; width: 120px;">Portal Role:</td>
                <td style="color: #1e293b; text-transform: capitalize;"><strong>${role.replace('_', ' ')}</strong></td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Login Email:</td>
                <td style="color: #1e293b; font-family: monospace; font-size: 14px;"><strong>${toEmail}</strong></td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Temporary Pass:</td>
                <td style="color: #1e293b; font-family: monospace; font-size: 14px;"><strong>${password}</strong></td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${loginUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-weight: bold; font-size: 14px; padding: 12px 24px; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
              Login to Dashboard
            </a>
          </div>

          <div style="border-t: 1px solid #f1f5f9; padding-top: 16px; font-size: 11px; color: #94a3b8; line-height: 1.5;">
            <p style="margin: 0 0 8px 0;"><strong>Important Security Note:</strong> For security reasons, please change your password immediately after your first successful login from the settings panel.</p>
            <p style="margin: 0;">This is an automated system dispatch. Please do not reply directly to this mail.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Mail sent successfully: ${info.messageId}`);
    return true;
  } catch (err: any) {
    console.error(`[SMTP] Failed to send credentials email to ${toEmail}:`, err.message);
    // Still fallback to mock printing so the user/admin can see it in logs!
    printMockCredentials();
    return false;
  }
}
