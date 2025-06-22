export interface IUser {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  otpCode?: string;
  otpExpires?: Date;
  refreshTokens: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISignupRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
  otp?: string;
}

export interface IVerifyEmailRequest {
  token: string;
}

export interface IForgotPasswordRequest {
  email: string;
}

export interface IResetPasswordRequest {
  token: string;
  password: string;
}

export interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface IRefreshTokenRequest {
  refreshToken: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IJWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface IOTPVerificationRequest {
  email: string;
  otp: string;
}

export interface IRequestOTPRequest {
  email: string;
} 