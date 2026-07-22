"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, Lock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  getOrCreateSessionId,
  getOrCreateVisitorId,
  getStoredDashboardRegistration,
  storeDashboardRegistration,
  trackEvent,
  type StoredDashboardRegistration,
} from "@/lib/analytics-client";
import { DashboardAccessModal, type DashboardAccessFormValues } from "@/components/DashboardAccessModal";

type Props = {
  dashboardId: string;
  title: string;
  description: string;
  provider?: string;
};

export function DashboardAccessGate({ dashboardId, title, description, provider }: Props) {
  const t = useTranslations("dashboardAccess");
  const locale = useLocale();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const expandButtonRef = useRef<HTMLButtonElement>(null);

  // Whether the dashboard itself is open (iframe visible) is tracked
  // independently of whether the form modal is showing, so that opening the
  // modal to edit organization info never re-locks a dashboard that's
  // already unlocked for this session — and cancelling that edit leaves the
  // dashboard exactly as it was.
  const [unlocked, setUnlocked] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState<string | null>(null);
  const [reusing, setReusing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hasStoredRegistration, setHasStoredRegistration] = useState(false);
  const [modalInitialValues, setModalInitialValues] = useState<Partial<DashboardAccessFormValues>>();

  useEffect(() => {
    setHasStoredRegistration(Boolean(getStoredDashboardRegistration()));
  }, []);

  useEffect(() => {
    if (unlocked && !showModal) {
      expandButtonRef.current?.focus();
    }
  }, [unlocked, showModal]);

  function sourcePage() {
    return typeof window !== "undefined" ? window.location.pathname : "";
  }

  function openModal(initialValues: Partial<DashboardAccessFormValues> | undefined) {
    setModalInitialValues(initialValues);
    setShowModal(true);
  }

  async function reuseStoredAccess(stored: StoredDashboardRegistration) {
    setReusing(true);

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
        openModal(stored);
        return;
      }

      setDashboardUrl(data.dashboardUrl);
      setUnlocked(true);
    } catch {
      openModal(stored);
    } finally {
      setReusing(false);
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

    const stored = getStoredDashboardRegistration();
    if (stored) {
      void reuseStoredAccess(stored);
    } else {
      openModal(undefined);
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
    // Only the modal closes — an already-unlocked dashboard stays open and
    // visible, and a not-yet-unlocked one stays locked. Nothing here should
    // touch `unlocked`/`dashboardUrl`.
    setShowModal(false);
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
    setUnlocked(true);
    setShowModal(false);
  }

  function handleChangeInfo() {
    // Pre-fill with whatever is currently stored — and do NOT clear it or
    // touch `unlocked` here. If the visitor cancels, both the dashboard's
    // open/closed state and the stored registration must be exactly as they
    // were before they clicked "change organization information".
    const stored = getStoredDashboardRegistration();
    openModal(stored ?? undefined);
  }

  function openInNewTab() {
    if (!dashboardUrl) return;
    trackEvent({
      eventType: "external_link_clicked",
      eventCategory: "dashboard",
      label: title,
      targetUrl: dashboardUrl,
      dashboardId,
      dashboardTitle: title,
      locale,
    });
    window.open(dashboardUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="dashboard-panel">
      <div className="dashboard-copy">
        <p className="eyebrow">Dashboard</p>
        <h2>{title}</h2>
        <p>{description}</p>

        {!unlocked ? (
          <button
            ref={triggerRef}
            type="button"
            className="button"
            onClick={handleOpenClick}
            disabled={reusing}
          >
            <Lock aria-hidden="true" size={16} />
            {reusing ? t("buttons.submitting") : t("buttons.openDashboard")}
          </button>
        ) : null}

        {hasStoredRegistration ? (
          <button type="button" className="link-button" onClick={handleChangeInfo}>
            {t("buttons.changeInfo")}
          </button>
        ) : null}
      </div>

      <div className="embed-shell">
        {unlocked && dashboardUrl ? (
          <>
            <iframe
              title={title}
              src={dashboardUrl}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
            <button
              ref={expandButtonRef}
              type="button"
              className="embed-expand-button"
              onClick={openInNewTab}
              aria-label={t("buttons.viewInNewTab")}
              title={t("buttons.viewInNewTab")}
            >
              <Maximize2 aria-hidden="true" size={16} />
            </button>
          </>
        ) : (
          <div className="embed-placeholder embed-locked">
            <Lock aria-hidden="true" size={28} />
            <span>{t("gateLockedMessage")}</span>
            <small>{provider === "arcgis" ? t("gateProviderArcgis") : t("gateProviderPowerbi")}</small>
          </div>
        )}
      </div>

      {showModal ? (
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
