import { api } from "@/modules/shared/services/api";

const TEMPLATE_ID = import.meta.env.VITE_ANAMNESIS_TEMPLATE_ID;

export interface AnamnesisFormResponse {
  jsonSchema: {
    type: string;
    properties: Record<
      string,
      {
        type: string;
        title: string;
        required?: string[];
        properties: Record<
          string,
          {
            type: string;
            title: string;
            enum?: string[];
          }
        >;
      }
    >;
  };
  uiSchema: {
    "ui:order": string[];
    [sectionKey: string]: unknown;
  };
}

interface SubmitAnamnesisPayload {
  answers: Record<string, string>;
}

export async function fetchAnamnesisForm(): Promise<AnamnesisFormResponse> {
  const { data } = await api.get<AnamnesisFormResponse>(
    `/anamnesis/templates/${TEMPLATE_ID}/form`,
  );
  return data;
}

export async function submitAnamnesis(
  payload: SubmitAnamnesisPayload,
): Promise<void> {
  await api.post(`/anamnesis/templates/${TEMPLATE_ID}/submit`, payload);
}
