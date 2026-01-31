export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SignUpResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface SignInResult {
  user: AuthUser & { hasAnamnesis: boolean };
  accessToken: string;
  refreshToken: string;
}
