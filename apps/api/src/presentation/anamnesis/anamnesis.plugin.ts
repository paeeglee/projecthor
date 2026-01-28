import { Elysia } from "elysia";
import type { CreateGroupUseCase } from "../../application/anamnesis/create-group.use-case";
import type { CreateQuestionUseCase } from "../../application/anamnesis/create-question.use-case";
import type { CreateTemplateUseCase } from "../../application/anamnesis/create-template.use-case";
import type { DeleteGroupUseCase } from "../../application/anamnesis/delete-group.use-case";
import type { DeleteQuestionUseCase } from "../../application/anamnesis/delete-question.use-case";
import type { GetFormSchemaUseCase } from "../../application/anamnesis/get-form-schema.use-case";
import type { GetTemplateUseCase } from "../../application/anamnesis/get-template.use-case";
import type { SubmitResponseUseCase } from "../../application/anamnesis/submit-response.use-case";
import type { UpdateGroupUseCase } from "../../application/anamnesis/update-group.use-case";
import type { UpdateQuestionUseCase } from "../../application/anamnesis/update-question.use-case";
import type { UpdateTemplateUseCase } from "../../application/anamnesis/update-template.use-case";
import {
  CreateGroupBody,
  CreateQuestionBody,
  CreateTemplateBody,
  GroupIdParams,
  QuestionIdParams,
  SubmitResponseBody,
  TemplateIdParams,
  UpdateGroupBody,
  UpdateQuestionBody,
  UpdateTemplateBody,
} from "./anamnesis.schemas";

interface AnamnesisUseCases {
  createTemplate: CreateTemplateUseCase;
  getTemplate: GetTemplateUseCase;
  updateTemplate: UpdateTemplateUseCase;
  createGroup: CreateGroupUseCase;
  updateGroup: UpdateGroupUseCase;
  deleteGroup: DeleteGroupUseCase;
  createQuestion: CreateQuestionUseCase;
  updateQuestion: UpdateQuestionUseCase;
  deleteQuestion: DeleteQuestionUseCase;
  getFormSchema: GetFormSchemaUseCase;
  submitResponse: SubmitResponseUseCase;
}

export const anamnesisPlugin = (useCases: AnamnesisUseCases) =>
  new Elysia({ prefix: "/anamnesis" })
    .post(
      "/templates",
      async ({ body, set }) => {
        const template = await useCases.createTemplate.execute(body.name);
        set.status = 201;
        return template;
      },
      { body: CreateTemplateBody },
    )
    .get(
      "/templates/:id",
      async ({ params, set }) => {
        const result = await useCases.getTemplate.execute(params.id);
        if (!result) {
          set.status = 404;
          return { error: "Template not found" };
        }
        return result;
      },
      { params: TemplateIdParams },
    )
    .put(
      "/templates/:id",
      async ({ params, body }) => {
        return useCases.updateTemplate.execute(params.id, body.name);
      },
      { params: TemplateIdParams, body: UpdateTemplateBody },
    )
    .post(
      "/templates/:id/groups",
      async ({ params, body, set }) => {
        const group = await useCases.createGroup.execute(
          params.id,
          body.name,
          body.displayOrder,
        );
        set.status = 201;
        return group;
      },
      { params: TemplateIdParams, body: CreateGroupBody },
    )
    .put(
      "/groups/:id",
      async ({ params, body }) => {
        return useCases.updateGroup.execute(params.id, body);
      },
      { params: GroupIdParams, body: UpdateGroupBody },
    )
    .delete(
      "/groups/:id",
      async ({ params, set }) => {
        await useCases.deleteGroup.execute(params.id);
        set.status = 204;
      },
      { params: GroupIdParams },
    )
    .post(
      "/groups/:id/questions",
      async ({ params, body, set }) => {
        const question = await useCases.createQuestion.execute({
          groupId: params.id,
          label: body.label,
          fieldType: body.fieldType,
          options: body.options,
          required: body.required,
          displayOrder: body.displayOrder,
        });
        set.status = 201;
        return question;
      },
      { params: GroupIdParams, body: CreateQuestionBody },
    )
    .put(
      "/questions/:id",
      async ({ params, body }) => {
        return useCases.updateQuestion.execute(params.id, body);
      },
      { params: QuestionIdParams, body: UpdateQuestionBody },
    )
    .delete(
      "/questions/:id",
      async ({ params, set }) => {
        await useCases.deleteQuestion.execute(params.id);
        set.status = 204;
      },
      { params: QuestionIdParams },
    )
    .get(
      "/templates/:id/form",
      async ({ params, set }) => {
        const schema = await useCases.getFormSchema.execute(params.id);
        if (!schema) {
          set.status = 404;
          return { error: "Template not found" };
        }
        return schema;
      },
      { params: TemplateIdParams },
    )
    .post(
      "/templates/:id/submit",
      async ({ params, body, set }) => {
        try {
          const response = await useCases.submitResponse.execute(
            params.id,
            body.athleteId,
            body.answers,
          );
          set.status = 201;
          return response;
        } catch (error: unknown) {
          if (error instanceof Error) {
            if (error.message === "Template not found") {
              set.status = 404;
              return { error: "Template not found" };
            }
            if (error.message === "Response already submitted") {
              set.status = 409;
              return { error: "Response already submitted for this template" };
            }
          }
          throw error;
        }
      },
      { params: TemplateIdParams, body: SubmitResponseBody },
    );
