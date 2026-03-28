import os
import sqlite3
from datetime import datetime
from pathlib import Path

import pandas as pd
import streamlit as st

APP_DIR = Path(__file__).parent
DB_PATH = APP_DIR / "hazards.db"

st.set_page_config(
    page_title="SEMA | Somalia Explosive Management Authority",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded",
)

CUSTOM_CSS = """
<style>
.block-container {
    padding-top: 1.5rem;
    padding-bottom: 2rem;
}
.hero {
    background: linear-gradient(105deg, #ffffff 0%, #eef5f3 100%);
    border: 1px solid rgba(30,127,110,0.15);
    border-radius: 24px;
    padding: 2rem;
    margin-bottom: 1rem;
}
.badge {
    display: inline-block;
    padding: 0.35rem 0.8rem;
    border-radius: 999px;
    background: rgba(30,127,110,0.12);
    color: #1e7f6e;
    font-weight: 600;
    font-size: 0.85rem;
    margin-bottom: 0.8rem;
}
.card {
    background: #ffffff;
    border: 1px solid #e6f0ee;
    border-radius: 20px;
    padding: 1.2rem;
    height: 100%;
    box-shadow: 0 10px 24px rgba(0,0,0,0.03);
}
.metric-card {
    background: #0a2b3e;
    border-radius: 18px;
    padding: 1rem;
    color: white;
    text-align: center;
}
.metric-card h3 {
    color: #d4af37;
    margin: 0;
    font-size: 2rem;
}
.small-muted {
    color: #4a6272;
    font-size: 0.95rem;
}
hr {
    margin-top: 1.2rem;
    margin-bottom: 1.2rem;
}
</style>
"""

SEVERITY_OPTIONS = ["Low", "Medium", "High", "Critical"]
STATUS_OPTIONS = ["Submitted", "Validated", "Dispatched", "Resolved"]


def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_conn()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS hazard_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_ref TEXT UNIQUE,
            reporter_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            district TEXT NOT NULL,
            exact_location TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            hazard_type TEXT NOT NULL,
            severity TEXT NOT NULL,
            description TEXT NOT NULL,
            people_at_risk INTEGER DEFAULT 0,
            immediate_danger INTEGER DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'Submitted',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def make_report_ref():
    return f"SEMA-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"


def insert_report(data: dict):
    conn = get_conn()
    conn.execute(
        """
        INSERT INTO hazard_reports (
            report_ref, reporter_name, phone, email, district, exact_location,
            latitude, longitude, hazard_type, severity, description,
            people_at_risk, immediate_danger, status, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            data["report_ref"],
            data["reporter_name"],
            data["phone"],
            data["email"],
            data["district"],
            data["exact_location"],
            data["latitude"],
            data["longitude"],
            data["hazard_type"],
            data["severity"],
            data["description"],
            data["people_at_risk"],
            1 if data["immediate_danger"] else 0,
            "Submitted",
            data["created_at"],
            data["updated_at"],
        ),
    )
    conn.commit()
    conn.close()


def get_reports():
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM hazard_reports ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    return pd.DataFrame([dict(r) for r in rows]) if rows else pd.DataFrame()


def update_status(report_id: int, new_status: str):
    conn = get_conn()
    conn.execute(
        "UPDATE hazard_reports SET status = ?, updated_at = ? WHERE id = ?",
        (new_status, datetime.utcnow().isoformat(), report_id),
    )
    conn.commit()
    conn.close()


def seed_demo_data():
    df = get_reports()
    if not df.empty:
        return
    demo_rows = [
        {
            "report_ref": "SEMA-DEMO-001",
            "reporter_name": "Ahmed Noor",
            "phone": "+25261111222",
            "email": "ahmed@example.com",
            "district": "Mogadishu",
            "exact_location": "Near KM4 junction",
            "latitude": 2.0469,
            "longitude": 45.3182,
            "hazard_type": "Unexploded ordnance",
            "severity": "High",
            "description": "Suspicious explosive item observed near roadside drainage area.",
            "people_at_risk": 18,
            "immediate_danger": True,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        },
        {
            "report_ref": "SEMA-DEMO-002",
            "reporter_name": "Halima Yusuf",
            "phone": "+25261222333",
            "email": "halima@example.com",
            "district": "Baidoa",
            "exact_location": "Village school compound",
            "latitude": None,
            "longitude": None,
            "hazard_type": "Abandoned ammunition",
            "severity": "Medium",
            "description": "Children reported metallic object inside old storage area.",
            "people_at_risk": 45,
            "immediate_danger": False,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        },
    ]
    for row in demo_rows:
        insert_report(row)


def auth_ok():
    expected = st.secrets.get("ADMIN_PASSWORD", os.getenv("ADMIN_PASSWORD", ""))
    if not expected:
        st.info("Admin dashboard is open because no ADMIN_PASSWORD is configured.")
        return True

    if st.session_state.get("admin_ok"):
        return True

    pwd = st.text_input("Enter admin password", type="password")
    if st.button("Unlock dashboard", use_container_width=True):
        if pwd == expected:
            st.session_state["admin_ok"] = True
            st.success("Dashboard unlocked.")
            st.rerun()
        else:
            st.error("Incorrect password.")
    return False


def render_home():
    st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

    st.markdown(
        """
        <div class="hero">
            <div class="badge">National Mandate</div>
            <h1 style="color:#0a2b3e;margin-bottom:0.5rem;">Securing Somalia from Explosive Threats</h1>
            <p style="font-size:1.1rem;color:#2c4c5c;max-width:900px;">
                Coordinating national efforts in explosive hazard management, risk reduction,
                and capacity building for a safer Somalia.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    df = get_reports()
    submitted = len(df)
    critical = len(df[df["severity"] == "Critical"]) if not df.empty else 0
    high = len(df[df["severity"] == "High"]) if not df.empty else 0
    resolved = len(df[df["status"] == "Resolved"]) if not df.empty else 0

    c1, c2, c3, c4 = st.columns(4)
    for col, label, value in [
        (c1, "Reports Received", submitted),
        (c2, "Critical Cases", critical),
        (c3, "High Severity", high),
        (c4, "Resolved", resolved),
    ]:
        with col:
            st.markdown(
                f'<div class="metric-card"><h3>{value}</h3><div>{label}</div></div>',
                unsafe_allow_html=True,
            )

    st.write("")
    a, b, c = st.columns(3)
    with a:
        st.markdown(
            """
            <div class="card">
                <h3 style="color:#0a2b3e;">Mission</h3>
                <p>Protect Somali lives and infrastructure by regulating, managing, and reducing explosive risks through coordinated national strategy and technical expertise.</p>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with b:
        st.markdown(
            """
            <div class="card">
                <h3 style="color:#0a2b3e;">Vision</h3>
                <p>A Somalia free from the threat of explosive ordnance, where safety, development, and stability prevail for all citizens.</p>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with c:
        st.markdown(
            """
            <div class="card">
                <h3 style="color:#0a2b3e;">Partnerships</h3>
                <p>Collaborating with federal states, international agencies, NGOs, and local communities for sustainable explosive management.</p>
            </div>
            """,
            unsafe_allow_html=True,
        )

    st.subheader("Core Functions")
    x1, x2, x3, x4 = st.columns(4)
    items = [
        ("Ordnance Registry", "Maintaining records of explosive remnants, stockpiles, and risk mapping."),
        ("EOD Training", "Supporting advanced explosive ordnance disposal and IED defeat capacity."),
        ("Regulatory Oversight", "Monitoring commercial explosives, storage facilities, and transport safety."),
        ("Community Awareness", "Risk education to protect civilians from explosive hazards."),
    ]
    for col, item in zip([x1, x2, x3, x4], items):
        with col:
            st.markdown(
                f"""
                <div class="card">
                    <h4 style="color:#1e7f6e;">{item[0]}</h4>
                    <p>{item[1]}</p>
                </div>
                """,
                unsafe_allow_html=True,
            )

    st.subheader("Latest Updates")
    n1, n2, n3 = st.columns(3)
    updates = [
        ("March 20, 2026", "New EOD training center opens in Mogadishu"),
        ("March 5, 2026", "Community risk awareness campaign reaches 15 districts"),
        ("February 18, 2026", "Seizure of illegal explosives in joint operation"),
    ]
    for col, (date_txt, title) in zip([n1, n2, n3], updates):
        with col:
            st.markdown(
                f"""
                <div class="card">
                    <div class="small-muted">{date_txt}</div>
                    <h4 style="color:#0a2b3e;">{title}</h4>
                    <p>This section can later connect to a CMS, Google Sheet, or database for live updates.</p>
                </div>
                """,
                unsafe_allow_html=True,
            )

    st.info("Use the sidebar to submit a hazard report or open the operations dashboard.")


def render_report_form():
    st.title("Report an Explosive Hazard")
    st.write("If you suspect unexploded ordnance or suspicious devices, stay clear and submit details below.")

    with st.form("hazard_report_form", clear_on_submit=True):
        col1, col2 = st.columns(2)
        with col1:
            reporter_name = st.text_input("Reporter name *")
            phone = st.text_input("Phone number *")
            email = st.text_input("Email")
            district = st.text_input("District / Area *")
        with col2:
            exact_location = st.text_input("Exact location / landmark *")
            latitude = st.text_input("Latitude")
            longitude = st.text_input("Longitude")
            people_at_risk = st.number_input("Estimated people at risk", min_value=0, step=1)

        hazard_type = st.selectbox(
            "Hazard type *",
            [
                "Unexploded ordnance",
                "Landmine / suspected mine",
                "Improvised explosive device",
                "Abandoned ammunition",
                "Stockpile risk",
                "Other",
            ],
        )
        severity = st.selectbox("Severity *", SEVERITY_OPTIONS, index=2)
        immediate_danger = st.checkbox("Immediate danger to civilians")
        description = st.text_area("Description *", height=150)

        submitted = st.form_submit_button("Submit report", use_container_width=True)

    if submitted:
        errors = []
        if not reporter_name.strip():
            errors.append("Reporter name is required.")
        if not phone.strip():
            errors.append("Phone number is required.")
        if not district.strip():
            errors.append("District / area is required.")
        if not exact_location.strip():
            errors.append("Exact location is required.")
        if not description.strip():
            errors.append("Description is required.")

        lat_val = None
        lon_val = None
        if latitude.strip():
            try:
                lat_val = float(latitude)
            except ValueError:
                errors.append("Latitude must be a valid number.")
        if longitude.strip():
            try:
                lon_val = float(longitude)
            except ValueError:
                errors.append("Longitude must be a valid number.")

        if errors:
            for err in errors:
                st.error(err)
        else:
            now = datetime.utcnow().isoformat()
            report_ref = make_report_ref()
            insert_report(
                {
                    "report_ref": report_ref,
                    "reporter_name": reporter_name.strip(),
                    "phone": phone.strip(),
                    "email": email.strip(),
                    "district": district.strip(),
                    "exact_location": exact_location.strip(),
                    "latitude": lat_val,
                    "longitude": lon_val,
                    "hazard_type": hazard_type,
                    "severity": severity,
                    "description": description.strip(),
                    "people_at_risk": int(people_at_risk),
                    "immediate_danger": immediate_danger,
                    "created_at": now,
                    "updated_at": now,
                }
            )
            st.success(f"Report submitted successfully. Reference: {report_ref}")
            st.caption("Please keep this reference for follow-up.")

    st.markdown("---")
    st.subheader("Emergency Contact")
    c1, c2, c3 = st.columns(3)
    c1.metric("Phone", "+252 61 555 7890")
    c2.metric("Email", "contact@sema.gov.so")
    c3.metric("Location", "KM4, Mogadishu, Somalia")


def render_dashboard():
    st.title("Operations Dashboard")
    if not auth_ok():
        return

    df = get_reports()
    if df.empty:
        st.warning("No reports available yet.")
        return

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total", len(df))
    col2.metric("Submitted", int((df["status"] == "Submitted").sum()))
    col3.metric("Dispatched", int((df["status"] == "Dispatched").sum()))
    col4.metric("Resolved", int((df["status"] == "Resolved").sum()))

    st.subheader("Filters")
    f1, f2, f3 = st.columns(3)
    selected_status = f1.multiselect("Status", STATUS_OPTIONS, default=STATUS_OPTIONS)
    selected_severity = f2.multiselect("Severity", SEVERITY_OPTIONS, default=SEVERITY_OPTIONS)
    district_search = f3.text_input("District contains")

    filtered = df[
        df["status"].isin(selected_status) &
        df["severity"].isin(selected_severity)
    ].copy()

    if district_search.strip():
        filtered = filtered[
            filtered["district"].str.contains(district_search.strip(), case=False, na=False)
        ]

    st.dataframe(
        filtered[
            [
                "id", "report_ref", "reporter_name", "phone", "district", "hazard_type",
                "severity", "people_at_risk", "immediate_danger", "status", "created_at"
            ]
        ],
        use_container_width=True,
        hide_index=True
    )

    st.subheader("Update Report Status")
    report_ids = filtered["id"].tolist()
    if report_ids:
        up1, up2 = st.columns([2, 2])
        selected_id = up1.selectbox("Select report ID", report_ids)
        new_status = up2.selectbox("New status", STATUS_OPTIONS)
        if st.button("Update status", use_container_width=True):
            update_status(int(selected_id), new_status)
            st.success(f"Report {selected_id} updated to {new_status}.")
            st.rerun()

    st.subheader("Report Details")
    detail_id = st.selectbox("View details for report ID", df["id"].tolist(), key="detail_view")
    selected = df[df["id"] == detail_id].iloc[0]
    st.json(
        {
            "reference": selected["report_ref"],
            "reporter_name": selected["reporter_name"],
            "phone": selected["phone"],
            "email": selected["email"],
            "district": selected["district"],
            "exact_location": selected["exact_location"],
            "latitude": selected["latitude"],
            "longitude": selected["longitude"],
            "hazard_type": selected["hazard_type"],
            "severity": selected["severity"],
            "people_at_risk": int(selected["people_at_risk"]),
            "immediate_danger": bool(selected["immediate_danger"]),
            "status": selected["status"],
            "description": selected["description"],
            "created_at": selected["created_at"],
            "updated_at": selected["updated_at"],
        }
    )

    csv = filtered.to_csv(index=False).encode("utf-8")
    st.download_button(
        "Download filtered reports as CSV",
        data=csv,
        file_name="hazard_reports.csv",
        mime="text/csv",
    )


init_db()
seed_demo_data()

st.sidebar.title("SEMA Navigation")
page = st.sidebar.radio("Go to", ["Home", "Report Hazard", "Dashboard"])
st.sidebar.markdown("---")
st.sidebar.caption("Built with Streamlit + SQLite")

if page == "Home":
    render_home()
elif page == "Report Hazard":
    render_report_form()
else:
    render_dashboard()
