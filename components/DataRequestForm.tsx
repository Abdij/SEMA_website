"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";

type FormState = "idle" | "submitting" | "success" | "error";

export function DataRequestForm() {
  const t = useTranslations("dataRequest");
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
      const response = await fetch("/api/data-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { message?: string; requestRef?: string };

      if (!response.ok) {
        throw new Error(data.message || t("errorFallback"));
      }

      form.reset();
      setState("success");
      setMessage(
        data.requestRef
          ? t("successRef", { ref: data.requestRef })
          : t("successNoRef"),
      );
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
          {t("roleLabel")}
          <input name="role" />
        </label>
        <label>
          {t("requesterType")}
          <select name="requesterType" required defaultValue="">
            <option value="" disabled>{t("selectType")}</option>
            <option>{t("requesterTypes.gov")}</option>
            <option>{t("requesterTypes.fms")}</option>
            <option>{t("requesterTypes.operator")}</option>
            <option>{t("requesterTypes.humanitarian")}</option>
            <option>{t("requesterTypes.donor")}</option>
            <option>{t("requesterTypes.researcher")}</option>
            <option>{t("requesterTypes.media")}</option>
            <option>{t("requesterTypes.public")}</option>
          </select>
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
          {t("geography")}
          <input name="geography" placeholder={t("geographyPlaceholder")} />
        </label>
        <label>
          {t("timePeriod")}
          <input name="timePeriod" placeholder={t("timePeriodPlaceholder")} />
        </label>
        <label>
          {t("format")}
          <select name="preferredFormat" required defaultValue="">
            <option value="" disabled>{t("selectFormat")}</option>
            <option>{t("formats.pdf")}</option>
            <option>{t("formats.excel")}</option>
            <option>{t("formats.csv")}</option>
            <option>{t("formats.map")}</option>
            <option>{t("formats.dashboard")}</option>
            <option>{t("formats.agreement")}</option>
          </select>
        </label>
        <label>
          {t("deadline")}
          <input name="deadline" type="date" />
        </label>
      </div>
      <label>
        {t("dataRequested")}
        <textarea name="dataRequested" rows={5} required placeholder={t("dataRequestedPlaceholder")} />
      </label>
      <label>
        {t("intendedUse")}
        <textarea name="intendedUse" rows={5} required placeholder={t("intendedUsePlaceholder")} />
      </label>
      <label className="check-row">
        <input name="terms" type="checkbox" required />
        {t("terms")}
      </label>
      <button className="button" type="submit" disabled={state === "submitting"}>
        <Send aria-hidden="true" size={18} />
        {state === "submitting" ? t("submitting") : t("submit")}
      </button>
      {message ? <p className={`form-message ${state}`}>{message}</p> : null}
    </form>
  );
}
