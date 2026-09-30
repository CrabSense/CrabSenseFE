import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import logo from '../assets/LOGO2.png'
import '../styles/Login.css'

function Login() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')

    if (!username.trim() || !password) {
      setError('Please enter your username/email and password.')
      return
    }

    try {
      setLoading(true)

      const result = await authService.login(
        username.trim(),
        password
      )

      if (result.user.role !== 'SystemAdmin') {
        authService.clearAuth()
        setError('This account does not have administrator access.')
        return
      }

      navigate('/dashboard', {
        replace: true,
      })
    } catch (error) {
      setError(
        error.message || 'Invalid username or password.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-glow login-glow-one" />
      <div className="login-glow login-glow-two" />

      <div className="login-wrapper">

        {/* LEFT */}
        <section className="login-visual">
          <div className="login-logo-wrapper">
            <img
              src={logo}
              alt="CrabSense"
              className="login-logo"
            />
          </div>

          <div className="login-brand-text">
            <h1>
              Smart Crab Farming.
              <span> Smarter Management.</span>
            </h1>

            <p>
              Monitor, analyze and manage your CrabSense
              ecosystem from one intelligent platform.
            </p>
          </div>

          <div className="login-system-status">
            <span className="status-dot" />
            CrabSense Management Platform
          </div>
        </section>

        {/* RIGHT */}
        <section className="login-panel">
          <div className="login-card">

            <div className="login-heading">
              <span className="login-label">
                ADMIN PORTAL
              </span>

              <h2>Welcome back</h2>

              <p>
                Sign in to access the CrabSense administration
                dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label htmlFor="username">
                  Username or Email
                </label>

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  placeholder="Enter username or email"
                  autoComplete="username"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Password
                </label>

                <div className="password-field">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="login-spinner" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

            </form>

            <div className="login-footer">
              <span className="footer-line" />

              <p>
                Secure access · CrabSense
              </p>

              <span className="footer-line" />
            </div>

          </div>
        </section>

      </div>
    </div>
  )
}

export default Login