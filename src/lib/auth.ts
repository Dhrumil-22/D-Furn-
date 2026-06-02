import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export interface UserJwtPayload {
  id: number;
  email: string;
  role: string;
  name: string;
}

export async function signToken(payload: UserJwtPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(encodedKey);
}

export async function verifyToken(token: string): Promise<UserJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey);
    return payload as unknown as UserJwtPayload;
  } catch (error) {
    return null;
  }
}
