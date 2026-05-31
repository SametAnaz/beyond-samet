import crypto from 'crypto';

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }

  return value;
}

function safeCompare(input, expected) {
  const inputBuffer = Buffer.from(input || '', 'utf8');
  const expectedBuffer = Buffer.from(expected || '', 'utf8');

  if (inputBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(inputBuffer, expectedBuffer);
}

export async function POST(request) {
  try {
    const { username = '', password = '' } = await request.json();

    const adminUsername = getRequiredEnv('ADMIN_USERNAME');
    const adminPassword = getRequiredEnv('ADMIN_PASSWORD');

    const isValidUsername = safeCompare(username, adminUsername);
    const isValidPassword = safeCompare(password, adminPassword);

    if (!isValidUsername || !isValidPassword) {
      return Response.json(
        { success: false, error: 'Geçersiz kullanıcı adı veya şifre' },
        { status: 401 }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Admin login error:', error);
    return Response.json(
      { success: false, error: 'Giriş işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
