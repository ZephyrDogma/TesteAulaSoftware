import React from 'react';

/**
 * Componente atómico de Botão
 * Respeita acessibilidade, estados disabled (ex: saving) e variantes
 */
export function Button({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  onClick,
  className = '',
  ...props
}) {
  const variantClass = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    danger: 'btn-danger',
  }[variant] || 'btn-primary';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn ${variantClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
