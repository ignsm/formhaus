import type { FieldComponentProps } from '../types';

export function RadioField({
  field,
  value,
  error,
  loading,
  disabled,
  onChange,
  onBlur,
}: FieldComponentProps) {
  const groupId = field.key;
  const helperId = `${field.key}-helper`;
  const errorId = `${field.key}-error`;
  const describedBy = error ? errorId : field.helperText ? helperId : undefined;
  const options = field.options ?? [];

  return (
    <div className="fh-field fh-field--radio">
      <fieldset
        className="fh-field__fieldset"
        aria-invalid={!!error}
        aria-describedby={describedBy}
      >
        {field.label && <legend className="fh-field__legend">{field.label}</legend>}
        <div className="fh-field__radio-group">
          {options.map((opt) => {
            const optionId = `${groupId}-${opt.value}`;
            return (
              <label key={opt.value} className="fh-field__radio-label" htmlFor={optionId}>
                <input
                  id={optionId}
                  type="radio"
                  className="fh-field__radio"
                  name={groupId}
                  value={opt.value}
                  checked={value === opt.value}
                  disabled={disabled || loading}
                  onChange={() => onChange(opt.value)}
                  onBlur={onBlur}
                />
                <span className="fh-field__radio-text">{opt.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
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
