import { Type } from "@sinclair/typebox";

export const TemplateIdParams = Type.Object({
  id: Type.String({ minLength: 1 }),
});

export const GroupIdParams = Type.Object({
  id: Type.String({ minLength: 1 }),
});

export const QuestionIdParams = Type.Object({
  id: Type.String({ minLength: 1 }),
});

export const CreateTemplateBody = Type.Object({
  name: Type.String({ minLength: 1 }),
});

export const UpdateTemplateBody = Type.Object({
  name: Type.String({ minLength: 1 }),
});

export const CreateGroupBody = Type.Object({
  name: Type.String({ minLength: 1 }),
  displayOrder: Type.Number({ minimum: 0 }),
});

export const UpdateGroupBody = Type.Object(
  {
    name: Type.Optional(Type.String({ minLength: 1 })),
    displayOrder: Type.Optional(Type.Number({ minimum: 0 })),
  },
  { minProperties: 1 },
);

export const CreateQuestionBody = Type.Object({
  label: Type.String({ minLength: 1 }),
  fieldType: Type.Union([
    Type.Literal("text"),
    Type.Literal("boolean"),
    Type.Literal("single_choice"),
    Type.Literal("multi_choice"),
  ]),
  options: Type.Optional(Type.Array(Type.String())),
  required: Type.Optional(Type.Boolean()),
  displayOrder: Type.Number({ minimum: 0 }),
});

export const UpdateQuestionBody = Type.Object(
  {
    label: Type.Optional(Type.String({ minLength: 1 })),
    fieldType: Type.Optional(
      Type.Union([
        Type.Literal("text"),
        Type.Literal("boolean"),
        Type.Literal("single_choice"),
        Type.Literal("multi_choice"),
      ]),
    ),
    options: Type.Optional(Type.Array(Type.String())),
    required: Type.Optional(Type.Boolean()),
    displayOrder: Type.Optional(Type.Number({ minimum: 0 })),
  },
  { minProperties: 1 },
);

export const SubmitResponseBody = Type.Object({
  athleteId: Type.String({ minLength: 1 }),
  answers: Type.Record(Type.String(), Type.Unknown()),
});
