import nodemailer from 'nodemailer';

function parsePort(value: string | undefined): number {
  const parsed = Number(value || '587');
  return Number.isFinite(parsed) ? parsed : 587;
}

export async function sendCredentialsEmail(
  email: string,
  name: string,
  password: string,
  role: string
): Promise<void> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parsePort(process.env.SMTP_PORT);

  const subject = 'Your School ERP Login Credentials';
  const text = [
    `Hello ${name},`,
    '',
    'Your account has been created/updated in the School ERP portal.',
    `Role: ${role}`,
    `Login ID: ${email}`,
    `Temporary Password: ${password}`,
    '',
    'Please login and change your password immediately.',
  ].join('\n');

  if (!host || !user || !pass) {
    console.log('[MAILER_FALLBACK] SMTP env vars missing. Credentials output below:');
    console.log({ email, name, role, password, reason: 'Missing SMTP_HOST/SMTP_USER/SMTP_PASS' });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `School ERP <${user}>`,
      to: email,
      subject,
      text,
    });
  } catch (error) {
    console.error('SMTP send failed. Falling back to stdout credentials log.', error);
    console.log('[MAILER_FALLBACK] Credentials:', { email, name, role, password });
  }
}
