import { api } from "@/modules/shared/services/api";

interface SignInResponse {
  accessToken: string;
  refreshToken: string;
}

export async function signIn(
  email: string,
  password: string,
): Promise<SignInResponse> {
  const { data } = await api.post<SignInResponse>("/auth/signin", {
    email,
    password,
  });
  return data;
}
