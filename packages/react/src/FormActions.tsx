import { evaluateCondition } from '@formhaus/core';
import type { FormAction } from '@formhaus/core';
import type { FormActionsProps } from './types';

function isActionDisabled(
  action: FormAction | undefined,
  values: Record<string, unknown>,
  loading?: boolean,
): boolean {
  if (loading) return true;
  if (!action?.disabled || action.disabled.length === 0) return false;
  return action.disabled.every((c) => evaluateCondition(c, values));
}

function buttonClass(action: FormAction | false | undefined, variant: NonNullable<FormAction['variant']>): string {
  return `fh-form-actions__button fh-form-actions__button--${(action && action.variant) || variant}`;
}

export function FormActions({
  submitAction,
  backAction,
  cancelAction,
  skipAction,
  isFirstStep,
  isLastStep,
  isMultiStep,
  loading,
  showPrimary = true,
  values = {},
  onSubmit,
  onNext,
  onPrev,
  onCancel,
  onSkip,
  primaryLabel: primaryLabelProp,
  showBack: showBackProp,
  backLabel: backLabelProp,
  showSkip: showSkipProp,
  skipLabel: skipLabelProp,
  onPrimary: onPrimaryProp,
}: FormActionsProps) {
  const showBack = showBackProp ?? (isMultiStep && !isFirstStep && backAction !== false);
  const backLabel = backLabelProp ?? (typeof backAction === 'object' ? (backAction?.label ?? 'Back') : 'Back');
  const showSkip = !!onSkip && (showSkipProp ?? (isMultiStep && !!skipAction));
  const skipLabel = skipLabelProp ?? skipAction?.label ?? 'Skip';
  const primaryLabel = primaryLabelProp ?? (isMultiStep && !isLastStep ? 'Continue' : (submitAction?.label ?? 'Submit'));

  const primaryDisabled = isActionDisabled(
    isMultiStep && !isLastStep ? undefined : submitAction,
    values,
    loading,
  );

  function handlePrimary() {
    if (onPrimaryProp) {
      onPrimaryProp();
    } else if (isMultiStep && !isLastStep) {
      onNext();
    } else {
      onSubmit();
    }
  }

  return (
    <div className="fh-form-actions">
      <div className="fh-form-actions__secondary">
        {showBack && (
          <button type="button" className={buttonClass(backAction, 'secondary')} disabled={loading} onClick={onPrev}>
            {backLabel}
          </button>
        )}
        {cancelAction && (
          <button type="button" className={buttonClass(cancelAction, 'text')} disabled={loading} onClick={onCancel}>
            {cancelAction.label}
          </button>
        )}
        {showSkip && (
          <button type="button" className={buttonClass(skipAction, 'text')} disabled={loading} onClick={onSkip}>
            {skipLabel}
          </button>
        )}
      </div>
      {showPrimary && <button
        type="button"
        className="fh-form-actions__button fh-form-actions__button--primary"
        disabled={primaryDisabled}
        aria-busy={loading}
        onClick={handlePrimary}
      >
        {primaryLabel}
      </button>}
    </div>
  );
}
