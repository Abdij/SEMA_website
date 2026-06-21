"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type AdminTab = "news" | "publications" | "dashboards" | "messages" | "requests" | "reports";

type ReportExportType =
  | "data-requests"
  | "contact-messages"
  | "news-by-theme-date"
  | "dashboard-clicks"
  | "nav-clicks"
  | "analytics-events";

type NewsItem = {
  slug: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  image: string;
  body: string[];
  sourceLabel?: string;
  sourceUrl?: string;
  status?: string;
};

type PublicationItem = {
  title: string;
  type: string;
  description: string;
  href: string;
  source: string;
  publication_date?: string;
  status?: string;
  fileName?: string;
  fileMime?: string;
};

type DashboardItem = {
  title: string;
  description: string;
  url: string;
  provider?: string;
  public_safe?: boolean;
  status?: string;
};

type ContactMessage = {
  id: string;
  name: string;
  organization?: string;
  email: string;
  phone?: string;
  enquiryType: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type DataRequest = {
  id: string;
  requestRef: string;
  name: string;
  organization?: string;
  role?: string;
  email: string;
  phone?: string;
  requesterType: string;
  dataRequested: string;
  geography?: string;
  timePeriod?: string;
  intendedUse: string;
  preferredFormat: string;
  deadline?: string;
  status: string;
  sensitivityLevel: string;
  created_at: string;
  updated_at: string;
};

type ReportSummary = {
  totals: {
    dataRequests: number;
    contactMessages: number;
    publishedNews: number;
    draftNews: number;
    dashboardClicks: number;
    navClicks: number;
  };
  newsByThemeDate: Array<{
    category: string;
    publishedDate: string;
    count: number;
  }>;
  dashboardClicks: Array<{
    label: string;
    targetUrl?: string;
    count: number;
    firstClick?: string;
    lastClick?: string;
  }>;
  navClicks: Array<{
    eventType: string;
    label: string;
    targetUrl?: string;
    count: number;
    firstClick?: string;
    lastClick?: string;
  }>;
};

const adminTabs: AdminTab[] = ["news", "publications", "dashboards", "messages", "requests", "reports"];

const reportExports: Array<{ type: ReportExportType; label: string }> = [
  { type: "data-requests", label: "Export data requests" },
  { type: "contact-messages", label: "Export contact messages" },
  { type: "news-by-theme-date", label: "Export news by theme/date" },
  { type: "dashboard-clicks", label: "Export dashboard clicks" },
  { type: "nav-clicks", label: "Export website tab clicks" },
  { type: "analytics-events", label: "Export raw click events" },
];

const emptyNews: NewsItem = {
  slug: "",
  title: "",
  date: new Date().toISOString().slice(0, 10),
  category: "",
  summary: "",
  image: "",
  body: [""],
  sourceLabel: "",
  sourceUrl: "",
  status: "published",
};

const emptyPublication: PublicationItem = {
  title: "",
  type: "",
  description: "",
  href: "",
  source: "",
  publication_date: new Date().toISOString().slice(0, 10),
  status: "published",
};

const emptyDashboard: DashboardItem = {
  title: "",
  description: "",
  url: "",
  provider: "other",
  public_safe: false,
  status: "published",
};

function authHeader(password: string) {
  return { Authorization: `Bearer ${password}` };
}

function formatNumber(value: number | undefined) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<AdminTab>("news");
  const [message, setMessage] = useState("");
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [publicationList, setPublicationList] = useState<PublicationItem[]>([]);
  const [dashboardList, setDashboardList] = useState<DashboardItem[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [dataRequests, setDataRequests] = useState<DataRequest[]>([]);
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);
  const [editingNews, setEditingNews] = useState<NewsItem>(emptyNews);
  const [editingPublication, setEditingPublication] = useState<PublicationItem>(emptyPublication);
  const [publicationFile, setPublicationFile] = useState<File | null>(null);
  const [editingDashboard, setEditingDashboard] = useState<DashboardItem>(emptyDashboard);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("sema_admin_password");
    if (saved) {
      setPassword(saved);
      verifyPassword(saved);
    }
  }, []);

  const headers = useMemo(() => authHeader(password), [password]);

  async function verifyPassword(value: string) {
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: value }),
      });

      if (!response.ok) {
        setAuthenticated(false);
        setMessage("Invalid admin password.");
        return;
      }

      setAuthenticated(true);
      setMessage("Authenticated.");
      window.localStorage.setItem("sema_admin_password", value);
      loadAllData(value);
    } catch (error) {
      setAuthenticated(false);
      setMessage("Unable to reach admin endpoint.");
    }
  }

  async function loadAllData(authValue: string) {
    setLoading(true);
    try {
      const [
        newsResponse,
        publicationsResponse,
        dashboardsResponse,
        contactMessagesResponse,
        dataRequestsResponse,
        reportsResponse,
      ] = await Promise.all([
        fetch("/api/admin/news", { headers: authHeader(authValue) }),
        fetch("/api/admin/publications", { headers: authHeader(authValue) }),
        fetch("/api/admin/dashboard-embeds", { headers: authHeader(authValue) }),
        fetch("/api/admin/contact-messages", { headers: authHeader(authValue) }),
        fetch("/api/admin/data-requests", { headers: authHeader(authValue) }),
        fetch("/api/admin/reports", { headers: authHeader(authValue) }),
      ]);

      if (
        !newsResponse.ok ||
        !publicationsResponse.ok ||
        !dashboardsResponse.ok ||
        !contactMessagesResponse.ok ||
        !dataRequestsResponse.ok ||
        reportsResponse.status === 401
      ) {
        setAuthenticated(false);
        setMessage("Authorization failed. Please log in again.");
        return;
      }

      const [
        newsData,
        publicationsData,
        dashboardData,
        contactMessagesData,
        dataRequestsData,
        reportsData,
      ] = await Promise.all([
        newsResponse.json(),
        publicationsResponse.json(),
        dashboardsResponse.json(),
        contactMessagesResponse.json(),
        dataRequestsResponse.json(),
        reportsResponse.ok ? reportsResponse.json() : Promise.resolve(null),
      ]);

      setNewsList(Array.isArray(newsData) ? newsData : []);
      setPublicationList(Array.isArray(publicationsData) ? publicationsData : []);
      setDashboardList(Array.isArray(dashboardData) ? dashboardData : []);
      setContactMessages(Array.isArray(contactMessagesData) ? contactMessagesData : []);
      setDataRequests(Array.isArray(dataRequestsData) ? dataRequestsData : []);
      setReportSummary(reportsData);
      setMessage(reportsResponse.ok ? "Data loaded." : "Data loaded. Reports are unavailable until analytics is configured.");
    } catch (error) {
      setMessage("Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await verifyPassword(password);
  }

  function resetPageState() {
    setEditingNews(emptyNews);
    setEditingPublication(emptyPublication);
    setPublicationFile(null);
    setEditingDashboard(emptyDashboard);
  }

  async function fileToBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1] ?? "";
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsDataURL(file);
    });
  }

  async function sendAdminRequest(path: string, method: string, body?: unknown) {
    const response = await fetch(path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401) {
      setAuthenticated(false);
      setMessage("Authorization failed. Please log in again.");
      return null;
    }

    return response.json();
  }

  async function handleExportReport(type: ReportExportType) {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/reports?export=${encodeURIComponent(type)}`, {
        headers,
      });

      if (response.status === 401) {
        setAuthenticated(false);
        setMessage("Authorization failed. Please log in again.");
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setMessage(data?.message || "Could not export report.");
        return;
      }

      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") || "";
      const filenameMatch = disposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] || `sema-${type}.csv`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessage("Report exported.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveNews() {
    setLoading(true);
    try {
      const method = newsList.some((item) => item.slug === editingNews.slug) ? "PATCH" : "POST";
      const path = method === "PATCH" ? `/api/admin/news?slug=${encodeURIComponent(editingNews.slug)}` : "/api/admin/news";
      const payload = {
        ...editingNews,
        body: editingNews.body.join("\n\n"),
      };

      const result = await sendAdminRequest(path, method, payload);
      if (result && !result.message) {
        setMessage("News item saved.");
        await loadAllData(password);
        setEditingNews(emptyNews);
      } else {
        setMessage(result?.message || "Could not save news.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteNews(slug: string) {
    setLoading(true);
    try {
      const result = await sendAdminRequest(`/api/admin/news?slug=${encodeURIComponent(slug)}`, "DELETE");
      if (result?.ok) {
        setMessage("News item deleted.");
        await loadAllData(password);
      } else {
        setMessage(result?.message || "Delete failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePublication() {
    setLoading(true);
    try {
      const method = publicationList.some((item) => item.title === editingPublication.title) ? "PATCH" : "POST";
      const path = method === "PATCH" ? `/api/admin/publications?title=${encodeURIComponent(editingPublication.title)}` : "/api/admin/publications";
      const payload: Record<string, unknown> = { ...editingPublication };

      if (publicationFile) {
        payload.fileName = publicationFile.name;
        payload.fileMime = publicationFile.type || "application/octet-stream";
        payload.fileData = await fileToBase64(publicationFile);
      }

      const result = await sendAdminRequest(path, method, payload);
      if (result && !result.message) {
        setMessage("Publication saved.");
        await loadAllData(password);
        setEditingPublication(emptyPublication);
        setPublicationFile(null);
      } else {
        setMessage(result?.message || "Could not save publication.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletePublication(title: string) {
    setLoading(true);
    try {
      const result = await sendAdminRequest(`/api/admin/publications?title=${encodeURIComponent(title)}`, "DELETE");
      if (result?.ok) {
        setMessage("Publication deleted.");
        await loadAllData(password);
      } else {
        setMessage(result?.message || "Delete failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveDashboard() {
    setLoading(true);
    try {
      const method = dashboardList.some((item) => item.title === editingDashboard.title) ? "PATCH" : "POST";
      const path = method === "PATCH" ? `/api/admin/dashboard-embeds?title=${encodeURIComponent(editingDashboard.title)}` : "/api/admin/dashboard-embeds";
      const payload = { ...editingDashboard };

      const result = await sendAdminRequest(path, method, payload);
      if (result && !result.message) {
        setMessage("Dashboard saved.");
        await loadAllData(password);
        setEditingDashboard(emptyDashboard);
      } else {
        setMessage(result?.message || "Could not save dashboard.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteDashboard(title: string) {
    setLoading(true);
    try {
      const result = await sendAdminRequest(`/api/admin/dashboard-embeds?title=${encodeURIComponent(title)}`, "DELETE");
      if (result?.ok) {
        setMessage("Dashboard deleted.");
        await loadAllData(password);
      } else {
        setMessage(result?.message || "Delete failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateContactMessageStatus(id: string, status: string) {
    setLoading(true);
    try {
      const result = await sendAdminRequest(`/api/admin/contact-messages?id=${encodeURIComponent(id)}`, "PATCH", { status });
      if (result && !result.message) {
        setMessage("Contact message status updated.");
        await loadAllData(password);
      } else {
        setMessage(result?.message || "Could not update message status.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateDataRequestStatus(id: string, status: string, sensitivityLevel: string) {
    setLoading(true);
    try {
      const result = await sendAdminRequest(`/api/admin/data-requests?id=${encodeURIComponent(id)}`, "PATCH", {
        status,
        sensitivityLevel,
      });
      if (result && !result.message) {
        setMessage("Data request status updated.");
        await loadAllData(password);
      } else {
        setMessage(result?.message || "Could not update request status.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!authenticated) {
    return (
      <main className="page admin-page">
        <section className="section">
          <div className="section-inner">
            <h1>SEMA Admin Dashboard</h1>
            <p>Enter your admin password to manage news, publications, dashboard embeds, contact messages, data requests, and reports.</p>
            <form onSubmit={handleLogin} className="admin-login-form">
              <label>
                Admin password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter admin password"
                />
              </label>
              <button className="button" type="submit" disabled={!password || loading}>
                Sign in
              </button>
            </form>
            {message ? <p className="status-message">{message}</p> : null}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page admin-page">
      <section className="section">
        <div className="section-inner">
          <h1>SEMA Admin Dashboard</h1>
          <p>Manage news posts, document publications, dashboard embeds, incoming contact messages, data requests, and operational reports.</p>
          <div className="admin-tabs">
            {adminTabs.map((currentTab) => (
              <button
                key={currentTab}
                type="button"
                className={tab === currentTab ? "button active" : "button secondary"}
                onClick={() => {
                  setTab(currentTab);
                  resetPageState();
                }}
              >
                {currentTab}
              </button>
            ))}
          </div>
          <p className="status-message">{message}</p>

          {tab === "news" ? (
            <section className="admin-section">
              <h2>News posts</h2>
              <div className="grid two admin-grid">
                <div>
                  <h3>{editingNews.slug ? "Edit news item" : "New news item"}</h3>
                  <label>
                    Title
                    <input
                      type="text"
                      value={editingNews.title}
                      onChange={(event) => setEditingNews({ ...editingNews, title: event.target.value })}
                    />
                  </label>
                  <label>
                    Slug
                    <input
                      type="text"
                      value={editingNews.slug}
                      onChange={(event) => setEditingNews({ ...editingNews, slug: event.target.value })}
                    />
                  </label>
                  <label>
                    Date
                    <input
                      type="date"
                      value={editingNews.date}
                      onChange={(event) => setEditingNews({ ...editingNews, date: event.target.value })}
                    />
                  </label>
                  <label>
                    Category
                    <input
                      type="text"
                      value={editingNews.category}
                      onChange={(event) => setEditingNews({ ...editingNews, category: event.target.value })}
                    />
                  </label>
                  <label>
                    Summary
                    <textarea
                      value={editingNews.summary}
                      onChange={(event) => setEditingNews({ ...editingNews, summary: event.target.value })}
                      rows={3}
                    />
                  </label>
                  <label>
                    Image URL
                    <input
                      type="text"
                      value={editingNews.image}
                      onChange={(event) => setEditingNews({ ...editingNews, image: event.target.value })}
                    />
                  </label>
                  <label>
                    Source label
                    <input
                      type="text"
                      value={editingNews.sourceLabel ?? ""}
                      onChange={(event) => setEditingNews({ ...editingNews, sourceLabel: event.target.value })}
                    />
                  </label>
                  <label>
                    Source URL
                    <input
                      type="text"
                      value={editingNews.sourceUrl ?? ""}
                      onChange={(event) => setEditingNews({ ...editingNews, sourceUrl: event.target.value })}
                    />
                  </label>
                  <label>
                    Body paragraphs (blank line separates paragraphs)
                    <textarea
                      value={editingNews.body.join("\n\n")}
                      onChange={(event) => setEditingNews({ ...editingNews, body: event.target.value.split(/\n\n+/) })}
                      rows={6}
                    />
                  </label>
                  <label>
                    Status
                    <select
                      value={editingNews.status}
                      onChange={(event) => setEditingNews({ ...editingNews, status: event.target.value })}
                    >
                      <option value="published">published</option>
                      <option value="draft">draft</option>
                      <option value="archived">archived</option>
                    </select>
                  </label>
                  <div className="button-row">
                    <button className="button" type="button" onClick={handleSaveNews} disabled={loading || !editingNews.title || !editingNews.slug}>
                      Save news
                    </button>
                    <button className="button secondary" type="button" onClick={() => setEditingNews(emptyNews)}>
                      Clear
                    </button>
                  </div>
                </div>
                <div>
                  <h3>Existing news</h3>
                  <div className="admin-list">
                    {newsList.map((item) => (
                      <article key={item.slug} className="admin-list-card">
                        <strong>{item.title}</strong>
                        <p>{item.category}</p>
                        <p>{item.date}</p>
                        <div className="button-row">
                          <button
                            className="button secondary"
                            type="button"
                            onClick={() => setEditingNews(item)}
                          >
                            Edit
                          </button>
                          <button className="button danger" type="button" onClick={() => handleDeleteNews(item.slug)}>
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {tab === "publications" ? (
            <section className="admin-section">
              <h2>Publications</h2>
              <div className="grid two admin-grid">
                <div>
                  <h3>{editingPublication.title ? "Edit publication" : "New publication"}</h3>
                  <label>
                    Title
                    <input
                      type="text"
                      value={editingPublication.title}
                      onChange={(event) => setEditingPublication({ ...editingPublication, title: event.target.value })}
                    />
                  </label>
                  <label>
                    Type
                    <input
                      type="text"
                      value={editingPublication.type}
                      onChange={(event) => setEditingPublication({ ...editingPublication, type: event.target.value })}
                    />
                  </label>
                  <label>
                    Description
                    <textarea
                      value={editingPublication.description}
                      onChange={(event) => setEditingPublication({ ...editingPublication, description: event.target.value })}
                      rows={4}
                    />
                  </label>
                  <label>
                    URL
                    <input
                      type="text"
                      value={editingPublication.href}
                      onChange={(event) => setEditingPublication({ ...editingPublication, href: event.target.value })}
                    />
                  </label>
                  <label>
                    File upload
                    <input
                      type="file"
                      onChange={(event) => setPublicationFile(event.target.files?.[0] ?? null)}
                    />
                    {publicationFile ? <small>Selected: {publicationFile.name}</small> : <small>No file selected</small>}
                  </label>
                  <label>
                    Source
                    <input
                      type="text"
                      value={editingPublication.source}
                      onChange={(event) => setEditingPublication({ ...editingPublication, source: event.target.value })}
                    />
                  </label>
                  <label>
                    Publication date
                    <input
                      type="date"
                      value={editingPublication.publication_date ?? ""}
                      onChange={(event) => setEditingPublication({ ...editingPublication, publication_date: event.target.value })}
                    />
                  </label>
                  <label>
                    Status
                    <select
                      value={editingPublication.status}
                      onChange={(event) => setEditingPublication({ ...editingPublication, status: event.target.value })}
                    >
                      <option value="published">published</option>
                      <option value="draft">draft</option>
                      <option value="archived">archived</option>
                    </select>
                  </label>
                  <div className="button-row">
                    <button className="button" type="button" onClick={handleSavePublication} disabled={loading || !editingPublication.title || (!editingPublication.href && !publicationFile)}>
                      Save publication
                    </button>
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() => {
                        setEditingPublication(emptyPublication);
                        setPublicationFile(null);
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div>
                  <h3>Existing publications</h3>
                  <div className="admin-list">
                    {publicationList.map((item) => (
                      <article key={item.title} className="admin-list-card">
                        <strong>{item.title}</strong>
                        <p>{item.type}</p>
                        <p>{item.source}</p>
                        <div className="button-row">
                          <button
                            className="button secondary"
                            type="button"
                            onClick={() => {
                              setEditingPublication(item);
                              setPublicationFile(null);
                            }}
                          >
                            Edit
                          </button>
                          <button className="button danger" type="button" onClick={() => handleDeletePublication(item.title)}>
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {tab === "dashboards" ? (
            <section className="admin-section">
              <h2>Dashboards</h2>
              <div className="grid two admin-grid">
                <div>
                  <h3>{editingDashboard.title ? "Edit dashboard" : "New dashboard"}</h3>
                  <label>
                    Title
                    <input
                      type="text"
                      value={editingDashboard.title}
                      onChange={(event) => setEditingDashboard({ ...editingDashboard, title: event.target.value })}
                    />
                  </label>
                  <label>
                    Provider
                    <select
                      value={editingDashboard.provider}
                      onChange={(event) => setEditingDashboard({ ...editingDashboard, provider: event.target.value })}
                    >
                      <option value="arcgis">arcgis</option>
                      <option value="powerbi">powerbi</option>
                      <option value="other">other</option>
                    </select>
                  </label>
                  <label>
                    Dashboard URL
                    <input
                      type="text"
                      value={editingDashboard.url}
                      onChange={(event) => setEditingDashboard({ ...editingDashboard, url: event.target.value })}
                    />
                  </label>
                  <label>
                    Description
                    <textarea
                      value={editingDashboard.description}
                      onChange={(event) => setEditingDashboard({ ...editingDashboard, description: event.target.value })}
                      rows={4}
                    />
                  </label>
                  <label>
                    Public safe
                    <input
                      type="checkbox"
                      checked={editingDashboard.public_safe ?? false}
                      onChange={(event) => setEditingDashboard({ ...editingDashboard, public_safe: event.target.checked })}
                    />
                  </label>
                  <label>
                    Status
                    <select
                      value={editingDashboard.status}
                      onChange={(event) => setEditingDashboard({ ...editingDashboard, status: event.target.value })}
                    >
                      <option value="published">published</option>
                      <option value="draft">draft</option>
                      <option value="archived">archived</option>
                    </select>
                  </label>
                  <div className="button-row">
                    <button className="button" type="button" onClick={handleSaveDashboard} disabled={loading || !editingDashboard.title || !editingDashboard.url}>
                      Save dashboard
                    </button>
                    <button className="button secondary" type="button" onClick={() => setEditingDashboard(emptyDashboard)}>
                      Clear
                    </button>
                  </div>
                </div>
                <div>
                  <h3>Existing dashboards</h3>
                  <div className="admin-list">
                    {dashboardList.map((item) => (
                      <article key={item.title} className="admin-list-card">
                        <strong>{item.title}</strong>
                        <p>{item.provider || "other"}</p>
                        <p>{item.url}</p>
                        <div className="button-row">
                          <button className="button secondary" type="button" onClick={() => setEditingDashboard(item)}>
                            Edit
                          </button>
                          <button className="button danger" type="button" onClick={() => handleDeleteDashboard(item.title)}>
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {tab === "messages" ? (
            <section className="admin-section">
              <h2>Contact messages</h2>
              <div className="admin-list">
                {contactMessages.map((message) => (
                  <article key={message.id} className="admin-list-card">
                    <strong>{message.subject}</strong>
                    <p>
                      {message.name} • {message.email}
                    </p>
                    {message.organization ? <p>{message.organization}</p> : null}
                    <p>Type: {message.enquiryType}</p>
                    <p>Status:</p>
                    <label>
                      <select
                        value={message.status}
                        onChange={(event) =>
                          setContactMessages((current) =>
                            current.map((item) =>
                              item.id === message.id ? { ...item, status: event.target.value } : item,
                            ),
                          )
                        }
                      >
                        <option value="new">new</option>
                        <option value="reviewing">reviewing</option>
                        <option value="responded">responded</option>
                        <option value="closed">closed</option>
                      </select>
                    </label>
                    <p>{message.message}</p>
                    <div className="button-row">
                      <button
                        className="button"
                        type="button"
                        disabled={loading}
                        onClick={() => handleUpdateContactMessageStatus(message.id, message.status)}
                      >
                        Save status
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {tab === "requests" ? (
            <section className="admin-section">
              <h2>Data requests</h2>
              <div className="admin-list">
                {dataRequests.map((request) => (
                  <article key={request.id} className="admin-list-card">
                    <strong>{request.requestRef}</strong>
                    <p>
                      {request.name} • {request.email}
                    </p>
                    {request.organization ? <p>{request.organization}</p> : null}
                    <p>{request.requesterType}</p>
                    <p>Preferred format: {request.preferredFormat}</p>
                    <p>Requested data: {request.dataRequested}</p>
                    <label>
                      Status:
                      <select
                        value={request.status}
                        onChange={(event) =>
                          setDataRequests((current) =>
                            current.map((item) =>
                              item.id === request.id ? { ...item, status: event.target.value } : item,
                            ),
                          )
                        }
                      >
                        <option value="submitted">submitted</option>
                        <option value="screening">screening</option>
                        <option value="clarification_needed">clarification_needed</option>
                        <option value="approved">approved</option>
                        <option value="fulfilled">fulfilled</option>
                        <option value="declined">declined</option>
                        <option value="closed">closed</option>
                      </select>
                    </label>
                    <label>
                      Sensitivity:
                      <select
                        value={request.sensitivityLevel}
                        onChange={(event) =>
                          setDataRequests((current) =>
                            current.map((item) =>
                              item.id === request.id ? { ...item, sensitivityLevel: event.target.value } : item,
                            ),
                          )
                        }
                      >
                        <option value="pending_review">pending_review</option>
                        <option value="public">public</option>
                        <option value="restricted">restricted</option>
                        <option value="confidential">confidential</option>
                      </select>
                    </label>
                    <div className="button-row">
                      <button
                        className="button"
                        type="button"
                        disabled={loading}
                        onClick={() => handleUpdateDataRequestStatus(request.id, request.status, request.sensitivityLevel)}
                      >
                        Save request
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {tab === "reports" ? (
            <section className="admin-section">
              <div className="section-heading admin-report-heading">
                <div>
                  <h2>Reports</h2>
                  <p>
                    Export SEMA data requests, contact messages, news publishing counts, dashboard opens, and website tab clicks.
                  </p>
                </div>
                <button className="button light" type="button" onClick={() => loadAllData(password)} disabled={loading}>
                  Refresh
                </button>
              </div>

              <div className="report-grid">
                <article className="report-card">
                  <span>Data requests</span>
                  <strong>{formatNumber(reportSummary?.totals.dataRequests ?? dataRequests.length)}</strong>
                </article>
                <article className="report-card">
                  <span>Contact messages</span>
                  <strong>{formatNumber(reportSummary?.totals.contactMessages ?? contactMessages.length)}</strong>
                </article>
                <article className="report-card">
                  <span>Published news</span>
                  <strong>{formatNumber(reportSummary?.totals.publishedNews ?? newsList.filter((item) => item.status === "published").length)}</strong>
                </article>
                <article className="report-card">
                  <span>Draft news</span>
                  <strong>{formatNumber(reportSummary?.totals.draftNews ?? newsList.filter((item) => item.status === "draft").length)}</strong>
                </article>
                <article className="report-card">
                  <span>Dashboard opens</span>
                  <strong>{formatNumber(reportSummary?.totals.dashboardClicks)}</strong>
                </article>
                <article className="report-card">
                  <span>Website tab clicks</span>
                  <strong>{formatNumber(reportSummary?.totals.navClicks)}</strong>
                </article>
              </div>

              <div className="admin-export-panel">
                <h3>Exports</h3>
                <div className="button-row">
                  {reportExports.map((report) => (
                    <button
                      key={report.type}
                      className="button light"
                      type="button"
                      disabled={loading}
                      onClick={() => handleExportReport(report.type)}
                    >
                      {report.label}
                    </button>
                  ))}
                </div>
                <p className="muted">
                  Click tracking starts from this release. SEMA can count site navigation and dashboard-open clicks; clicks made inside third-party ArcGIS or PowerBI embeds remain private to those platforms.
                </p>
              </div>

              <div className="admin-report-panels">
                <article className="admin-report-panel">
                  <h3>Published news by theme and date</h3>
                  {reportSummary?.newsByThemeDate.length ? (
                    <div className="report-table-wrap">
                      <table className="report-table">
                        <thead>
                          <tr>
                            <th>Theme</th>
                            <th>Date</th>
                            <th>Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportSummary.newsByThemeDate.map((row) => (
                            <tr key={`${row.category}-${row.publishedDate}`}>
                              <td>{row.category}</td>
                              <td>{row.publishedDate}</td>
                              <td>{formatNumber(row.count)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="muted">No published news counts available yet.</p>
                  )}
                </article>

                <article className="admin-report-panel">
                  <h3>Dashboard opens</h3>
                  {reportSummary?.dashboardClicks.length ? (
                    <div className="report-table-wrap">
                      <table className="report-table">
                        <thead>
                          <tr>
                            <th>Dashboard</th>
                            <th>Clicks</th>
                            <th>Last click</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportSummary.dashboardClicks.map((row) => (
                            <tr key={`${row.label}-${row.targetUrl}`}>
                              <td>{row.label}</td>
                              <td>{formatNumber(row.count)}</td>
                              <td>{formatDateTime(row.lastClick)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="muted">No dashboard clicks recorded yet.</p>
                  )}
                </article>

                <article className="admin-report-panel">
                  <h3>Website tab clicks</h3>
                  {reportSummary?.navClicks.length ? (
                    <div className="report-table-wrap">
                      <table className="report-table">
                        <thead>
                          <tr>
                            <th>Tab or action</th>
                            <th>Target</th>
                            <th>Clicks</th>
                            <th>Last click</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportSummary.navClicks.map((row) => (
                            <tr key={`${row.eventType}-${row.label}-${row.targetUrl}`}>
                              <td>{row.label}</td>
                              <td>{row.targetUrl || "Not recorded"}</td>
                              <td>{formatNumber(row.count)}</td>
                              <td>{formatDateTime(row.lastClick)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="muted">No website tab clicks recorded yet.</p>
                  )}
                </article>
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}
