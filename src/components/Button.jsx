import React from 'react';
import './Button.css';

/**
 * Button Component - Design System
 * 
 * Variants:
 * - primary: Accent orange background (main CTA)
 * - secondary: Outline with primary color
 * - ghost: Text only with icon
 * - danger: Red for destructive actions
 * 
 * Usage:
 * <Button variant="primary">Acheter</Button>
 * <Button variant="secondary" icon="📞">Appeler</Button>
 * <Button variant="ghost" disabled>Indisponible</Button>
 */

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  icon = null,
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const buttonClasses = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && 'btn--full',
    loading && 'btn--loading',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <span className="btn__spinner" aria-hidden="true">
          ⏳
        </span>
      )}
      {icon && !loading && (
        <span className="btn__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="btn__text">{children}</span>
    </button>
  );
};

export default Button;
