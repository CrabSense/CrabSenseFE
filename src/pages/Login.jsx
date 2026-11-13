import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, Droplets, Eye, EyeOff, LoaderCircle, LockKeyhole, Settings, Shell, UserRound, X, CircleAlert, ShieldCheck } from "lucide-react";
import authService from "../services/authService";
import { homePathForRole, isFarmPortalRole, isSystemAdministratorRole } from "../constants/roles";
import useTranslation from "../hooks/useTranslation";
import "./Login.css";

const REMEMBERED_USERNAME_KEY = "crabsense.rememberedUsername";
const LOGO = import.meta.env.BASE_URL + "login/logo.png";

function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState("");
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBERED_USERNAME_KEY);
    if (saved) {
      setUsername(saved);
      setRememberMe(true);
    }
  }, []);

  const clearError = () => {
    setErrorKey("");
    setApiError("");
  };

  const displayedError = errorKey ? t(errorKey) : apiError;
  const hasAuthError = Boolean(displayedError);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    clearError();

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setErrorKey("login.requiredUsername");
      usernameRef.current?.focus();
      return;
    }

    if (!password) {
      setErrorKey("login.requiredPassword");
      passwordRef.current?.focus();
      return;
    }

    try {
      setLoading(true);

      const result = await authService.login(trimmedUsername, password);

      const role = result?.user?.role;
      if (!isFarmPortalRole(role) && !isSystemAdministratorRole(role)) {
        authService.clearAuth();
        setErrorKey("login.noAdminAccess");
        return;
      }

      if (rememberMe) {
        localStorage.setItem(REMEMBERED_USERNAME_KEY, trimmedUsername);
      } else {
        localStorage.removeItem(REMEMBERED_USERNAME_KEY);
      }

      navigate(homePathForRole(role), { replace: true });
    } catch (error) {
      console.error("Login failed:", error);

      const message =
        typeof error?.message === "string" ? error.message.trim() : "";

      setApiError(message || t("login.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };


  const features = [
    { icon: BarChart3, label: t("login.featureMonitor") },
    { icon: Settings, label: t("login.featureManage") },
    { icon: Droplets, label: t("login.featureEnvironment") },
    { icon: Shell, label: t("login.featureYield") },
  ];
  const fieldClass = "login-field" + (hasAuthError ? " login-field-error" : "");

  return (
    <main className="login-workspace">
      <div className="login-shell">
        <header className="login-topbar">
          <div className="login-brand-lockup">
            <img src={LOGO} alt=""  />
            <span>Crab<span className="login-accent">Sense</span></span>
          </div>
          <span className="login-portal"><ShieldCheck size={16} aria-hidden="true" /> {t("nav.adminPortal")}</span>
        </header>

        <div className="login-content">
          <section className="login-brand-panel" aria-label="CrabSense">
            <div className="login-brand-inner">
              <div className="login-logo-tile">
                <img src={LOGO} alt="CrabSense"  />
              </div>
              <div className="login-brand-copy">
                <p className="login-eyebrow">SMART AQUACULTURE · AI + IoT</p>
                <h1>Crab<span>Sense</span></h1>
                <h2>{t("login.farmTitle")}</h2>
                <p>{t("login.tagline")}</p>
              </div>
              <div className="login-features">
                {features.map(({ icon: Icon, label }) => (
                  <div key={label} className="login-feature">
                    <span><Icon size={19} aria-hidden="true" /></span>
                    <p>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="login-form-panel" aria-labelledby="login-heading">
            <div className="login-card">
              <div className="login-card-icon"><LockKeyhole size={22} aria-hidden="true" /></div>
              <h2 id="login-heading">{t("login.welcome")}</h2>
              <p className="login-intro">{t("login.description")}</p>

              <form onSubmit={handleSubmit} noValidate className="login-form">
                <label htmlFor="login-username">{t("login.username")}</label>
                <div className="login-field-wrap">
                  <UserRound size={19} className="login-field-icon" aria-hidden="true" />
                  <input ref={usernameRef} id="login-username" name="username" type="text" value={username}
                    onChange={(event) => { setUsername(event.target.value); clearError(); }}
                    placeholder={t("login.usernamePlaceholder")} autoComplete="username" autoCapitalize="none"
                    spellCheck={false} disabled={loading} aria-invalid={hasAuthError} aria-describedby={displayedError ? "login-error" : undefined} className={fieldClass} />
                </div>

                <label htmlFor="login-password">{t("login.password")}</label>
                <div className="login-field-wrap">
                  <LockKeyhole size={19} className="login-field-icon" aria-hidden="true" />
                  <input ref={passwordRef} id="login-password" name="password" type={showPassword ? "text" : "password"} value={password}
                    onChange={(event) => { setPassword(event.target.value); clearError(); }}
                    placeholder={t("login.passwordPlaceholder")} autoComplete="current-password" disabled={loading}
                    aria-invalid={hasAuthError} aria-describedby={displayedError ? "login-error" : undefined} className={fieldClass + " login-password-field"} />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} disabled={loading}
                    aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")} aria-pressed={showPassword}
                    className="login-password-toggle">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button>
                </div>
                <label className="login-remember" htmlFor="login-remember">
                  <input id="login-remember" type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
                  <span>{t("login.rememberMe")}</span>
                </label>

                {displayedError && (
                  <div id="login-error" role="alert" className="login-error">
                    <CircleAlert size={20} aria-hidden="true" />
                    <div><strong>{t("login.loginFailedTitle")}</strong><p>{displayedError}</p></div>
                    <button type="button" onClick={clearError} aria-label={t("login.dismissError")}><X size={18} /></button>
                  </div>
                )}

                <button type="submit" disabled={loading} aria-busy={loading} className="login-submit">
                  {loading ? <><LoaderCircle size={20} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> {t("login.signIn")}</> : <>{t("login.signIn")} <ArrowRight size={19} aria-hidden="true" /></>}
                </button>
              </form>
              <div className="login-card-footer"><ShieldCheck size={16} aria-hidden="true" /> CrabSense · {t("nav.adminPortal")}</div>
            </div>
          </section>
        </div>
        <footer className="login-footer"><span>{t("login.copyright")}</span><span>CrabSense · AI / IoT</span></footer>
      </div>
    </main>
  );
}
export default Login;
