import { api } from "@/modules/shared/services/api";

interface SignUpResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
  };
}

export async function signUp(
  fullName: string,
  email: string,
  password: string,
): Promise<SignUpResponse> {
  const { data } = await api.post<SignUpResponse>("/auth/signup", {
    fullName,
    email,
    password,
  });
  return data;
}
