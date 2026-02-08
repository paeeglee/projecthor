import type { IChangeEvent } from "@rjsf/core";
import Form from "@rjsf/core";
import type { RJSFSchema, UiSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  BaseInputTemplate,
  ErrorListTemplate,
  FieldErrorTemplate,
  FieldTemplate,
  ObjectFieldTemplate,
  SelectWidget,
  TextareaWidget,
} from "@/modules/onboarding/components/rjsf-templates";
import { Stepper } from "@/modules/onboarding/components/stepper";
import {
  fetchAnamnesisForm,
  submitAnamnesis,
} from "@/modules/onboarding/services/onboarding";
import { Button } from "@/modules/shared/ui/button";

const templates = {
  BaseInputTemplate,
  FieldTemplate,
  ObjectFieldTemplate,
  ErrorListTemplate,
  FieldErrorTemplate,
};

const widgets = {
  SelectWidget,
  textarea: TextareaWidget,
};

export function OnboardingPage() {
  const navigate = useNavigate();
  const { data: formData, isLoading: loading } = useQuery({
    queryKey: ["anamnesis-form"],
    queryFn: fetchAnamnesisForm,
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, Record<string, string>>
  >({});
  const submitMutation = useMutation({
    mutationFn: submitAnamnesis,
    onSuccess: () => {
      toast.success("Configuração concluída!");
      navigate("/preparing", {
        state: { fromOnboarding: true },
        replace: true,
      });
    },
    onError: () => {
      toast.error("Falha ao enviar. Tente novamente.");
    },
  });

  const stepOrder = useMemo(
    () => formData?.uiSchema["ui:order"] ?? [],
    [formData],
  );

  const steps = useMemo(
    () =>
      stepOrder.map((key) => ({
        key,
        title: formData?.jsonSchema.properties[key]?.title ?? key,
      })),
    [stepOrder, formData],
  );

  const currentStepKey = stepOrder[currentStep];

  const currentSchema = useMemo((): RJSFSchema | null => {
    if (!formData || !currentStepKey) return null;
    const section = formData.jsonSchema.properties[currentStepKey];
    if (!section) return null;
    return {
      type: "object",
      required: section.required,
      properties: section.properties as RJSFSchema["properties"],
    };
  }, [formData, currentStepKey]);

  const currentUiSchema = useMemo((): UiSchema => {
    if (!formData || !currentStepKey) return {};
    const sectionUi = formData.uiSchema[currentStepKey] as
      | Record<string, unknown>
      | undefined;
    const uiSchema: UiSchema = { ...sectionUi };

    // Auto-assign SelectWidget to enum fields
    if (currentSchema?.properties) {
      for (const [fieldKey, fieldSchema] of Object.entries(
        currentSchema.properties,
      )) {
        if (typeof fieldSchema === "object" && "enum" in fieldSchema) {
          uiSchema[fieldKey] = {
            ...((uiSchema[fieldKey] as Record<string, unknown>) ?? {}),
            "ui:widget": "SelectWidget",
          };
        }
      }
    }

    return uiSchema;
  }, [formData, currentStepKey, currentSchema]);

  const isLastStep = currentStep === stepOrder.length - 1;

  const handleChange = useCallback(
    (e: IChangeEvent) => {
      if (!currentStepKey) return;
      setAnswers((prev) => ({
        ...prev,
        [currentStepKey]: e.formData,
      }));
    },
    [currentStepKey],
  );

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, stepOrder.length - 1));
  }, [stepOrder.length]);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleSubmit = useCallback(() => {
    const flatAnswers: Record<string, string> = {};
    for (const sectionAnswers of Object.values(answers)) {
      for (const [key, value] of Object.entries(sectionAnswers)) {
        const mappedKey = key.replace(/^q_/, "g_");
        flatAnswers[mappedKey] = value;
      }
    }
    submitMutation.mutate({ answers: flatAnswers });
  }, [answers, submitMutation]);

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-text-muted">Carregando...</p>
      </div>
    );
  }

  if (!formData || !currentSchema) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-text-muted">Algo deu errado.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col py-6">
      <div className="mb-8">
        <Stepper steps={steps} currentStep={currentStep} />
      </div>

      <div className="flex-1">
        <Form
          schema={currentSchema}
          uiSchema={currentUiSchema}
          formData={answers[currentStepKey] ?? {}}
          onChange={handleChange}
          onSubmit={isLastStep ? handleSubmit : handleNext}
          templates={templates}
          widgets={widgets}
          validator={validator}
          noHtml5Validate
        >
          <div className="mt-8 flex gap-3">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleBack}
              >
                Voltar
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1"
              disabled={submitMutation.isPending}
            >
              {isLastStep
                ? submitMutation.isPending
                  ? "Enviando..."
                  : "Concluir"
                : "Próximo"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
