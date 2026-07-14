import crypto from 'crypto';

function base64url(source: Buffer | string): string {
  const buf = Buffer.isBuffer(source) ? source : Buffer.from(source);
  return buf.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

export interface SignOptions {
  expiresIn?: string | number;
}

export function signToken(payload: Record<string, any>, secret: string, options: SignOptions = {}): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  
  const expPayload = { ...payload };
  if (options.expiresIn) {
    let seconds = 3600;
    if (typeof options.expiresIn === 'number') {
      seconds = options.expiresIn;
    } else if (typeof options.expiresIn === 'string') {
      const match = options.expiresIn.match(/^(\d+)([smhd])$/);
      if (match) {
        const val = parseInt(match[1], 10);
        const unit = match[2];
        if (unit === 's') seconds = val;
        else if (unit === 'm') seconds = val * 60;
        else if (unit === 'h') seconds = val * 3600;
        else if (unit === 'd') seconds = val * 86400;
      }
    }
    expPayload.exp = Math.floor(Date.now() / 1000) + seconds;
  }
  
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(expPayload));
  
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signatureInput)
    .digest();
  
  const encodedSignature = base64url(signature);
  return `${signatureInput}.${encodedSignature}`;
}

export function verifyToken(token: string, secret: string): Record<string, any> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token structure');
  }
  
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = base64url(
    crypto.createHmac('sha256', secret).update(signatureInput).digest()
  );
  
  if (encodedSignature !== expectedSignature) {
    throw new Error('JWT signature verification failed');
  }
  
  const payload = JSON.parse(base64urlDecode(encodedPayload));
  
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
    throw new Error('JWT expired');
  }
  
  return payload;
}
