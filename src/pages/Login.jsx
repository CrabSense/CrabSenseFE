import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import authService from "../services/authService";
import useTranslation from "../hooks/useTranslation";

import logo from "../assets/LOGO2.png";

const inputClassName = [
  "h-[52px] w-full rounded-xl",
  "border-[#304436] bg-[#0D1510]",
  "pl-11 pr-4",
  "text-[14px] text-[#F4F7F4]",
  "placeholder:text-[#748277]",
  "transition-colors duration-200",
  "hover:border-[#77FF00]/35",
  "focus-visible:border-[#77FF00]/60",
  "focus-visible:ring-2",
  "focus-visible:ring-[#77FF00]/15",
  "disabled:cursor-not-allowed",
  "disabled:opacity-60",
].join(" ");

function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState("");
  const [apiError, setApiError] = useState("");

  const clearError = () => {
    setErrorKey("");
    setApiError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    clearError();

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setErrorKey("login.requiredFields");
      usernameRef.current?.focus();
      return;
    }

    if (!password) {
      setErrorKey("login.requiredFields");
      passwordRef.current?.focus();
      return;
    }

    try {
      setLoading(true);

      const result = await authService.login(trimmedUsername, password);

      if (result?.user?.role !== "SystemAdmin") {
        authService.clearAuth();
        setErrorKey("login.noAdminAccess");
        return;
      }

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("Login failed:", error);

      const message =
        typeof error?.message === "string" ? error.message.trim() : "";

      if (message) {
        setApiError(message);
      } else {
        setErrorKey("login.invalidCredentials");
      }
    } finally {
      setLoading(false);
    }
  };

  const displayedError = errorKey ? t(errorKey) : apiError;

  return (
    <main
      className={[
        "relative isolate flex min-h-dvh w-full",
        "items-center justify-center",
        "overflow-hidden bg-[#050806]",
        "px-6 py-8 text-[#F4F7F4]",
        "sm:px-8",
        "max-[600px]:items-stretch",
        "max-[600px]:px-0",
        "max-[600px]:py-0",
      ].join(" ")}
    >
      {/* BACKGROUND DECORATION */}
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute",
          "-left-40 top-[8%]",
          "h-[380px] w-[380px]",
          "rounded-full bg-[#77FF00]/[0.08]",
          "blur-[110px]",
        ].join(" ")}
      />

      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute",
          "-bottom-40 -right-28",
          "h-[340px] w-[340px]",
          "rounded-full bg-[#48E600]/[0.06]",
          "blur-[110px]",
        ].join(" ")}
      />

      {/* MAIN CONTAINER */}
      <div
        className={[
          "relative z-10 grid w-full",
          "max-w-[1120px]",
          "grid-cols-[1.1fr_0.9fr]",
          "overflow-hidden rounded-[24px]",
          "border border-[#77FF00]/15",
          "bg-[#080E0A]",
          "shadow-[0_32px_90px_rgba(0,0,0,0.55)]",
          "lg:min-h-[620px]",
          "max-[900px]:max-w-[540px]",
          "max-[900px]:grid-cols-1",
          "max-[600px]:min-h-dvh",
          "max-[600px]:rounded-none",
          "max-[600px]:border-0",
        ].join(" ")}
      >
        {/* LEFT - BRAND */}
        <section
          className={[
            "relative flex flex-col",
            "items-center justify-center",
            "overflow-hidden",
            "border-r border-[#77FF00]/10",
            "bg-[linear-gradient(145deg,#0C1A0E_0%,#070C08_100%)]",
            "px-10 py-12",
            "max-[900px]:border-b",
            "max-[900px]:border-r-0",
            "max-[900px]:px-8",
            "max-[900px]:py-7",
            "max-[600px]:px-5",
            "max-[600px]:py-6",
          ].join(" ")}
        >
          {/* SOFT GLOW BEHIND LOGO */}
          <div
            aria-hidden="true"
            className={[
              "pointer-events-none absolute",
              "left-1/2 top-1/3",
              "h-[320px] w-[320px]",
              "-translate-x-1/2",
              "rounded-full",
              "bg-[#77FF00]/[0.07]",
              "blur-[80px]",
            ].join(" ")}
          />

          {/* LOGO */}
          <div
            className={[
              "relative z-10 flex",
              "w-full max-w-[340px]",
              "items-center justify-center",
              "max-[900px]:max-w-[210px]",
              "max-[600px]:max-w-[150px]",
            ].join(" ")}
          >
            <img
              src={logo}
              alt="CrabSense"
              className={[
                "block h-auto w-full",
                "max-h-[320px] object-contain",
                "drop-shadow-[0_0_20px_rgba(119,255,0,0.12)]",
                "max-[900px]:max-h-[180px]",
                "max-[600px]:max-h-[125px]",
              ].join(" ")}
            />
          </div>

          {/* BRAND MESSAGE */}
          <div
            className={[
              "relative z-10 mt-5",
              "max-w-[470px] text-center",
              "max-[900px]:mt-2",
            ].join(" ")}
          >
            <h1
              className={[
                "text-[30px] font-bold",
                "leading-[1.25]",
                "tracking-[-0.7px]",
                "max-[900px]:text-[24px]",
                "max-[600px]:text-[20px]",
              ].join(" ")}
            >
              {t("login.brandTitle")}
              <span className="text-[#77FF00]">
                {" "}
                {t("login.brandHighlight")}
              </span>
            </h1>

            <p
              className={[
                "mx-auto mt-4 max-w-[420px]",
                "text-[13px] leading-7",
                "text-[#9BA99E]",
                "max-[900px]:hidden",
              ].join(" ")}
            >
              {t("login.brandDescription")}
            </p>
          </div>

          {/* PLATFORM FOOTER */}
          <div
            className={[
              "absolute bottom-7 left-8",
              "flex items-center gap-2",
              "text-[11px] text-[#78887C]",
              "max-[900px]:hidden",
            ].join(" ")}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#77FF00]" />
            {t("login.systemStatus")}
          </div>
        </section>

        {/* RIGHT - LOGIN FORM */}
        <section
          className={[
            "flex items-center justify-center",
            "px-10 py-12",
            "max-[900px]:px-10",
            "max-[900px]:py-10",
            "max-[600px]:px-6",
            "max-[600px]:py-9",
          ].join(" ")}
        >
          <div className="w-full max-w-[390px]">
            {/* HEADING */}
            <div className="mb-8">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck
                  size={16}
                  className="text-[#77FF00]"
                  aria-hidden="true"
                />

                <span className="text-[10px] font-bold tracking-[0.18em] text-[#77FF00]">
                  {t("login.adminPortal")}
                </span>
              </div>

              <h2
                className={[
                  "text-[32px] font-bold",
                  "tracking-[-0.8px]",
                  "text-white",
                  "max-[600px]:text-[28px]",
                ].join(" ")}
              >
                {t("login.welcome")}
              </h2>

              <p className="mt-3 text-[13px] leading-6 text-[#98A69C]">
                {t("login.description")}
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* USERNAME */}
              <div className="space-y-2.5">
                <Label
                  htmlFor="login-username"
                  className="text-[13px] font-semibold text-[#DCE4DE]"
                >
                  {t("login.username")}
                </Label>

                <div className="relative">
                  <UserRound
                    size={17}
                    aria-hidden="true"
                    className={[
                      "pointer-events-none absolute",
                      "left-4 top-1/2",
                      "-translate-y-1/2",
                      "text-[#829184]",
                    ].join(" ")}
                  />

                  <Input
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
                    aria-invalid={Boolean(displayedError)}
                    className={inputClassName}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-2.5">
                <Label
                  htmlFor="login-password"
                  className="text-[13px] font-semibold text-[#DCE4DE]"
                >
                  {t("login.password")}
                </Label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    aria-hidden="true"
                    className={[
                      "pointer-events-none absolute",
                      "left-4 top-1/2",
                      "-translate-y-1/2",
                      "text-[#829184]",
                    ].join(" ")}
                  />

                  <Input
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
                    aria-invalid={Boolean(displayedError)}
                    className={[inputClassName, "pr-14"].join(" ")}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? t("login.hidePassword")
                        : t("login.showPassword")
                    }
                    aria-pressed={showPassword}
                    className={[
                      "absolute right-3 top-1/2",
                      "flex h-9 w-9",
                      "-translate-y-1/2",
                      "items-center justify-center",
                      "rounded-lg text-[#77FF00]",
                      "transition-colors",
                      "hover:bg-[#77FF00]/10",
                      "focus-visible:outline-none",
                      "focus-visible:ring-2",
                      "focus-visible:ring-[#77FF00]/40",
                      "disabled:opacity-50",
                    ].join(" ")}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* ERROR */}
              {displayedError && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className={[
                    "flex items-start gap-2.5",
                    "rounded-xl border",
                    "border-red-500/25",
                    "bg-red-500/[0.08]",
                    "px-3.5 py-3",
                    "text-[13px] leading-5",
                    "text-red-300",
                  ].join(" ")}
                >
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />

                  <span>{displayedError}</span>
                </div>
              )}

              {/* SIGN IN */}
              <Button
                type="submit"
                disabled={loading}
                className={[
                  "mt-2 h-[52px] w-full",
                  "rounded-xl",
                  "bg-[#77FF00]",
                  "text-[14px] font-bold",
                  "text-[#050806]",
                  "shadow-[0_8px_28px_rgba(119,255,0,0.12)]",
                  "transition-all duration-200",
                  "hover:bg-[#65E800]",
                  "hover:shadow-[0_10px_30px_rgba(119,255,0,0.20)]",
                  "focus-visible:ring-2",
                  "focus-visible:ring-[#77FF00]/50",
                  "disabled:cursor-not-allowed",
                  "disabled:opacity-60",
                ].join(" ")}
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                      aria-hidden="true"
                    />

                    {t("login.signingIn")}
                  </>
                ) : (
                  <>
                    {t("login.signIn")}
                    <ArrowRight size={17} aria-hidden="true" />
                  </>
                )}
              </Button>
            </form>

            {/* FOOTER */}
            <div className="mt-9 flex items-center gap-3">
              <span aria-hidden="true" className="h-px flex-1 bg-white/10" />

              <p className="shrink-0 text-center text-[10px] uppercase tracking-[0.08em] text-[#849188]">
                {t("login.secureAccess")}
              </p>

              <span aria-hidden="true" className="h-px flex-1 bg-white/10" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;
