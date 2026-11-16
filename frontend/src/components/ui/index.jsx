import './ui.css'
import { Eye, EyeOff } from 'lucide-react'

const buttonVariants = {
  primary: 'button-dark',
  secondary: 'button-quiet',
  inverse: 'button-light',
}

export function BrandMark({ href = '#home', inverse = false, className = '' }) {
  const classes = ['brand', inverse && 'brand-light', className].filter(Boolean).join(' ')

  return (
    <a className={classes} href={href} aria-label="FITMATE home">
      FITMATE<span className="brand-period">.</span>
    </a>
  )
}

export function Button({
  variant = 'primary',
  href,
  type = 'button',
  className = '',
  children,
  ...props
}) {
  const classes = ['button', buttonVariants[variant] ?? buttonVariants.primary, className]
    .filter(Boolean)
    .join(' ')

  if (href) {
    return (
      <a className={classes} href={href} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  )
}

export function Eyebrow({ children, dot = false, className = '' }) {
  const classes = ['eyebrow', className].filter(Boolean).join(' ')

  return (
    <span className={classes}>
      {dot && <span className="eyebrow-dot" aria-hidden="true" />}
      {children}
    </span>
  )
}

export function SectionHeading({ eyebrow, description, className = '', children }) {
  const classes = ['section-heading', className].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <div>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2>{children}</h2>
      </div>
      {description && <p className="section-intro">{description}</p>}
    </div>
  )
}

export function SurfaceCard({ as: Element = 'article', className = '', children, ...props }) {
  const classes = ['surface-card', className].filter(Boolean).join(' ')

  return (
    <Element className={classes} {...props}>
      {children}
    </Element>
  )
}

export function TextField({ id, label, hint, className = '', ...inputProps }) {
  const hintId = hint ? `${id}-hint` : undefined
  const classes = ['ui-field', className].filter(Boolean).join(' ')

  return (
    <label className={classes} htmlFor={id}>
      <span>{label}</span>
      {hint && <small id={hintId}>{hint}</small>}
      <input id={id} aria-describedby={hintId} {...inputProps} />
    </label>
  )
}

export function PasswordField({
  id,
  label,
  visible,
  onToggle,
  hint,
  className = '',
  ...inputProps
}) {
  const hintId = hint ? `${id}-hint` : undefined
  const classes = ['ui-field', 'ui-password-field', className].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <label htmlFor={id}>{label}</label>
      {hint && <small id={hintId}>{hint}</small>}
      <div className="password-input-wrap">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          aria-describedby={hintId}
          {...inputProps}
        />
        <button
          className="password-toggle"
          type="button"
          aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
          aria-pressed={visible}
          onClick={onToggle}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  )
}
