import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import {
  ArrowRight,
  BarChart3,
  Droplets,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Settings,
  Shell,
  UserRound,
  X,
  CircleAlert,
} from "lucide-react";

import authService from "../services/authService";
import {
  homePathForRole,
  isFarmPortalRole,
  isSystemAdministratorRole,
} from "../constants/roles";
import useTranslation from "../hooks/useTranslation";

const REMEMBERED_USERNAME_KEY = "crabsense.rememberedUsername";

const fontStyle = {
  fontFamily: '"Be Vietnam Pro", "Segoe UI", sans-serif',
};

const textGlow = {
  textShadow: "0 0 10px rgba(255,255,255,0.9), 0 0 18px rgba(255,255,255,0.55)",
};

function KnockoutImage({ src, alt = "", className = "" }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ filter: "url(#login-knockout-black)" }}
    />
  );
}

KnockoutImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
};

function FeatureRow({ t }) {
  const items = [
    { icon: BarChart3, label: t("login.featureMonitor") },
    { icon: Settings, label: t("login.featureManage") },
    { icon: Droplets, label: t("login.featureEnvironment") },
    { icon: Shell, label: t("login.featureYield") },
  ];

  return (
    <div className="mx-auto grid w-full min-w-0 max-w-[420px] grid-cols-4 gap-1 min-[960px]:gap-3">
      {items.map(({ icon: Icon, label }) => (
        <div key={label} className="min-w-0 text-center">
          <div
            className="mx-auto flex h-11 w-11 items-center justify-center rounded-full text-white shadow-[0_4px_10px_rgba(46,155,95,0.32)] min-[960px]:h-[52px] min-[960px]:w-[52px]"
            style={{
              background: "linear-gradient(135deg, #3FA86A, #1B6B3A)",
            }}
          >
            <Icon size={22} strokeWidth={2.2} aria-hidden="true" />
          </div>
          <p
            className="mt-2 whitespace-pre-line text-[10px] font-bold leading-[1.25] text-[#0F2A1C] min-[960px]:text-[11.5px]"
            style={textGlow}
          >
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}

FeatureRow.propTypes = {
  t: PropTypes.func.isRequired,
};

function BrandColumn({ t }) {
  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-3 min-[960px]:h-full min-[960px]:min-h-0 min-[960px]:gap-2">
      <div className="min-[960px]:flex min-[960px]:min-h-0 min-[960px]:flex-[4] min-[960px]:items-end">
        <div className="grid w-full grid-cols-1 items-end min-[960px]:grid-cols-[2fr_7fr]">
          <span className="hidden min-[960px]:block" />
          <img
            src="/login/logo.png"
            alt="CrabSense"
            className="mx-auto block h-[132px] w-auto max-w-full object-contain min-[960px]:h-[180px]"
          />
        </div>
      </div>

      <div className="min-[960px]:flex min-[960px]:min-h-0 min-[960px]:flex-[5] min-[960px]:justify-center">
        <div className="grid w-full grid-cols-1 min-[960px]:grid-cols-[2fr_7fr]">
          <span className="hidden min-[960px]:block" />
          <div className="text-center">
            <h1
              className="bg-gradient-to-r from-[#1B8A4A] via-[#1A8A85] to-[#1A6FB5] bg-clip-text text-[40px] font-extrabold leading-[1.05] tracking-[-0.6px] text-transparent min-[960px]:text-[52px]"
              style={textGlow}
            >
              CrabSense
            </h1>
            <p
              className="mt-2 max-w-full text-[11px] font-extrabold tracking-[0.3px] text-[#163A5C] min-[960px]:text-[16px] min-[960px]:tracking-[0.8px]"
              style={textGlow}
            >
              {t("login.farmTitle")}
            </p>
            <p
              className="mt-2 max-w-full text-[12px] font-medium text-[#5A6B75] min-[960px]:text-[14.5px]"
              style={textGlow}
            >
              {t("login.tagline")}
            </p>
            <div className="mx-auto mt-2 mb-[22px] h-[2.5px] w-[180px] rounded-sm bg-gradient-to-r from-[#2E9B5F] to-[#2E9B5F]/10" />
            <FeatureRow t={t} />
          </div>
        </div>
      </div>

      <div className="min-[960px]:flex min-[960px]:min-h-0 min-[960px]:flex-[3] min-[960px]:items-end">
        <div className="grid w-full grid-cols-1 items-end min-[960px]:grid-cols-[2fr_4fr_3fr]">
          <span className="hidden min-[960px]:block" />
          <span className="hidden min-[960px]:block" />
          <img
            src="/login/Sologan_Login.png"
            alt=""
            className="ml-auto block h-[100px] w-auto max-w-[220px] origin-bottom-right -rotate-[3.5deg] object-contain object-right min-[960px]:ml-3 min-[960px]:h-[150px] min-[960px]:max-w-none"
          />
        </div>
      </div>
    </div>
  );
}

BrandColumn.propTypes = {
  t: PropTypes.func.isRequired,
};

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

  const fieldClass = [
    "h-[54px] w-full rounded-[13px] border bg-[#F3F6F5] pl-11 pr-4",
    "text-[14.5px] font-medium text-[#163A5C]",
    "placeholder:font-normal placeholder:text-[#8A9BA3]",
    "outline-none transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-60",
    hasAuthError
      ? "border-[#FECACA] bg-[#FFF7F7] focus:border-[#F87171]"
      : "border-[#D0DDD6] focus:border-[#1A8A85]",
  ].join(" ");

  const card = (
    <div className="relative w-full min-w-0 max-w-[440px]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-3.5 -right-2 h-7 w-[86px] rotate-[23deg] rounded-full bg-[#2E9B5F]/40"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-3 -left-2.5 h-[30px] w-[100px] -rotate-[17deg] rounded-full bg-[#1A8A85]/30"
      />

      <div className="relative overflow-hidden rounded-[28px] border border-white/90 bg-[#FFFFF8] shadow-[0_14px_32px_rgba(0,0,0,0.12),0_6px_20px_rgba(13,92,61,0.08)]">
        <KnockoutImage
          src="/login/background_right.png"
          className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[72px] object-cover object-right min-[640px]:block"
        />

        <form
          onSubmit={handleSubmit}
          noValidate
          className="relative px-6 pt-[26px] pb-[26px] min-[640px]:pr-20 min-[640px]:pl-8"
        >
          <h2 className="text-center text-[24px] font-extrabold text-[#163A5C]">
            {t("login.welcome")}
          </h2>
          <p className="mt-2 text-center text-[13px] leading-[1.4] text-[#5A6B75]">
            {t("login.description")}
          </p>

          <label
            htmlFor="login-username"
            className="mt-6 block text-[12.5px] font-bold text-[#163A5C]"
          >
            {t("login.username")}
          </label>
          <div className="relative mt-[7px]">
            <UserRound
              size={21}
              aria-hidden="true"
              className={`pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 ${
                hasAuthError ? "text-[#DC2626]" : "text-[#1A8A85]"
              }`}
            />
            <input
              ref={usernameRef}
              id="login-username"
              name="username"
              type="text"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                clearError();
              }}
              placeholder={t("login.usernamePlaceholder")}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              disabled={loading}
              aria-invalid={hasAuthError}
              className={fieldClass}
            />
          </div>

          <label
            htmlFor="login-password"
            className="mt-3.5 block text-[12.5px] font-bold text-[#163A5C]"
          >
            {t("login.password")}
          </label>
          <div className="relative mt-[7px]">
            <LockKeyhole
              size={21}
              aria-hidden="true"
              className={`pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 ${
                hasAuthError ? "text-[#DC2626]" : "text-[#1A8A85]"
              }`}
            />
            <input
              ref={passwordRef}
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                clearError();
              }}
              placeholder={t("login.passwordPlaceholder")}
              autoComplete="current-password"
              disabled={loading}
              aria-invalid={hasAuthError}
              className={`${fieldClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              disabled={loading}
              aria-label={
                showPassword ? t("login.hidePassword") : t("login.showPassword")
              }
              aria-pressed={showPassword}
              className="absolute top-1/2 right-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#8A9BA3] hover:bg-black/5 disabled:opacity-50"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <label
              htmlFor="login-remember"
              className="flex min-w-0 items-center gap-1.5 text-[12.5px] text-[#5A6B75]"
            >
              <input
                id="login-remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-[18px] w-[18px] shrink-0 accent-[#0D5C3D]"
              />
              <span className="truncate">{t("login.rememberMe")}</span>
            </label>
            <button
              type="button"
              className="shrink-0 text-[12.5px] font-semibold text-[#2B6F9A]"
            >
              {t("login.forgotPassword")}
            </button>
          </div>

          {displayedError && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] py-3 pr-1.5 pl-3"
            >
              <CircleAlert
                size={22}
                className="mt-px shrink-0 text-[#DC2626]"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] leading-[1.3] font-bold text-[#991B1B]">
                  {t("login.loginFailedTitle")}
                </p>
                <p className="mt-1 text-[12.5px] leading-[1.4] font-medium text-[#B91C1C]">
                  {displayedError}
                </p>
              </div>
              <button
                type="button"
                onClick={clearError}
                aria-label={t("login.dismissError")}
                className="flex h-7 w-7 shrink-0 items-center justify-center text-[#DC2626]"
              >
                <X size={18} />
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex h-[54px] w-full items-center justify-center gap-2 rounded-[13px] text-[15.5px] font-bold text-white shadow-[0_5px_14px_rgba(26,138,133,0.35)] transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
            style={{
              background:
                "linear-gradient(90deg, #147A8F 0%, #1A8A7A 50%, #2E9B5F 100%)",
            }}
          >
            {loading ? (
              <LoaderCircle size={24} className="animate-spin" aria-hidden="true" />
            ) : (
              <>
                {t("login.signIn")}
                <ArrowRight size={20} aria-hidden="true" />
              </>
            )}
          </button>

          <div className="mt-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#D5DED8]" />
            <span className="text-[12px] text-[#8A9BA3]">{t("login.or")}</span>
            <span className="h-px flex-1 bg-[#D5DED8]" />
          </div>

          <button
            type="button"
            className="mt-3.5 flex h-12 w-full items-center justify-center gap-1.5 rounded-[13px] border border-[#C5D2CA] bg-white text-[13px] font-semibold text-[#163A5C]"
          >
            {t("login.register")}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <main
      className="relative isolate min-h-dvh w-full overflow-x-hidden overflow-y-auto bg-[#E8F2EC] text-[#163A5C]"
      style={{ ...fontStyle, colorScheme: "light" }}
    >
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id="login-knockout-black" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0.33 0.5 0.17 0 0"
          />
        </filter>
      </svg>

      <img
        src="/login/Nen_Login.png"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[55%_center]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.33) 0%, rgba(255,255,255,0.13) 50%, rgba(232,245,238,0.2) 100%)",
        }}
      />

      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] min-[960px]:block">
        <KnockoutImage
          src="/login/background_right.png"
          className="h-full w-full object-contain object-bottom-right"
        />
      </div>

      <KnockoutImage
        src="/login/slogan_right_tv.png"
        alt=""
        className="pointer-events-none absolute top-7 right-9 hidden h-[88px] min-[960px]:block"
      />
      <KnockoutImage
        src="/login/slogan_right-en.png"
        alt=""
        className="pointer-events-none absolute right-7 bottom-16 hidden h-20 min-[960px]:block"
      />

      <div className="relative z-10 flex min-h-dvh w-full min-w-0 flex-col">
        <div className="box-border w-full min-w-0 flex-1 overflow-x-hidden px-5 py-4 min-[960px]:flex min-[960px]:items-center min-[960px]:px-7 min-[960px]:pr-10">
          <div className="mx-auto box-border flex w-full min-w-0 max-w-full flex-col items-center justify-center gap-5 min-[960px]:grid min-[960px]:h-full min-[960px]:max-w-[1280px] min-[960px]:grid-cols-[12fr_10fr] min-[960px]:items-stretch min-[960px]:gap-3">
            <BrandColumn t={t} />
            <div className="flex w-full min-w-0 items-center justify-center py-2">
              {card}
            </div>
          </div>
        </div>

        <footer className="px-9 pt-1 pb-3.5">
          <div className="flex flex-col items-center gap-2 text-center min-[720px]:flex-row min-[720px]:text-left">
            <p
              className="text-[11.5px] font-semibold text-[#0F2A1C] min-[720px]:flex-1"
              style={textGlow}
            >
              {t("login.copyright")}
            </p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 min-[960px]:mr-36">
              {["policy", "terms", "help", "contact"].map((key) => (
                <span
                  key={key}
                  className="text-[11.5px] font-semibold text-[#0F2A1C] underline decoration-[#0D5C3D]"
                  style={textGlow}
                >
                  {t(`login.${key}`)}
                </span>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

export default Login;
