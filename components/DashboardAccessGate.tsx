"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Lock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  clearDashboardRegistration,
  getOrCreateSessionId,
  getOrCreateVisitorId,
  getStoredDashboardRegistration,
  storeDashboardRegistration,
  trackEvent,
} from "@/lib/analytics-client";
import { DashboardAccessModal, type DashboardAccessFormValues } from "@/components/DashboardAccessModal";

type Props = {
  dashboardId: string;
  title: string;
  description: string;
  provider?: string;
};

type Status = "locked" | "reusing" | "modal" | "unlocked";

export function DashboardAccessGate({ dashboardId, title, description, provider }: Props) {
  const t = useTranslations("dashboardAccess");
  const locale = useLocale();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const unlockedLinkRef = useRef<HTMLAnchorElement>(null);

  const [status, setStatus] = useState<Status>("locked");
  const [dashboardUrl, setDashboardUrl] = useState<string | null>(null);
  const [hasStoredRegistration, setHasStoredRegistration] = useState(false);
  const [modalInitialValues, setModalInitialValues] = useState<Partial<DashboardAccessFormValues>>();

  useEffect(() => {
    setHasStoredRegistration(Boolean(getStoredDashboardRegistration()));
  }, []);

  useEffect(() => {
    if (status === "unlocked") {
      unlockedLinkRef.current?.focus();
    }
  }, [status]);

  function sourcePage() {
    return typeof window !== "undefined" ? window.location.pathname : "";
  }

  async function reuseStoredAccess() {
    const stored = getStoredDashboardRegistration();
    if (!stored) {
      setStatus("modal");
      return;
    }

    setStatus("reusing");

    try {
      const response = await fetch("/api/dashboard-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "reuse",
          dashboardId,
          sourcePage: sourcePage(),
          locale,
          visitorId: getOrCreateVisitorId(),
          sessionId: getOrCreateSessionId().sessionId,
          previousAccessId: stored.lastAccessId,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setModalInitialValues(stored);
        setStatus("modal");
        return;
      }

      setDashboardUrl(data.dashboardUrl);
      setStatus("unlocked");
    } catch {
      setModalInitialValues(stored);
      setStatus("modal");
    }
  }

  function handleOpenClick() {
    trackEvent({
      eventType: "dashboard_gate_opened",
      eventCategory: "dashboard",
      dashboardId,
      dashboardTitle: title,
      locale,
      metadata: { sourcePage: sourcePage(), reused: hasStoredRegistration },
    });

    if (hasStoredRegistration) {
      void reuseStoredAccess();
    } else {
      setModalInitialValues(undefined);
      setStatus("modal");
    }
  }

  function handleCancel() {
    trackEvent({
      eventType: "dashboard_gate_cancelled",
      eventCategory: "dashboard",
      dashboardId,
      dashboardTitle: title,
      locale,
    });
    setStatus("locked");
  }

  function handleSuccess(result: { dashboardUrl: string; accessId: string; values: DashboardAccessFormValues }) {
    storeDashboardRegistration({
      organizationName: result.values.organizationName.trim(),
      organizationType: result.values.organizationType || undefined,
      organizationTypeOther: result.values.organizationTypeOther.trim() || undefined,
      activityTypes: result.values.activityTypes,
      activityTypeOther: result.values.activityTypeOther.trim() || undefined,
      countryOfOperation: result.values.countryOfOperation.trim() || undefined,
      lastAccessId: result.accessId,
    });
    setHasStoredRegistration(true);
    setDashboardUrl(result.dashboardUrl);
    setStatus("unlocked");
  }

  function handleChangeInfo() {
    const stored = getStoredDashboardRegistration();
    clearDashboardRegistration();
    setHasStoredRegistration(false);
    setModalInitialValues(stored ?? undefined);
    setStatus("modal");
  }

  return (
    <section className="dashboard-panel">
      <div className="dashboard-copy">
        <p className="eyebrow">Dashboard</p>
        <h2>{title}</h2>
        <p>{description}</p>

        {status === "unlocked" && dashboardUrl ? (
          <a
            ref={unlockedLinkRef}
            className="text-link"
            href={dashboardUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              trackEvent({
                eventType: "external_link_clicked",
                eventCategory: "dashboard",
                label: title,
                targetUrl: dashboardUrl,
                dashboardId,
                dashboardTitle: title,
                locale,
              })
            }
          >
            {t("buttons.viewInNewTab")} <ExternalLink aria-hidden="true" size={16} />
          </a>
        ) : (
          <button
            ref={triggerRef}
            type="button"
            className="button"
            onClick={handleOpenClick}
            disabled={status === "reusing"}
          >
            <Lock aria-hidden="true" size={16} />
            {status === "reusing" ? t("buttons.submitting") : t("buttons.openDashboard")}
          </button>
        )}

        {hasStoredRegistration ? (
          <button type="button" className="link-button" onClick={handleChangeInfo}>
            {t("buttons.changeInfo")}
          </button>
        ) : null}
      </div>

      <div className="embed-shell">
        {status === "unlocked" && dashboardUrl ? (
          <iframe
            title={title}
            src={dashboardUrl}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="embed-placeholder embed-locked">
            <Lock aria-hidden="true" size={28} />
            <span>{t("gateLockedMessage")}</span>
            <small>{provider === "arcgis" ? t("gateProviderArcgis") : t("gateProviderPowerbi")}</small>
          </div>
        )}
      </div>

      {status === "modal" ? (
        <DashboardAccessModal
          dashboardId={dashboardId}
          sourcePage={sourcePage()}
          locale={locale}
          initialValues={modalInitialValues}
          onCancel={handleCancel}
          onSuccess={handleSuccess}
        />
      ) : null}
    </section>
  );
}
