import React from 'react';
import './Badge.css';

/**
 * Badge Component - Design System
 * 
 * Types:
 * - success: Green (Available, In Stock)
 * - warning: Orange (Low Stock, Limited)
 * - danger: Red (Out of Stock, Unavailable)
 * - info: Blue (New, Featured)
 * - neutral: Gray (Default)
 * 
 * Usage:
 * <Badge type="success">Disponible</Badge>
 * <Badge type="warning">Stock limité</Badge>
 * <Badge type="danger">Rupture</Badge>
 */

const Badge = ({
  children,
  type = 'neutral',
  size = 'medium',
  className = '',
  ...props
}) => {
  const badgeClasses = [
    'badge',
    `badge--${type}`,
    `badge--${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
};

export default Badge;
