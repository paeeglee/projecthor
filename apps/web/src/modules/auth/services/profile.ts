import { api } from "@/modules/shared/services/api";

interface ProfileResponse {
  id: string;
  userId: string;
  fullName: string;
  bodyWeight: number | null;
}

export async function getProfile(): Promise<ProfileResponse> {
  const { data } = await api.get<ProfileResponse>("/profiles/me");
  return data;
}
