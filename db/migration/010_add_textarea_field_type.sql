ALTER TABLE anamnesis_questions
  DROP CONSTRAINT anamnesis_questions_field_type_check,
  ADD CONSTRAINT anamnesis_questions_field_type_check
    CHECK (field_type IN ('text', 'textarea', 'boolean', 'single_choice', 'multi_choice', 'integer'));
