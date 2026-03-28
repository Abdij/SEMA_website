import sqlite3
from datetime import datetime

import pandas as pd
import streamlit as st

# -------------------------
# PAGE CONFIG
# -------------------------
st.set_page_config(
    page_title="SEMA | Somalia Explosive Management Authority",
    page_icon="💣",
    layout="wide",
    initial_sidebar_state="expanded",
)

# -------------------------
# BRAND COLORS
# -------------------------
SEMA_RED = "#CC0000"
SEMA_BLUE = "#003366"
SEMA_WHITE = "#FFFFFF"
SEMA_BLACK = "#000000"
SEMA_GRAY = "#666666"
SEMA_LIGHT_BG = "#F5F5F5"

STATUS_OPTIONS = ["Submitted", "Validated", "Dispatched", "Resolved"]
SEVERITY_OPTIONS = ["Low", "Medium", "High", "Critical"]

# -------------------------
# DATABASE
# -------------------------
DB_PATH = "sema_reports.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS reports (
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


def generate_report_ref():
    return f"SEMA-{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')[:-3]}"


def insert_report(data):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO reports (
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
            data["status"],
            data["created_at"],
            data["updated_at"],
        ),
    )
    conn.commit()
    conn.close()


def get_all_reports():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM reports ORDER BY created_at DESC").fetchall()
    conn.close()
    if not rows:
        return pd.DataFrame()
    return pd.DataFrame([dict(row) for row in rows])


def update_report_status(report_id, new_status):
    conn = get_connection()
    conn.execute(
        "UPDATE reports SET status = ?, updated_at = ? WHERE id = ?",
        (new_status, datetime.utcnow().isoformat(), report_id),
    )
    conn.commit()
    conn.close()


def seed_demo_data():
    df = get_all_reports()
    if not df.empty:
        return

    demo_reports = [
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
            "status": "Submitted",
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
            "description": "Children reported metallic object inside an old storage area.",
            "people_at_risk": 45,
            "immediate_danger": False,
            "status": "Validated",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        },
    ]

    for report in demo_reports:
        insert_report(report)


# -------------------------
# CUSTOM CSS
# -------------------------
st.markdown(
    f"""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    html, body, [class*="css"]  {{
        font-family: 'Inter', sans-serif;
    }}

    .stApp {{
        background-color: {SEMA_WHITE};
    }}

    .main-header {{
        background: {SEMA_WHITE};
        border-bottom: 3px solid {SEMA_RED};
        padding: 1rem 0;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        margin-bottom: 1rem;
    }}

    .logo-text h1 {{
        font-size: 1.8rem;
        font-weight: 800;
        color: {SEMA_BLUE};
        margin: 0;
        letter-spacing: -0.5px;
    }}

    .logo-text p {{
        font-size: 0.85rem;
        color: {SEMA_RED};
        margin: 0;
        font-weight: 500;
    }}

    .hero {{
        background: linear-gradient(135deg, {SEMA_BLUE} 0%, #001a33 100%);
        padding: 2.5rem;
        color: {SEMA_WHITE};
        border-radius: 18px;
        margin-bottom: 2rem;
    }}

    .hero h1 {{
        font-size: 2.7rem;
        font-weight: 800;
        margin-bottom: 0.8rem;
    }}

    .hero p {{
        font-size: 1.1rem;
        opacity: 0.95;
        margin-bottom: 1.2rem;
    }}

    .badge {{
        display: inline-block;
        background: {SEMA_RED};
        color: white;
        padding: 0.3rem 0.9rem;
        border-radius: 999px;
        font-size: 0.82rem;
        margin-right: 0.4rem;
        margin-bottom: 0.4rem;
    }}

    .stat-card {{
        background: {SEMA_WHITE};
        border-left: 4px solid {SEMA_RED};
        padding: 1.2rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        border-radius: 10px;
        height: 100%;
    }}

    .stat-number {{
        font-size: 2rem;
        font-weight: 800;
        color: {SEMA_BLUE};
    }}

    .section-title {{
        font-size: 2rem;
        font-weight: 800;
        color: {SEMA_BLUE};
        margin-top: 1rem;
        margin-bottom: 1rem;
    }}

    .activity-card, .news-card {{
        background: {SEMA_WHITE};
        padding: 1.2rem;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        border: 1px solid #e0e0e0;
        height: 100%;
    }}

    .activity-card h3, .news-card h3 {{
        color: {SEMA_BLUE};
        font-size: 1.15rem;
        margin-bottom: 0.65rem;
    }}

    .news-date {{
        color: {SEMA_RED};
        font-size: 0.85rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }}

    .highlight-box {{
        background: {SEMA_LIGHT_BG};
        padding: 1.5rem;
        border-radius: 14px;
        margin: 2rem 0;
    }}

    .footer {{
        background: {SEMA_BLACK};
        color: {SEMA_WHITE};
        padding: 2rem;
        border-radius: 14px;
        margin-top: 2rem;
    }}

    .footer h4 {{
        color: {SEMA_RED};
        margin-bottom: 0.8rem;
    }}

    .small-note {{
        color: {SEMA_GRAY};
        font-size: 0.92rem;
    }}
</style>
""",
    unsafe_allow_html=True,
)

# -------------------------
# INIT
# -------------------------
init_db()
seed_demo_data()

# -------------------------
# SIDEBAR
# -------------------------
st.sidebar.title("SEMA System")
page = st.sidebar.radio("Navigation", ["Home", "Report Hazard", "Dashboard"])

st.sidebar.markdown("---")
st.sidebar.caption("Built with Streamlit + SQLite")

# -------------------------
# HEADER
# -------------------------
st.markdown(
    """
    <div class="main-header">
        <div class="logo-text">
            <h1>SEMA</h1>
            <p>Somalia Explosive Management Authority</p>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# -------------------------
# HOME PAGE
# -------------------------
if page == "Home":
    st.markdown(
        f"""
        <div class="hero">
            <div>
                <span class="badge">Ministry of Interior</span>
                <span class="badge">Federal Government of Somalia</span>
            </div>
            <h1>Somalia National Mine Action Center</h1>
            <p>
                Plans, organizes and coordinates mine action activities, informs citizens,
                and supports training and certification of mine action operators.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    c1, c2 = st.columns(2)
    with c1:
        st.markdown(
            """
            <div class="stat-card">
                <div class="stat-number">about 30%</div>
                <p>of the territory of Somalia is contaminated by mines and unexploded ordnance.</p>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with c2:
        st.markdown(
            """
            <div class="stat-card">
                <div class="stat-number">more than 139,000 km²</div>
                <p>of land and 14,000 km of water bodies need examination by demining units.</p>
            </div>
            """,
            unsafe_allow_html=True,
        )

    st.markdown('<div class="highlight-box">', unsafe_allow_html=True)
    st.markdown('<div class="section-title">The most mined country</div>', unsafe_allow_html=True)

    a1, a2, a3, a4 = st.columns(4)
    a1.metric("Dangerous areas identified", "94,566 ha")
    a2.metric("Civilian incidents", "982")
    a3.metric("People injured", "1,003")
    a4.metric("Deaths", "385")
    st.markdown("</div>", unsafe_allow_html=True)

    st.markdown('<div class="section-title">Activities of the center</div>', unsafe_allow_html=True)
    st.caption("The mine action center continuously implements all entrusted functions.")

    act1, act2, act3 = st.columns(3)
    act4, act5, act6 = st.columns(3)

    activities = [
        ("Certification of operators", "We provide EOD operators with services for certification of mine action processes."),
        ("Inspection of territories", "We carry out inspections of requested areas and suspected hazardous zones."),
        ("Activities planning", "We plan, organize and coordinate mine action activities."),
        ("Information management", "We manage information in the field of mine action within the limits of authority."),
        ("Education and information", "We inform the population about the risks associated with explosive objects."),
        ("Scientific support", "We provide scientific and technical support for mine countermeasures."),
    ]

    for col, item in zip([act1, act2, act3, act4, act5, act6], activities):
        with col:
            st.markdown(
                f"""
                <div class="activity-card">
                    <h3>{item[0]}</h3>
                    <p>{item[1]}</p>
                </div>
                """,
                unsafe_allow_html=True,
            )

    st.markdown('<div class="section-title">The activity of the center in numbers</div>', unsafe_allow_html=True)
    s1, s2, s3 = st.columns(3)
    s4, s5, s6 = st.columns(3)

    stats = [
        ("145,934+ ha", "of dangerous areas were inspected"),
        ("56", "EOD operators were certified"),
        ("940", "certificates were issued"),
        ("53,000+", "reports have been validated"),
        ("94,566", "training sessions were held"),
        ("2,247,972+", "trainees were involved"),
    ]

    for col, stat in zip([s1, s2, s3, s4, s5, s6], stats):
        with col:
            st.markdown(
                f"""
                <div class="stat-card">
                    <div class="stat-number">{stat[0]}</div>
                    <p>{stat[1]}</p>
                </div>
                """,
                unsafe_allow_html=True,
            )

    st.markdown('<div class="section-title">Latest news</div>', unsafe_allow_html=True)
    n1, n2, n3 = st.columns(3)

    news_items = [
        (
            "March 20, 2026",
            "Inspection team reviewed demand areas in Mogadishu region",
            "The national mine action operator continues clearing explosive hazards from Somali territories."
        ),
        (
            "March 15, 2026",
            "Working meeting with SEMA leadership and mine action operators",
            "Operational bottlenecks and coordination issues affecting field activities were discussed."
        ),
        (
            "March 10, 2026",
            "SEMA specialists distribute informational materials about mine hazards",
            "Public awareness remains one of the most important aspects of mine action."
        ),
    ]

    for col, item in zip([n1, n2, n3], news_items):
        with col:
            st.markdown(
                f"""
                <div class="news-card">
                    <div class="news-date">{item[0]}</div>
                    <h3>{item[1]}</h3>
                    <p>{item[2]}</p>
                </div>
                """,
                unsafe_allow_html=True,
            )

    st.markdown('<div class="section-title">Report an Explosive Hazard</div>', unsafe_allow_html=True)
    st.info("Use the sidebar and open **Report Hazard** to submit a real report into the system.")

    st.markdown(
        """
        <div class="footer">
            <h4>SEMA</h4>
            <p>Somalia Explosive Management Authority</p>
            <p>Working towards a safer Somalia through professional explosive ordnance management.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

# -------------------------
# REPORT FORM
# -------------------------
elif page == "Report Hazard":
    st.title("🚨 Report an Explosive Hazard")
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
            latitude_text = st.text_input("Latitude")
            longitude_text = st.text_input("Longitude")
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
        description = st.text_area("Description *", height=160)

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

        latitude = None
        longitude = None

        if latitude_text.strip():
            try:
                latitude = float(latitude_text)
            except ValueError:
                errors.append("Latitude must be a valid number.")

        if longitude_text.strip():
            try:
                longitude = float(longitude_text)
            except ValueError:
                errors.append("Longitude must be a valid number.")

        if errors:
            for err in errors:
                st.error(err)
        else:
            now = datetime.utcnow().isoformat()
            report_ref = generate_report_ref()

            insert_report(
                {
                    "report_ref": report_ref,
                    "reporter_name": reporter_name.strip(),
                    "phone": phone.strip(),
                    "email": email.strip(),
                    "district": district.strip(),
                    "exact_location": exact_location.strip(),
                    "latitude": latitude,
                    "longitude": longitude,
                    "hazard_type": hazard_type,
                    "severity": severity,
                    "description": description.strip(),
                    "people_at_risk": int(people_at_risk),
                    "immediate_danger": immediate_danger,
                    "status": "Submitted",
                    "created_at": now,
                    "updated_at": now,
                }
            )

            st.success(f"Report submitted successfully. Reference: {report_ref}")
            st.caption("Please keep this reference for follow-up.")

    st.markdown("---")
    c1, c2, c3 = st.columns(3)
    c1.metric("Phone", "+252 61 555 7890")
    c2.metric("Email", "info@sema.gov.so")
    c3.metric("Location", "Mogadishu, Somalia")

# -------------------------
# DASHBOARD
# -------------------------
elif page == "Dashboard":
    st.title("📊 Operations Dashboard")

    df = get_all_reports()

    if df.empty:
        st.warning("No reports yet.")
    else:
        m1, m2, m3, m4 = st.columns(4)
        m1.metric("Total Reports", len(df))
        m2.metric("Submitted", int((df["status"] == "Submitted").sum()))
        m3.metric("Dispatched", int((df["status"] == "Dispatched").sum()))
        m4.metric("Resolved", int((df["status"] == "Resolved").sum()))

        st.subheader("Filters")
        f1, f2, f3 = st.columns(3)

        selected_status = f1.multiselect("Status", STATUS_OPTIONS, default=STATUS_OPTIONS)
        selected_severity = f2.multiselect("Severity", SEVERITY_OPTIONS, default=SEVERITY_OPTIONS)
        district_query = f3.text_input("District contains")

        filtered = df[
            df["status"].isin(selected_status) &
            df["severity"].isin(selected_severity)
        ].copy()

        if district_query.strip():
            filtered = filtered[
                filtered["district"].str.contains(district_query.strip(), case=False, na=False)
            ]

        st.subheader("All Reports")
        display_cols = [
            "id",
            "report_ref",
            "reporter_name",
            "phone",
            "district",
            "hazard_type",
            "severity",
            "people_at_risk",
            "immediate_danger",
            "status",
            "created_at",
        ]
        st.dataframe(filtered[display_cols], use_container_width=True, hide_index=True)

        st.subheader("Update Report Status")
        if not filtered.empty:
            u1, u2 = st.columns(2)
            selected_id = u1.selectbox("Select report ID", filtered["id"].tolist())
            new_status = u2.selectbox("New status", STATUS_OPTIONS)

            if st.button("Update status", use_container_width=True):
                update_report_status(int(selected_id), new_status)
                st.success(f"Report {selected_id} updated to {new_status}.")
                st.rerun()

        st.subheader("View Report Details")
        detail_id = st.selectbox("Choose report ID", df["id"].tolist(), key="detail_id")
        selected_row = df[df["id"] == detail_id].iloc[0]

        st.json(
            {
                "reference": selected_row["report_ref"],
                "reporter_name": selected_row["reporter_name"],
                "phone": selected_row["phone"],
                "email": selected_row["email"],
                "district": selected_row["district"],
                "exact_location": selected_row["exact_location"],
                "latitude": selected_row["latitude"],
                "longitude": selected_row["longitude"],
                "hazard_type": selected_row["hazard_type"],
                "severity": selected_row["severity"],
                "people_at_risk": int(selected_row["people_at_risk"]),
                "immediate_danger": bool(selected_row["immediate_danger"]),
                "status": selected_row["status"],
                "description": selected_row["description"],
                "created_at": selected_row["created_at"],
                "updated_at": selected_row["updated_at"],
            }
        )

        csv_data = filtered.to_csv(index=False).encode("utf-8")
        st.download_button(
            "Download filtered reports as CSV",
            data=csv_data,
            file_name="sema_hazard_reports.csv",
            mime="text/csv",
        )