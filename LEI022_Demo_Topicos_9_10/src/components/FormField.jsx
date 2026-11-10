import React from 'react';

/**
 * Campo de Formulário com Acessibilidade Rigorosa
 * Baseado no Slide 15:
 * - <label htmlFor="...">
 * - <input id="..." aria-invalid={!!error} aria-describedby="...">
 * - <p id="...-err" role="alert">{error}</p>
 */
export function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  ...props
}) {
  const errorId = `${id}-err`;
  const hasError = Boolean(error);

  return (
    <div className="form-group">
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true" style={{ color: 'var(--color-danger)' }}> *</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        className="input"
        {...props}
      />
      {hasError && (
        <p id={errorId} role="alert" className="form-error">
          {error}
        </p>
      )}
    </div>
  );
}
