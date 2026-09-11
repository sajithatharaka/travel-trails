// src/components/useTurnstileSubmit.ts
// ------------------------------------------------------------
// Shared submit flow for the public Turnstile-protected forms
// (ContactForm, GeneralEnquiryForm, EnquiryForm): gate on a solved Turnstile
// token, invoke the edge function, reset the widget, and map any failure to
// friendly copy via `resolveEdgeFunctionError`. Each form supplies its own
// field validation (`validate`) and request body (`buildBody`).
// ------------------------------------------------------------

"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TurnstileHandle } from "@/components/TurnstileWidget";
import { HAS_TURNSTILE } from "@/lib/turnstile";
import { resolveEdgeFunctionError } from "@/lib/edgeFunctionError";

export type SubmitStatus = "idle" | "loading" | "success" | "error";

interface UseTurnstileSubmitOptions {
  /** Edge function to invoke, e.g. `"submit-contact"`. */
  functionName: string;
  /** Shown for transport failures and any unrecognised server error. */
  genericError: string;
  /**
   * Field-level validation run before the network call. Return an inline error
   * string to block submission, or `null` when the form is valid.
   */
  validate?: (fd: FormData) => string | null;
  /** Build the request body from the submitted form and the Turnstile token. */
  buildBody: (fd: FormData, turnstileToken: string) => Record<string, unknown>;
  /** Runs after a successful submit, once `form.reset()` has been called. */
  onSuccess?: (form: HTMLFormElement) => void;
}

export function useTurnstileSubmit({
  functionName,
  genericError,
  validate,
  buildBody,
  onSuccess,
}: UseTurnstileSubmitOptions) {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (HAS_TURNSTILE && !token) {
      setStatus("error");
      setErrorMsg("Please complete the verification challenge.");
      return;
    }

    const form = e.currentTarget;
    const fd = new FormData(form);

    const validationError = validate?.(fd) ?? null;
    if (validationError) {
      setStatus("error");
      setErrorMsg(validationError);
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    const supabase = createClient();
    const result = await supabase.functions.invoke(functionName, {
      body: buildBody(fd, token ?? ""),
    });

    turnstileRef.current?.reset();
    setToken(null);

    const friendlyError = await resolveEdgeFunctionError(result, genericError);
    if (friendlyError) {
      setStatus("error");
      setErrorMsg(friendlyError);
      return;
    }

    setStatus("success");
    form.reset();
    onSuccess?.(form);
  }

  return {
    status,
    errorMsg,
    token,
    setToken,
    setStatus,
    setErrorMsg,
    turnstileRef,
    handleSubmit,
  };
}
