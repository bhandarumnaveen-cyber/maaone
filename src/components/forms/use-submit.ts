"use client";

import { useState } from "react";
import type { FieldErrors } from "@/lib/validation";
import { resetTurnstile } from "./turnstile";

type State =
  | { status: "idle" | "submitting" }
  | { status: "success"; preview: boolean; position?: number; alreadyJoined?: boolean }
  | { status: "error"; message: string };

export function useSubmit(endpoint: string) {
  const [state, setState] = useState<State>({ status: "idle" });
  const [errors, setErrors] = useState<FieldErrors>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ status: "submitting" });
    setErrors({});
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setState({
          status: "success",
          preview: Boolean(json.preview),
          position: json.position,
          alreadyJoined: Boolean(json.alreadyJoined),
        });
      } else if (res.status === 422 && json.errors) {
        resetTurnstile();
        setErrors(json.errors);
        setState({ status: "idle" });
      } else {
        resetTurnstile();
        setState({ status: "error", message: json.error ?? "Something went wrong. Please try again." });
      }
    } catch {
      setState({ status: "error", message: "Couldn't reach the server. Check your connection and try again." });
    }
  }

  return { state, errors, onSubmit };
}
