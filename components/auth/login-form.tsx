"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

import { IconArrowRight, IconMail } from "@/components/brand/soft-icons";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { PasswordField } from "@/components/ui/password-field";
import { MissingEnvError } from "@/lib/env";
import { loginCopy } from "@/lib/i18n/brand-pt-br";
import { createClient } from "@/lib/supabase/client";

interface LoginFormProps {
  nextPath: string;
}

type AuthMode = "sign-in" | "sign-up" | "reset";

const MIN_PASSWORD_LENGTH = 8;
const AUTH_TIMEOUT_MS = 25_000;

function authErrorMessage(error: {
  status?: number;
  message?: string;
  code?: string;
  name?: string;
}): string {
  const code = (error.code ?? "").toLowerCase();
  const message = (error.message ?? "").toLowerCase();
  const haystack = `${code} ${message}`;

  if (
    haystack.includes("email_not_confirmed") ||
    haystack.includes("email not confirmed")
  ) {
    return loginCopy.emailNotConfirmedSignIn;
  }
  if (
    haystack.includes("invalid_credentials") ||
    haystack.includes("invalid login") ||
    haystack.includes("invalid_grant")
  ) {
    return loginCopy.invalidCredentials;
  }
  if (
    haystack.includes("user_already_exists") ||
    haystack.includes("already registered") ||
    haystack.includes("already been registered")
  ) {
    return loginCopy.emailTaken;
  }
  if (
    haystack.includes("over_email_send_rate_limit") ||
    haystack.includes("rate_limit") ||
    error.status === 429
  ) {
    return loginCopy.rateLimitError;
  }
  if (error.status === 500 || haystack.includes("internal server error")) {
    return loginCopy.recoverServerError;
  }
  if (
    haystack.includes("weak_password") ||
    (haystack.includes("password") &&
      (haystack.includes("least") || haystack.includes("characters")))
  ) {
    return loginCopy.passwordTooShort;
  }
  if (error.message && error.message.length < 160) {
    return `${loginCopy.sendError} (${error.message})`;
  }
  return loginCopy.sendError;
}

function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error("timeout"));
    }, ms);
    Promise.resolve(promise).then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter();
  const feedbackRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const isSignUp = mode === "sign-up";
  const isReset = mode === "reset";

  function switchMode(next: AuthMode) {
    setMode(next);
    setMessage(null);
    setHasError(false);
    setConfirmPassword("");
  }

  function showFeedback(nextMessage: string, asError: boolean) {
    setHasError(asError);
    setMessage(nextMessage);
    window.requestAnimationFrame(() => {
      feedbackRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) {
      return;
    }

    setMessage(null);
    setHasError(false);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      showFeedback(loginCopy.emailRequired, true);
      return;
    }

    if (isReset) {
      setIsPending(true);
      try {
        const supabase = createClient();
        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/auth/update-password")}`;
        const { error } = await withTimeout(
          supabase.auth.resetPasswordForEmail(trimmedEmail, { redirectTo }),
          AUTH_TIMEOUT_MS,
        );

        if (error) {
          console.error("resetPasswordForEmail", {
            code: error.code,
            message: error.message,
            status: error.status,
          });
          showFeedback(authErrorMessage(error), true);
          return;
        }

        showFeedback(loginCopy.resetEmailSent, false);
      } catch (error) {
        if (error instanceof MissingEnvError) {
          showFeedback(loginCopy.envError, true);
          return;
        }
        if (error instanceof Error && error.message === "timeout") {
          showFeedback(loginCopy.networkError, true);
          return;
        }
        showFeedback(loginCopy.sendError, true);
      } finally {
        setIsPending(false);
      }
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      showFeedback(loginCopy.passwordTooShort, true);
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      showFeedback(loginCopy.passwordMismatch, true);
      return;
    }

    setIsPending(true);
    try {
      const supabase = createClient();

      if (isSignUp) {
        const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
        const { data, error } = await withTimeout(
          supabase.auth.signUp({
            email: trimmedEmail,
            password,
            options: { emailRedirectTo },
          }),
          AUTH_TIMEOUT_MS,
        );

        if (error) {
          console.error("signUp", {
            code: error.code,
            message: error.message,
            status: error.status,
          });
          showFeedback(authErrorMessage(error), true);
          return;
        }

        // Supabase often returns 200 with empty identities when the e-mail
        // already exists and confirmation is enabled (no error object).
        const identities = data.user?.identities ?? null;
        if (data.user && Array.isArray(identities) && identities.length === 0) {
          showFeedback(loginCopy.emailTaken, true);
          return;
        }

        if (!data.session) {
          showFeedback(loginCopy.signUpConfirmEmail, false);
          return;
        }
      } else {
        const { error } = await withTimeout(
          supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          }),
          AUTH_TIMEOUT_MS,
        );

        if (error) {
          console.error("signInWithPassword", {
            code: error.code,
            message: error.message,
            status: error.status,
          });
          showFeedback(authErrorMessage(error), true);
          return;
        }
      }

      router.push(nextPath);
      router.refresh();
    } catch (error) {
      if (error instanceof MissingEnvError) {
        showFeedback(loginCopy.envError, true);
        return;
      }
      if (error instanceof Error && error.message === "timeout") {
        showFeedback(loginCopy.networkError, true);
        return;
      }
      console.error("authSubmit", error);
      showFeedback(loginCopy.sendError, true);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5"
    >
      <div ref={feedbackRef}>
        {message ? (
          <InlineAlert tone={hasError ? "error" : "info"}>
            {message}
          </InlineAlert>
        ) : null}
      </div>

      {!isReset ? (
        <div
          className="flex rounded-[var(--radius-pill)] bg-sand-deep/80 p-1"
          role="tablist"
          aria-label={loginCopy.modeLabel}
        >
          <button
            type="button"
            role="tab"
            aria-selected={!isSignUp}
            onClick={() => switchMode("sign-in")}
            disabled={isPending}
            className={`focus-ring flex-1 rounded-[var(--radius-pill)] px-3 py-2.5 text-sm font-semibold transition ${
              !isSignUp
                ? "bg-surface text-ink shadow-sm"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {loginCopy.modeSignIn}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isSignUp}
            onClick={() => switchMode("sign-up")}
            disabled={isPending}
            className={`focus-ring flex-1 rounded-[var(--radius-pill)] px-3 py-2.5 text-sm font-semibold transition ${
              isSignUp
                ? "bg-surface text-ink shadow-sm"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {loginCopy.modeSignUp}
          </button>
        </div>
      ) : (
        <div className="space-y-1 text-center">
          <h2 className="text-lg font-semibold text-ink">
            {loginCopy.resetTitle}
          </h2>
          <p className="text-sm leading-relaxed text-ink-soft">
            {loginCopy.resetSupport}
          </p>
        </div>
      )}

      <label className="flex flex-col gap-2 text-sm font-medium text-ink">
        {loginCopy.emailLabel}
        <span className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft">
            <IconMail size={18} />
          </span>
          <input
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field-control min-h-14 w-full py-3 pl-12 pr-4 text-base text-ink"
            placeholder={loginCopy.emailPlaceholder}
            disabled={isPending}
          />
        </span>
      </label>

      {!isReset ? (
        <PasswordField
          label={loginCopy.passwordLabel}
          name="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={loginCopy.passwordPlaceholder}
          disabled={isPending}
          showLabel={loginCopy.showPassword}
          hideLabel={loginCopy.hidePassword}
        />
      ) : null}

      {isSignUp ? (
        <PasswordField
          label={loginCopy.confirmPasswordLabel}
          name="confirmPassword"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder={loginCopy.confirmPasswordPlaceholder}
          disabled={isPending}
          showLabel={loginCopy.showPassword}
          hideLabel={loginCopy.hidePassword}
        />
      ) : null}

      <Button
        type="submit"
        disabled={isPending}
        className="min-h-14 gap-2 rounded-[var(--radius-pill)] shadow-[0_10px_28px_color-mix(in_srgb,var(--color-mint-deep)_35%,transparent)]"
      >
        {isPending
          ? isReset
            ? loginCopy.resetSending
            : isSignUp
              ? loginCopy.submittingSignUp
              : loginCopy.submitting
          : isReset
            ? loginCopy.resetCta
            : isSignUp
              ? loginCopy.submitSignUp
              : loginCopy.submit}
        {!isPending ? <IconArrowRight size={18} /> : null}
      </Button>

      {!isReset && !isSignUp ? (
        <button
          type="button"
          onClick={() => switchMode("reset")}
          disabled={isPending}
          className="focus-ring text-center text-sm font-semibold text-mint-deep underline-offset-4 hover:underline"
        >
          {loginCopy.forgotPassword}
        </button>
      ) : null}

      {isReset ? (
        <button
          type="button"
          onClick={() => switchMode("sign-in")}
          disabled={isPending}
          className="focus-ring text-center text-sm font-semibold text-mint-deep underline-offset-4 hover:underline"
        >
          {loginCopy.backToSignIn}
        </button>
      ) : (
        <p className="text-center text-sm font-medium text-mint-deep">
          {isSignUp ? loginCopy.signUpHint : loginCopy.signInHint}
        </p>
      )}
    </form>
  );
}
