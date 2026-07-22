"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics-client";

type FormState = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState("submitting");
    setMessage("");

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message || t("errorFallback"));
      }

      form.reset();
      setState("success");
      setMessage(t("successMessage"));
      trackEvent({
        eventType: "contact_form_submitted",
        eventCategory: "form",
        locale,
        metadata: { enquiryType: String(payload.enquiryType || "") },
      });
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : t("errorFallback"));
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="form-grid">
        <label>
          {t("name")}
          <input name="name" required autoComplete="name" />
        </label>
        <label>
          {t("organization")}
          <input name="organization" autoComplete="organization" />
        </label>
        <label>
          {t("email")}
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          {t("phone")}
          <input name="phone" autoComplete="tel" />
        </label>
        <label>
          {t("enquiryType")}
          <select name="enquiryType" required defaultValue="">
            <option value="" disabled>{t("selectType")}</option>
            <option>{t("enquiryGeneral")}</option>
            <option>{t("enquiryMedia")}</option>
            <option>{t("enquiryPartner")}</option>
            <option>{t("enquiryPublication")}</option>
            <option>{t("enquiryFeedback")}</option>
          </select>
        </label>
        <label>
          {t("subject")}
          <input name="subject" required />
        </label>
      </div>
      <label>
        {t("message")}
        <textarea name="message" rows={6} required />
      </label>
      <label className="check-row">
        <input name="consent" type="checkbox" required />
        {t("consent")}
      </label>
      <button className="button" type="submit" disabled={state === "submitting"}>
        <Send aria-hidden="true" size={18} />
        {state === "submitting" ? t("submitting") : t("submit")}
      </button>
      {message ? <p className={`form-message ${state}`}>{message}</p> : null}
    </form>
  );
}
