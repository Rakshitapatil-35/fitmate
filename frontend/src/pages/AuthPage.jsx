import { useState } from 'react'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BrandWordmark, Button, Eyebrow, TextField } from '../components/DesignSystem.jsx'
import { saveDemoAccount } from '../measurementStorage.js'
import './AuthPage.css'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function PasswordToggle({ visible, onToggle, label }) {
  const Icon = visible ? EyeOff : Eye

  return (
    <button
      className="auth-password-toggle"
      type="button"
      aria-label={`${visible ? 'Hide' : 'Show'} ${label}`}
      aria-pressed={visible}
      onClick={onToggle}
    >
      <Icon size={17} aria-hidden="true" />
    </button>
  )
}

function AuthPage({ mode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isSignup = mode === 'signup'
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '', remember: false, terms: false })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState(() => location.state?.demoAccountDeleted
    ? { type: 'info', text: 'Local demo profile data was removed. You can start a fresh demo profile here.' }
    : null)

  const handleChange = ({ target }) => {
    const { name, type, value, checked } = target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setFeedback(null)
  }

  const validate = () => {
    const nextErrors = {}
    if (isSignup && !values.name.trim()) nextErrors.name = 'Enter your full name.'
    if (!values.email.trim()) nextErrors.email = 'Enter your email address.'
    else if (!emailPattern.test(values.email.trim())) nextErrors.email = 'Enter a valid email address.'
    if (!values.password) nextErrors.password = 'Enter your password.'
    else if (isSignup && values.password.length < 8) nextErrors.password = 'Use at least 8 characters.'
    if (isSignup && !values.confirmPassword) nextErrors.confirmPassword = 'Confirm your password.'
    else if (isSignup && values.password !== values.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.'
    if (isSignup && !values.terms) nextErrors.terms = 'Please accept the terms to continue.'
    return nextErrors
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setFeedback({ type: 'error', text: 'Please review the highlighted fields.' })
      return
    }

    if (isSignup && !saveDemoAccount({ name: values.name, email: values.email })) {
      setFeedback({ type: 'error', text: 'This browser could not save the demo profile. Check local storage settings and try again.' })
      return
    }

    navigate('/dashboard', { state: { demoAuth: isSignup ? 'signup' : 'login' } })
  }

  const showResetMessage = () => {
    setFeedback({ type: 'info', text: 'Password recovery is a demo-only interaction and is not connected to an email service.' })
  }

  return (
    <main className="auth-page">
      <header className="auth-header">
        <BrandWordmark to="/" />
        <Link className="auth-home-link" to="/">Back to FITMATE <ArrowRight size={14} /></Link>
      </header>

      <div className={`auth-layout${isSignup ? ' auth-layout--signup' : ''}`}>
        <aside className="auth-visual">
          <img
            src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85"
            alt="Editorial fashion portrait in soft natural light"
          />
          <div className="auth-visual-caption">
            <Eyebrow>FITMATE</Eyebrow>
            <p>One Body.<br />Every Brand.<br /><em>One Perfect Fit.</em></p>
          </div>
          <span className="auth-image-credit">A MORE PERSONAL WAY TO SHOP</span>
        </aside>

        <section className="auth-panel" aria-labelledby="auth-title">
          <div className="auth-form-wrap">
            <Eyebrow>{isSignup ? 'Your fit profile begins here' : 'Welcome back'}</Eyebrow>
            <h1 id="auth-title">{isSignup ? 'Create your account.' : 'Good to see you.'}</h1>
            <p className="auth-intro">
              {isSignup
                ? 'Create an account to keep your fit profile close, wherever you shop.'
                : 'Sign in to pick up where your personal fit profile left off.'}
            </p>

            <form className="auth-form" noValidate onSubmit={handleSubmit}>
              {feedback && (
                <p className={`auth-feedback auth-feedback--${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>
                  {feedback.text}
                </p>
              )}

              {isSignup && (
                <TextField
                  label="Full name"
                  name="name"
                  autoComplete="name"
                  placeholder="Your name"
                  value={values.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                />
              )}

              <TextField
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={values.email}
                onChange={handleChange}
                error={errors.email}
                required
              />

              <TextField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                placeholder={isSignup ? 'At least 8 characters' : 'Enter your password'}
                value={values.password}
                onChange={handleChange}
                error={errors.password}
                endAction={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword((visible) => !visible)} label="password" />}
                required
              />

              {isSignup && (
                <TextField
                  label="Confirm password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  endAction={<PasswordToggle visible={showConfirmPassword} onToggle={() => setShowConfirmPassword((visible) => !visible)} label="confirm password" />}
                  required
                />
              )}

              {!isSignup && (
                <div className="auth-options">
                  <label className="auth-checkbox-label">
                    <input type="checkbox" name="remember" checked={values.remember} onChange={handleChange} />
                    <span>Remember me</span>
                  </label>
                  <button className="auth-text-button" type="button" onClick={showResetMessage}>Forgot password?</button>
                </div>
              )}

              {isSignup && (
                <div className="auth-terms">
                  <label className="auth-checkbox-label" htmlFor="terms">
                    <input id="terms" type="checkbox" name="terms" checked={values.terms} onChange={handleChange} aria-describedby={errors.terms ? 'terms-error' : undefined} />
                    <span>I agree to the terms and conditions.</span>
                  </label>
                  {errors.terms && <p className="auth-field-error" id="terms-error">{errors.terms}</p>}
                </div>
              )}

              <Button className="auth-submit" type="submit" icon={ArrowRight}>
                {isSignup ? 'Create Account' : 'Login'}
              </Button>
            </form>

            <p className="auth-switch">
              {isSignup ? 'Already have a FITMATE account?' : 'New to FITMATE?'}{' '}
              <Link to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Login' : 'Create an account'}</Link>
            </p>
            <p className="auth-demo-note">
              {isSignup
                ? 'Demo only. Name and email are stored in this browser; your password is never stored or sent.'
                : 'Demo only. No sign-in request is sent and no password is stored.'}
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default AuthPage