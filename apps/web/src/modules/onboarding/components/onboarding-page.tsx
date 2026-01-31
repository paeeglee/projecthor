import Form from "@rjsf/core";
import type { IChangeEvent } from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import type { RJSFSchema, UiSchema } from "@rjsf/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  type AnamnesisFormResponse,
  fetchAnamnesisForm,
  submitAnamnesis,
} from "@/modules/onboarding/services/onboarding";
import { Button } from "@/modules/shared/ui/button";
import { Stepper } from "@/modules/onboarding/components/stepper";
import {
  BaseInputTemplate,
  ErrorListTemplate,
  FieldErrorTemplate,
  FieldTemplate,
  ObjectFieldTemplate,
  SelectWidget,
} from "@/modules/onboarding/components/rjsf-templates";

const ATHLETE_ID = "08a245b4-5b57-4893-a101-4f73fcbcb033";

const templates = {
  BaseInputTemplate,
  FieldTemplate,
  ObjectFieldTemplate,
  ErrorListTemplate,
  FieldErrorTemplate,
};

const widgets = {
  SelectWidget,
};

export function OnboardingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AnamnesisFormResponse | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, Record<string, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnamnesisForm()
      .then(setFormData)
      .catch(() => {
        toast.error("Failed to load onboarding form.");
      })
      .finally(() => setLoading(false));
  }, []);

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

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // Flatten all answers and map q_ -> g_
      const flatAnswers: Record<string, string> = {};
      for (const sectionAnswers of Object.values(answers)) {
        for (const [key, value] of Object.entries(sectionAnswers)) {
          const mappedKey = key.replace(/^q_/, "g_");
          flatAnswers[mappedKey] = value;
        }
      }

      await submitAnamnesis({
        athleteId: ATHLETE_ID,
        answers: flatAnswers,
      });

      toast.success("Onboarding completed!");
      navigate("/home", { replace: true });
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  if (!formData || !currentSchema) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-text-muted">Something went wrong.</p>
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
                Back
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isLastStep
                ? isSubmitting
                  ? "Submitting..."
                  : "Finish"
                : "Next"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
