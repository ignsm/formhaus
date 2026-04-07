import type { FieldComponentProps } from '../types';

export function CheckboxField({
  field,
  value,
  error,
  loading,
  disabled,
  onChange,
  onBlur,
}: FieldComponentProps) {
  const inputId = field.key;
  const helperId = `${field.key}-helper`;
  const errorId = `${field.key}-error`;
  const describedBy = error ? errorId : field.helperText ? helperId : undefined;

  return (
    <div className="fh-field fh-field--checkbox">
      <label className="fh-field__checkbox-label" htmlFor={inputId}>
        <input
          id={inputId}
          type="checkbox"
          className="fh-field__checkbox"
          checked={!!value}
          disabled={disabled || loading}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.checked)}
          onBlur={onBlur}
        />
        <span className="fh-field__checkbox-text">{field.label}</span>
      </label>
      {error && (
        <p id={errorId} className="fh-field__error" role="alert">
          {error}
        </p>
      )}
      {!error && field.helperText && (
        <p id={helperId} className="fh-field__helper">
          {field.helperText}
        </p>
      )}
    </div>
  );
}
