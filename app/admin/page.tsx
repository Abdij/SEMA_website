"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type AdminTab = "news" | "publications" | "dashboards";

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
};

type DashboardItem = {
  title: string;
  description: string;
  url: string;
  provider?: string;
  public_safe?: boolean;
  status?: string;
};

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

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<AdminTab>("news");
  const [message, setMessage] = useState("");
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [publicationList, setPublicationList] = useState<PublicationItem[]>([]);
  const [dashboardList, setDashboardList] = useState<DashboardItem[]>([]);
  const [editingNews, setEditingNews] = useState<NewsItem>(emptyNews);
  const [editingPublication, setEditingPublication] = useState<PublicationItem>(emptyPublication);
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
      const [newsResponse, publicationsResponse, dashboardsResponse] = await Promise.all([
        fetch("/api/admin/news", { headers: authHeader(authValue) }),
        fetch("/api/admin/publications", { headers: authHeader(authValue) }),
        fetch("/api/admin/dashboard-embeds", { headers: authHeader(authValue) }),
      ]);

      if (!newsResponse.ok || !publicationsResponse.ok || !dashboardsResponse.ok) {
        setAuthenticated(false);
        setMessage("Authorization failed. Please log in again.");
        return;
      }

      const [newsData, publicationsData, dashboardData] = await Promise.all([
        newsResponse.json(),
        publicationsResponse.json(),
        dashboardsResponse.json(),
      ]);

      setNewsList(Array.isArray(newsData) ? newsData : []);
      setPublicationList(Array.isArray(publicationsData) ? publicationsData : []);
      setDashboardList(Array.isArray(dashboardData) ? dashboardData : []);
      setMessage("Data loaded.");
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
    setEditingDashboard(emptyDashboard);
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
      const payload = { ...editingPublication };

      const result = await sendAdminRequest(path, method, payload);
      if (result && !result.message) {
        setMessage("Publication saved.");
        await loadAllData(password);
        setEditingPublication(emptyPublication);
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

  if (!authenticated) {
    return (
      <main className="page admin-page">
        <section className="section">
          <div className="section-inner">
            <h1>SEMA Admin Dashboard</h1>
            <p>Enter your admin password to manage news, publications, and dashboard embeds.</p>
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
          <p>Manage news posts, document publications, and public dashboard embeds.</p>
          <div className="admin-tabs">
            {(["news", "publications", "dashboards"] as AdminTab[]).map((currentTab) => (
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
                    <button className="button" type="button" onClick={handleSavePublication} disabled={loading || !editingPublication.title || !editingPublication.href}>
                      Save publication
                    </button>
                    <button className="button secondary" type="button" onClick={() => setEditingPublication(emptyPublication)}>
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
                          <button className="button secondary" type="button" onClick={() => setEditingPublication(item)}>
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
        </div>
      </section>
    </main>
  );
}
