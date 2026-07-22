"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Link } from "@/lib/navigation";
import { ACTIVITY_TYPES, ORGANIZATION_TYPES } from "@/lib/dashboard-access-options";
import { getOrCreateSessionId, getOrCreateVisitorId } from "@/lib/analytics-client";

export type DashboardAccessFormValues = {
  organizationName: string;
  organizationType: string;
  organizationTypeOther: string;
  activityTypes: string[];
  activityTypeOther: string;
  countryOfOperation: string;
};

export type DashboardAccessSubmitResult = {
  dashboardUrl: string;
  dashboardTitle: string;
  accessId: string;
  values: DashboardAccessFormValues;
};

type Props = {
  dashboardId: string;
  sourcePage: string;
  locale: string;
  initialValues?: Partial<DashboardAccessFormValues>;
  onCancel: () => void;
  onSuccess: (result: DashboardAccessSubmitResult) => void;
};

const emptyValues: DashboardAccessFormValues = {
  organizationName: "",
  organizationType: "",
  organizationTypeOther: "",
  activityTypes: [],
  activityTypeOther: "",
  countryOfOperation: "",
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function DashboardAccessModal({
  dashboardId,
  sourcePage,
  locale,
  initialValues,
  onCancel,
  onSuccess,
}: Props) {
  const t = useTranslations("dashboardAccess");
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = "dashboard-access-modal-title";

  const [values, setValues] = useState<DashboardAccessFormValues>({
    ...emptyValues,
    ...initialValues,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const firstField = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    firstField?.focus();

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function trapFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab" || !dialogRef.current) return;

    const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (el) => !el.hasAttribute("disabled"),
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function toggleActivity(value: string) {
    setValues((prev) => {
      const has = prev.activityTypes.includes(value);
      return {
        ...prev,
        activityTypes: has
          ? prev.activityTypes.filter((item) => item !== value)
          : [...prev.activityTypes, value],
      };
    });
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};

    if (!values.organizationName.trim() || values.organizationName.trim().length < 2) {
      nextErrors.organizationName = t("errors.organizationName");
    }
    if (values.activityTypes.length === 0) {
      nextErrors.activityTypes = t("errors.activityTypes");
    }
    if (!consent) {
      nextErrors.consent = t("errors.consent");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError("");

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/dashboard-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "register",
          dashboardId,
          sourcePage,
          locale,
          visitorId: getOrCreateVisitorId(),
          sessionId: getOrCreateSessionId().sessionId,
          organizationName: values.organizationName.trim(),
          organizationType: values.organizationType || undefined,
          organizationTypeOther: values.organizationTypeOther.trim() || undefined,
          activityTypes: values.activityTypes,
          activityTypeOther: values.activityTypeOther.trim() || undefined,
          countryOfOperation: values.countryOfOperation.trim() || undefined,
          consent: true,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setServerError(data?.message || t("errors.generic"));
        setSubmitting(false);
        return;
      }

      onSuccess({
        dashboardUrl: data.dashboardUrl,
        dashboardTitle: data.dashboardTitle,
        accessId: data.accessId,
        values,
      });
    } catch {
      setServerError(t("errors.generic"));
      setSubmitting(false);
    }
  }

  const showOrgTypeOther = values.organizationType === "other";
  const showActivityOther = values.activityTypes.includes("other");

  return (
    <div className="modal-overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div
        ref={dialogRef}
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={trapFocus}
      >
        <div className="modal-header">
          <h2 id={titleId}>{t("title")}</h2>
          <button type="button" className="modal-close" onClick={onCancel} aria-label={t("buttons.close")}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <p className="modal-explanation">{t("explanation")}</p>

        <form className="form dashboard-access-form" onSubmit={handleSubmit} noValidate>
          <label>
            {t("fields.organizationName.label")} <span aria-hidden="true">*</span>
            <input
              value={values.organizationName}
              onChange={(e) => setValues((prev) => ({ ...prev, organizationName: e.target.value }))}
              placeholder={t("fields.organizationName.placeholder")}
              maxLength={300}
              required
              aria-invalid={Boolean(errors.organizationName)}
              aria-describedby={errors.organizationName ? "error-organizationName" : undefined}
            />
            {errors.organizationName ? (
              <span id="error-organizationName" className="field-error" role="alert">
                {errors.organizationName}
              </span>
            ) : null}
          </label>

          <label>
            {t("fields.organizationType.label")}
            <select
              value={values.organizationType}
              onChange={(e) => setValues((prev) => ({ ...prev, organizationType: e.target.value }))}
            >
              <option value="">{t("fields.organizationType.placeholder")}</option>
              {ORGANIZATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`orgTypes.${type}`)}
                </option>
              ))}
            </select>
          </label>

          {showOrgTypeOther ? (
            <label>
              {t("fields.organizationTypeOther.label")}
              <input
                value={values.organizationTypeOther}
                onChange={(e) => setValues((prev) => ({ ...prev, organizationTypeOther: e.target.value }))}
                placeholder={t("fields.organizationTypeOther.placeholder")}
                maxLength={200}
              />
            </label>
          ) : null}

          <fieldset
            className="activity-fieldset"
            aria-invalid={Boolean(errors.activityTypes)}
            aria-describedby={errors.activityTypes ? "error-activityTypes" : undefined}
          >
            <legend>
              {t("fields.activityTypes.label")} <span aria-hidden="true">*</span>
            </legend>
            <div className="activity-grid">
              {ACTIVITY_TYPES.map((activity) => (
                <label key={activity} className="check-row activity-option">
                  <input
                    type="checkbox"
                    checked={values.activityTypes.includes(activity)}
                    onChange={() => toggleActivity(activity)}
                  />
                  {t(`activityOptions.${activity}`)}
                </label>
              ))}
            </div>
            {errors.activityTypes ? (
              <span id="error-activityTypes" className="field-error" role="alert">
                {errors.activityTypes}
              </span>
            ) : null}
          </fieldset>

          {showActivityOther ? (
            <label>
              {t("fields.activityTypeOther.label")}
              <input
                value={values.activityTypeOther}
                onChange={(e) => setValues((prev) => ({ ...prev, activityTypeOther: e.target.value }))}
                placeholder={t("fields.activityTypeOther.placeholder")}
                maxLength={200}
              />
            </label>
          ) : null}

          <label>
            {t("fields.countryOfOperation.label")}
            <input
              value={values.countryOfOperation}
              onChange={(e) => setValues((prev) => ({ ...prev, countryOfOperation: e.target.value }))}
              placeholder={t("fields.countryOfOperation.placeholder")}
              maxLength={120}
            />
          </label>

          <label
            className="check-row"
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? "error-consent" : undefined}
          >
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
            {t("fields.consent.label")}
          </label>
          {errors.consent ? (
            <span id="error-consent" className="field-error" role="alert">
              {errors.consent}
            </span>
          ) : null}

          <p className="modal-privacy-note">
            {t("notices.privacy")}{" "}
            <Link href="/privacy" target="_blank" rel="noreferrer">
              {t("notices.privacyLinkLabel")}
            </Link>
          </p>

          {serverError ? (
            <p className="form-message error" role="alert">
              {serverError}
            </p>
          ) : null}

          <div className="modal-footer">
            <button type="button" className="button light" onClick={onCancel} disabled={submitting}>
              {t("buttons.cancel")}
            </button>
            <button type="submit" className="button" disabled={submitting}>
              {submitting ? t("buttons.submitting") : t("buttons.continue")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
