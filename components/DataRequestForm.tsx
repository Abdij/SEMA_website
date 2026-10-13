"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics-client";

type FormState = "idle" | "submitting" | "success" | "error";

function Required() {
  return <span className="required-mark" aria-hidden="true"> *</span>;
}

const SUBCATEGORIES_BY_CATEGORY: Record<string, string[]> = {
  eore: ["coverageMap", "gapMap", "generalMap", "beneficiaryData", "materialsResources"],
  otherMineAction: ["accidentData", "landRelease", "surveyCoverage", "qaqcMonitoring", "humanitarianImpact", "victimAssistance"],
};

export function DataRequestForm() {
  const t = useTranslations("dataRequest");
  const locale = useLocale();
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("");
  const startTracked = useRef(false);
  const categoryKey = category === t("categories.eore") ? "eore" : category === t("categories.otherMineAction") ? "otherMineAction" : "";

  useEffect(() => {
    if (startTracked.current) return;
    startTracked.current = true;
    trackEvent({ eventType: "data_request_started", eventCategory: "form", locale });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      const data = (await response.json()) as { message?: string; requestRef?: string; emailNotifications?: { requester: boolean; staff: boolean } };

      if (!response.ok) {
        throw new Error(data.message || t("errorFallback"));
      }

      form.reset();
      setCategory("");
      setState("success");
      setMessage(
        (data.requestRef
          ? t("successRef", { ref: data.requestRef })
          : t("successNoRef")) + " " + t(data.emailNotifications?.requester ? "emailSent" : "emailFailed"),
      );
      trackEvent({
        eventType: "data_request_submitted",
        eventCategory: "form",
        locale,
        metadata: { requesterType: String(payload.requesterType || ""), preferredFormat: String(payload.preferredFormat || "") },
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
          <input name="name" autoComplete="name" />
        </label>
        <label>
          {t("organization")}<Required />
          <input name="organization" required autoComplete="organization" />
        </label>
        <label>
          {t("roleLabel")}<Required />
          <input name="role" required />
        </label>
        <label>
          {t("requesterType")}<Required />
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
          {t("email")}<Required />
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
          {t("format")}<Required />
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
      <div className="form-grid">
        <label>
          {t("category")}<Required />
          <select
            name="dataCategory"
            required
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="" disabled>{t("selectCategory")}</option>
            <option value={t("categories.eore")}>{t("categories.eore")}</option>
            <option value={t("categories.otherMineAction")}>{t("categories.otherMineAction")}</option>
          </select>
        </label>
        <label>
          {t("subcategory")}<Required />
          <select name="dataSubcategory" required defaultValue="" key={categoryKey}>
            <option value="" disabled>{t("selectSubcategory")}</option>
            {(SUBCATEGORIES_BY_CATEGORY[categoryKey] || []).map((key) => (
              <option key={key}>{t(`subcategories.${key}`)}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        {t("dataRequested")}<Required />
        <textarea name="dataRequested" rows={5} required placeholder={t("dataRequestedPlaceholder")} />
      </label>
      <label>
        {t("intendedUse")}<Required />
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
