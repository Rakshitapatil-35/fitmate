import { useId } from 'react'
import { Link } from 'react-router-dom'
import './DesignSystem.css'

export function BrandWordmark({ href = '#home', to, className = '', ...props }) {
  const classes = `fm-wordmark ${className}`.trim()
  const content = <>
      FITMATE<span className="fm-wordmark__period">.</span>
  </>

  if (to) return <Link className={classes} to={to} aria-label="FITMATE home" {...props}>{content}</Link>
  return <a className={classes} href={href} aria-label="FITMATE home" {...props}>{content}</a>
}

export function Eyebrow({ children, className = '', ...props }) {
  return (
    <p className={`fm-eyebrow ${className}`.trim()} {...props}>
      <span className="fm-eyebrow__rule" aria-hidden="true" />
      {children}
    </p>
  )
}

export function Button({
  href,
  to,
  variant = 'primary',
  size = 'regular',
  icon: Icon,
  className = '',
  type = 'button',
  children,
  ...props
}) {
  const classes = `fm-button fm-button--${variant} fm-button--${size} ${className}`.trim()
  const content = <>{children}{Icon && <Icon className="fm-button__icon" size={16} aria-hidden="true" />}</>

  if (to) {
    return <Link className={classes} to={to} {...props}>{content}</Link>
  }

  if (href) {
    return <a className={classes} href={href} {...props}>{content}</a>
  }

  return <button className={classes} type={type} {...props}>{content}</button>
}

export function TextField({
  id,
  label,
  hint,
  error,
  endAction,
  className = '',
  required = false,
  ...inputProps
}) {
  const generatedId = useId()
  const fieldId = id || generatedId
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errorId = error ? `${fieldId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={`fm-field ${className}`.trim()}>
      <label className="fm-field__label" htmlFor={fieldId}>
        {label}{required && <span className="fm-field__required" aria-hidden="true">*</span>}
      </label>
      <div className={`fm-input-wrap${endAction ? ' fm-input-wrap--action' : ''}`}>
        <input
          className={`fm-input${error ? ' fm-input--invalid' : ''}`}
          id={fieldId}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          {...inputProps}
        />
        {endAction && <div className="fm-input-action">{endAction}</div>}
      </div>
      {hint && <p className="fm-field__hint" id={hintId}>{hint}</p>}
      {error && <p className="fm-field__error" id={errorId}>{error}</p>}
    </div>
  )
}

export function Surface({ as: Element = 'div', className = '', children, ...props }) {
  return <Element className={`fm-surface ${className}`.trim()} {...props}>{children}</Element>
}
