import jwt from 'jsonwebtoken';
import { IJWTPayload, IAuthTokens } from '../types/auth.types.js';

export class JWTService {
  private static getAccessTokenSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    return secret;
  }

  private static getRefreshTokenSecret(): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }
    return secret;
  }

  private static accessTokenExpiry = process.env.JWT_EXPIRE || '1h';
  private static refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRE || '7d';

  public static generateTokens(payload: { userId: string; email: string }): IAuthTokens {
    try {
      const accessToken = jwt.sign(
        payload as any,
        this.getAccessTokenSecret(),
        { expiresIn: this.accessTokenExpiry } as any
      );

      const refreshToken = jwt.sign(
        payload as any,
        this.getRefreshTokenSecret(),
        { expiresIn: this.refreshTokenExpiry } as any
      );

      return { accessToken, refreshToken };
    } catch (error) {
      console.error('[ERROR] Error generating tokens:', error);
      throw new Error('Token generation failed');
    }
  }

  public static verifyAccessToken(token: string): IJWTPayload {
    try {
      return jwt.verify(token, this.getAccessTokenSecret()) as IJWTPayload;
    } catch (error) {
      console.error('[ERROR] Access token verification failed:', error);
      throw new Error('Invalid access token');
    }
  }

  public static verifyRefreshToken(token: string): IJWTPayload {
    try {
      return jwt.verify(token, this.getRefreshTokenSecret()) as IJWTPayload;
    } catch (error) {
      console.error('[ERROR] Refresh token verification failed:', error);
      throw new Error('Invalid refresh token');
    }
  }

  public static generateAccessToken(payload: { userId: string; email: string }): string {
    try {
      return jwt.sign(
        payload as any,
        this.getAccessTokenSecret(),
        { expiresIn: this.accessTokenExpiry } as any
      );
    } catch (error) {
      console.error('[ERROR] Error generating access token:', error);
      throw new Error('Access token generation failed');
    }
  }

  public static generateRefreshToken(payload: { userId: string; email: string }): string {
    try {
      return jwt.sign(
        payload as any,
        this.getRefreshTokenSecret(),
        { expiresIn: this.refreshTokenExpiry } as any
      );
    } catch (error) {
      console.error('[ERROR] Error generating refresh token:', error);
      throw new Error('Refresh token generation failed');
    }
  }

  public static decodeToken(token: string): IJWTPayload | null {
    try {
      return jwt.decode(token) as IJWTPayload;
    } catch (error) {
      console.error('[ERROR] Error decoding token:', error);
      return null;
    }
  }
} 