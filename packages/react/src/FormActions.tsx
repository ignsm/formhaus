import type { FormAction } from '@formhaus/core';

interface FormActionsProps {
  submitAction?: FormAction;
  backAction?: FormAction | false;
  cancelAction?: FormAction;
  isFirstStep: boolean;
  isLastStep: boolean;
  isMultiStep: boolean;
  loading?: boolean;
  onSubmit: () => void;
  onNext: () => void;
  onPrev: () => void;
  onCancel: () => void;
}

export function FormActions({
  submitAction,
  backAction,
  cancelAction,
  isFirstStep,
  isLastStep,
  isMultiStep,
  loading,
  onSubmit,
  onNext,
  onPrev,
  onCancel,
}: FormActionsProps) {
  const showBack = isMultiStep && !isFirstStep && backAction !== false;
  const backLabel = typeof backAction === 'object' ? backAction?.label : 'Back';

  function handlePrimary() {
    if (isMultiStep && !isLastStep) {
      onNext();
    } else {
      onSubmit();
    }
  }

  const primaryLabel = isMultiStep && !isLastStep ? 'Continue' : (submitAction?.label ?? 'Submit');

  return (
    <div className="fh-form-actions">
      <div className="fh-form-actions__secondary">
        {showBack && (
          <button
            type="button"
            className="fh-form-actions__btn fh-form-actions__btn--text"
            disabled={loading}
            onClick={onPrev}
          >
            {backLabel}
          </button>
        )}
        {cancelAction && (
          <button
            type="button"
            className="fh-form-actions__btn fh-form-actions__btn--text"
            disabled={loading}
            onClick={onCancel}
          >
            {cancelAction.label}
          </button>
        )}
      </div>
      <button
        type="button"
        className="fh-form-actions__btn fh-form-actions__btn--primary"
        disabled={loading}
        aria-busy={loading}
        onClick={handlePrimary}
      >
        {primaryLabel}
      </button>
    </div>
  );
}
