import type { AnamnesisGroup } from "../../domain/anamnesis/anamnesis-group.entity";
import type { AnamnesisQuestion } from "../../domain/anamnesis/anamnesis-question.entity";

interface GeneratedSchemas {
  jsonSchema: Record<string, unknown>;
  uiSchema: Record<string, unknown>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function questionToJsonSchema(question: AnamnesisQuestion): Record<string, unknown> {
  switch (question.fieldType) {
    case "text":
      return { type: "string", title: question.label };
    case "boolean":
      return { type: "boolean", title: question.label };
    case "single_choice":
      return { type: "string", title: question.label, enum: question.options ?? [] };
    case "multi_choice":
      return {
        type: "array",
        title: question.label,
        items: { type: "string", enum: question.options ?? [] },
        uniqueItems: true,
      };
    default:
      return { type: "string", title: question.label };
  }
}

export function generateSchemas(
  groups: AnamnesisGroup[],
  questions: AnamnesisQuestion[],
): GeneratedSchemas {
  const sortedGroups = [...groups].sort((a, b) => a.displayOrder - b.displayOrder);
  const questionsByGroup = new Map<string, AnamnesisQuestion[]>();

  for (const q of questions) {
    const list = questionsByGroup.get(q.groupId) ?? [];
    list.push(q);
    questionsByGroup.set(q.groupId, list);
  }

  const properties: Record<string, unknown> = {};
  const uiOrder: string[] = [];
  const uiSchema: Record<string, unknown> = {};

  for (const group of sortedGroups) {
    const groupKey = slugify(group.name);
    const groupQuestions = (questionsByGroup.get(group.id) ?? []).sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );

    const groupProperties: Record<string, unknown> = {};
    const groupRequired: string[] = [];
    const groupUiOrder: string[] = [];

    for (const question of groupQuestions) {
      const questionKey = `q_${question.id}`;
      groupProperties[questionKey] = questionToJsonSchema(question);
      groupUiOrder.push(questionKey);

      if (question.required) {
        groupRequired.push(questionKey);
      }
    }

    properties[groupKey] = {
      type: "object",
      title: group.name,
      properties: groupProperties,
      ...(groupRequired.length > 0 ? { required: groupRequired } : {}),
    };

    uiOrder.push(groupKey);
    uiSchema[groupKey] = { "ui:order": groupUiOrder };
  }

  return {
    jsonSchema: {
      type: "object",
      properties,
    },
    uiSchema: {
      "ui:order": uiOrder,
      ...uiSchema,
    },
  };
}
