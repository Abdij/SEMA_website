import streamlit as st

# -------------------------
# PAGE CONFIG
# -------------------------
st.set_page_config(
    page_title="SEMA | Somalia Explosive Management Authority",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# -------------------------
# BRAND COLORS
# -------------------------
SEMA_RED = "#C1121F"
SEMA_BLUE = "#4189DD"
SEMA_LIGHT_BLUE = "#EAF4FB"
SEMA_DARK_BLUE = "#4189DD"
SEMA_WHITE = "#FFFFFF"
SEMA_BLACK = "#111111"
SEMA_GRAY = "#5F6B76"
SEMA_BORDER = "#D9E7F2"

# -------------------------
# CUSTOM CSS
# -------------------------
st.markdown(
    f"""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    html, body, [class*="css"] {{
        font-family: 'Inter', sans-serif;
    }}

    .stApp {{
        background-color: {SEMA_WHITE};
    }}

    .block-container {{
        max-width: 1320px;
        padding-top: 0.6rem;
        padding-bottom: 2rem;
    }}

    .topbar {{
        background: {SEMA_DARK_BLUE};
        color: {SEMA_WHITE};
        padding: 0.55rem 1rem;
        border-radius: 14px 14px 0 0;
        font-size: 0.88rem;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 0.75rem;
    }}

    .header {{
        background: {SEMA_WHITE};
        border: 1px solid {SEMA_BORDER};
        border-top: none;
        border-radius: 0 0 18px 18px;
        padding: 1.1rem 1.2rem 1rem 1.2rem;
        box-shadow: 0 8px 24px rgba(0,0,0,0.04);
        margin-bottom: 1rem;
    }}

    .header-grid {{
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
    }}

    .brand {{
        display: flex;
        align-items: center;
        gap: 0.9rem;
    }}

    .brand-mark {{
        width: 64px;
        height: 64px;
        border-radius: 16px;
        background: linear-gradient(135deg, {SEMA_DARK_BLUE} 0%, {SEMA_BLUE} 100%);
        color: {SEMA_WHITE};
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 1.25rem;
        box-shadow: 0 8px 18px rgba(11,37,69,0.18);
    }}

    .brand-title {{
        margin: 0;
        color: {SEMA_DARK_BLUE};
        font-size: 1.85rem;
        font-weight: 800;
        line-height: 1.05;
    }}

    .brand-sub {{
        margin: 0.2rem 0 0 0;
        color: {SEMA_RED};
        font-size: 0.92rem;
        font-weight: 700;
        letter-spacing: 0.2px;
    }}

    .nav {{
        display: flex;
        gap: 1.2rem;
        flex-wrap: wrap;
        justify-content: flex-end;
        align-items: center;
    }}

    .nav a {{
        color: {SEMA_BLACK};
        text-decoration: none;
        font-size: 0.95rem;
        font-weight: 700;
    }}

    .nav a:hover {{
        color: {SEMA_RED};
    }}

    .hero {{
        background:
            linear-gradient(120deg, rgba(11,37,69,0.96) 0%, rgba(46,134,193,0.95) 100%);
        color: {SEMA_WHITE};
        border-radius: 24px;
        padding: 3rem 2.2rem;
        margin: 1.1rem 0 1.6rem 0;
        box-shadow: 0 14px 36px rgba(11,37,69,0.16);
    }}

    .hero-grid {{
        display: grid;
        grid-template-columns: 1.35fr 0.65fr;
        gap: 2rem;
        align-items: center;
    }}

    .badge {{
        display: inline-block;
        background: rgba(255,255,255,0.14);
        color: {SEMA_WHITE};
        border: 1px solid rgba(255,255,255,0.2);
        padding: 0.38rem 0.9rem;
        border-radius: 999px;
        font-size: 0.82rem;
        font-weight: 700;
        margin-right: 0.5rem;
        margin-bottom: 0.5rem;
    }}

    .hero h1 {{
        font-size: 3.1rem;
        line-height: 1.06;
        margin: 0.7rem 0 0.95rem 0;
        font-weight: 800;
    }}

    .hero p {{
        max-width: 850px;
        font-size: 1.08rem;
        line-height: 1.75;
        margin-bottom: 1.4rem;
        opacity: 0.98;
    }}

    .hero-actions {{
        display: flex;
        gap: 0.85rem;
        flex-wrap: wrap;
    }}

    .btn-primary {{
        display: inline-block;
        background: {SEMA_RED};
        color: {SEMA_WHITE};
        padding: 0.88rem 1.25rem;
        border-radius: 999px;
        text-decoration: none;
        font-weight: 800;
    }}

    .btn-secondary {{
        display: inline-block;
        background: rgba(255,255,255,0.1);
        color: {SEMA_WHITE};
        padding: 0.88rem 1.25rem;
        border-radius: 999px;
        text-decoration: none;
        font-weight: 800;
        border: 1px solid rgba(255,255,255,0.24);
    }}

    .hero-panel {{
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.18);
        border-radius: 20px;
        padding: 1.25rem;
    }}

    .hero-panel h3 {{
        margin-top: 0;
        margin-bottom: 0.75rem;
        font-size: 1.05rem;
        color: {SEMA_WHITE};
    }}

    .hero-panel-item {{
        padding: 0.78rem 0;
        border-bottom: 1px solid rgba(255,255,255,0.12);
    }}

    .hero-panel-item:last-child {{
        border-bottom: none;
        padding-bottom: 0;
    }}

    .section-title {{
        color: {SEMA_DARK_BLUE};
        font-size: 2rem;
        font-weight: 800;
        margin-top: 1.7rem;
        margin-bottom: 0.4rem;
    }}

    .section-sub {{
        color: {SEMA_GRAY};
        font-size: 1rem;
        margin-bottom: 1.3rem;
    }}

    .soft-block {{
        background: {SEMA_LIGHT_BLUE};
        border: 1px solid {SEMA_BORDER};
        border-radius: 20px;
        padding: 1.6rem;
        margin: 1.3rem 0 1.8rem 0;
    }}

    .card {{
        background: {SEMA_WHITE};
        border: 1px solid {SEMA_BORDER};
        border-radius: 18px;
        padding: 1.25rem;
        box-shadow: 0 8px 22px rgba(0,0,0,0.04);
        height: 100%;
    }}

    .card-accent {{
        border-top: 4px solid {SEMA_RED};
    }}

    .card h3 {{
        color: {SEMA_DARK_BLUE};
        font-size: 1.16rem;
        margin-bottom: 0.65rem;
    }}

    .card p {{
        color: {SEMA_BLACK};
        line-height: 1.65;
        font-size: 0.97rem;
    }}

    .metric-box {{
        background: {SEMA_WHITE};
        border: 1px solid {SEMA_BORDER};
        border-left: 5px solid {SEMA_RED};
        border-radius: 16px;
        padding: 1.25rem;
        height: 100%;
        box-shadow: 0 8px 22px rgba(0,0,0,0.04);
    }}

    .metric-number {{
        color: {SEMA_DARK_BLUE};
        font-weight: 800;
        font-size: 2rem;
        margin-bottom: 0.35rem;
    }}

    .strip {{
        background: {SEMA_DARK_BLUE};
        color: {SEMA_WHITE};
        border-radius: 20px;
        padding: 1.6rem;
        margin-top: 1.8rem;
        margin-bottom: 1.6rem;
    }}

    .news-card {{
        background: {SEMA_WHITE};
        border: 1px solid {SEMA_BORDER};
        border-radius: 18px;
        overflow: hidden;
        height: 100%;
        box-shadow: 0 8px 22px rgba(0,0,0,0.04);
    }}

    .news-top {{
        background: linear-gradient(135deg, {SEMA_DARK_BLUE} 0%, {SEMA_BLUE} 100%);
        color: {SEMA_WHITE};
        padding: 1rem 1.15rem;
        font-weight: 800;
    }}

    .news-body {{
        padding: 1.15rem;
    }}

    .news-date {{
        color: {SEMA_RED};
        font-size: 0.83rem;
        font-weight: 800;
        margin-bottom: 0.55rem;
        text-transform: uppercase;
        letter-spacing: 0.3px;
    }}

    .list-clean {{
        margin: 0;
        padding-left: 1.1rem;
        color: {SEMA_BLACK};
        line-height: 1.75;
    }}

    .cta {{
        background: linear-gradient(135deg, {SEMA_LIGHT_BLUE} 0%, {SEMA_WHITE} 100%);
        border: 1px solid {SEMA_BORDER};
        border-radius: 22px;
        padding: 2rem;
        text-align: center;
        margin-top: 2rem;
    }}

    .footer {{
        margin-top: 2rem;
        background: {SEMA_BLUE};
        color: {SEMA_WHITE};
        border-radius: 22px;
        padding: 2rem;
    }}

    .footer h4 {{
        color: {SEMA_RED};
        margin-bottom: 0.7rem;
    }}

    .footer p, .footer li {{
        color: #e6e6e6;
        font-size: 0.95rem;
        line-height: 1.6;
    }}

    .footer ul {{
        list-style: none;
        padding: 0;
        margin: 0;
    }}

    .footer li {{
        margin-bottom: 0.45rem;
    }}

    .muted {{
        color: {SEMA_GRAY};
        font-size: 0.94rem;
    }}

    @media (max-width: 900px) {{
        .hero-grid {{
            grid-template-columns: 1fr;
        }}
        .hero h1 {{
            font-size: 2.25rem;
        }}
    }}
</style>
""",
    unsafe_allow_html=True,
)

# -------------------------
# HEADER
# -------------------------
st.markdown(
    f"""
    <div class="topbar">
        <div>Official Portal of the Somalia Explosive Management Authority</div>
        <div>Federal Government of Somalia | Mine Action Coordination | Public Information</div>
    </div>
    <div class="header">
        <div class="header-grid">
            <div class="brand">
                <div class="brand-mark">SEMA</div>
                <div>
                    <div class="brand-title">SEMA</div>
                    <div class="brand-sub">Somalia Explosive Management Authority</div>
                </div>
            </div>
            <div class="nav">
                <a href="#">Home</a>
                <a href="#">About</a>
                <a href="#">Mandate</a>
                <a href="#">Operations</a>
                <a href="#">Operators</a>
                <a href="#">Publications</a>
                <a href="#">News</a>
                <a href="#">Contact</a>
            </div>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# -------------------------
# HERO
# -------------------------
st.markdown(
    """
    <div class="hero">
        <div class="hero-grid">
            <div>
                <span class="badge">National Authority</span>
                <span class="badge">Mine Action Coordination</span>
                <span class="badge">Public Safety</span>
                <h1>Leading Somalia’s National Response to Explosive Hazards</h1>
                <p>
                    SEMA provides national leadership for mine action and explosive hazard management,
                    supporting policy direction, standards, coordination, public information, operator
                    engagement, and strategic prioritization to protect communities and enable safer recovery.
                </p>
                <div class="hero-actions">
                    <span class="btn-primary">Explore National Priorities</span>
                    <span class="btn-secondary">View Publications</span>
                </div>
            </div>
            <div class="hero-panel">
                <h3>Institutional Focus</h3>
                <div class="hero-panel-item"><strong>Policy & Oversight</strong><br>National leadership, standards, and sector coordination.</div>
                <div class="hero-panel-item"><strong>Operations Support</strong><br>Prioritization, information management, and partner engagement.</div>
                <div class="hero-panel-item"><strong>Public Information</strong><br>Awareness, updates, publications, and official guidance.</div>
                <div class="hero-panel-item"><strong>Safer Recovery</strong><br>Reducing explosive risk for communities, infrastructure, and development.</div>
            </div>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# -------------------------
# QUICK OVERVIEW
# -------------------------
st.markdown('<div class="section-title">National Overview</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="section-sub">A public-facing snapshot of contamination, institutional responsibility, and national mine action priorities.</div>',
    unsafe_allow_html=True,
)

o1, o2, o3 = st.columns(3)
with o1:
    st.markdown(
        """
        <div class="metric-box">
            <div class="metric-number">30%</div>
            <p>Estimated territorial impact from mines and unexploded ordnance in affected areas.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )
with o2:
    st.markdown(
        """
        <div class="metric-box">
            <div class="metric-number">139,000+ km²</div>
            <p>Land requiring survey, prioritization, assessment, or clearance attention.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )
with o3:
    st.markdown(
        """
        <div class="metric-box">
            <div class="metric-number">National Coordination</div>
            <p>Institutional support for planning, standards, public information, and operator engagement.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

# -------------------------
# MANDATE
# -------------------------
st.markdown('<div class="section-title">Mandate, Mission and Vision</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="section-sub">Structured like leading mine-action institutions: clear authority, public mandate, and strategic direction.</div>',
    unsafe_allow_html=True,
)

m1, m2, m3 = st.columns(3)
content = [
    (
        "Mandate",
        "SEMA serves as the national authority for coordination and oversight of mine action and explosive hazard management in Somalia, supporting policy direction, regulation, standards, and institutional alignment.",
    ),
    (
        "Mission",
        "To reduce the humanitarian, social, and development impact of explosive hazards through effective coordination, technical leadership, public communication, and support to national mine action priorities.",
    ),
    (
        "Vision",
        "A Somalia where communities, institutions, and development actors can operate safely and confidently, free from the threat posed by mines and explosive remnants of war.",
    ),
]
for col, item in zip([m1, m2, m3], content):
    with col:
        st.markdown(
            f"""
            <div class="card card-accent">
                <h3>{item[0]}</h3>
                <p>{item[1]}</p>
            </div>
            """,
            unsafe_allow_html=True,
        )

# -------------------------
# KEY FUNCTIONS
# -------------------------
st.markdown('<div class="section-title">Core Institutional Functions</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="section-sub">Inspired by the strongest mine-action authority websites: practical, structured, and partner-facing.</div>',
    unsafe_allow_html=True,
)

f1, f2, f3 = st.columns(3)
f4, f5, f6 = st.columns(3)

functions = [
    ("National Coordination", "Convening and aligning mine action stakeholders across government, operators, donors, and communities."),
    ("Standards and Guidance", "Supporting national standards, technical guidance, and quality-oriented implementation practices."),
    ("Information Management", "Managing public and institutional information relevant to contamination, priorities, and sector performance."),
    ("Operator Engagement", "Facilitating coordination with implementing partners, technical operators, and sector actors."),
    ("Risk Education Support", "Promoting public information and awareness around explosive hazards and safer behavior."),
    ("Strategic Planning", "Supporting prioritization, national planning, and institutional visibility for mine action outcomes."),
]

for col, item in zip([f1, f2, f3, f4, f5, f6], functions):
    with col:
        st.markdown(
            f"""
            <div class="card">
                <h3>{item[0]}</h3>
                <p>{item[1]}</p>
            </div>
            """,
            unsafe_allow_html=True,
        )

# -------------------------
# PUBLIC PRIORITIES STRIP
# -------------------------
st.markdown(
    """
    <div class="strip">
        <h3 style="margin-top:0;margin-bottom:0.6rem;">Public Priorities</h3>
        <div style="line-height:1.8;">
            Safer communities • Better access for development • Stronger national coordination • Clearer public information • Stronger institutional visibility
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# -------------------------
# NATIONAL IMPACT
# -------------------------
st.markdown('<div class="section-title">National Impact and Context</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="section-sub">A formal institutional section commonly seen on high-performing authority websites.</div>',
    unsafe_allow_html=True,
)

st.markdown('<div class="soft-block">', unsafe_allow_html=True)
i1, i2, i3, i4 = st.columns(4)
i1.metric("Dangerous areas identified", "94,566 ha")
i2.metric("Civilian incidents", "982")
i3.metric("People injured", "1,003")
i4.metric("Deaths", "385")
st.markdown(
    """
    <div class="muted" style="margin-top:1rem;">
        Explosive contamination affects civilian safety, mobility, livelihoods, service delivery, and recovery.
        A strong national authority website should make this context visible, credible, and easy to understand.
    </div>
    """,
    unsafe_allow_html=True,
)
st.markdown("</div>", unsafe_allow_html=True)

# -------------------------
# OPERATIONS / PROGRAMMING
# -------------------------
st.markdown('<div class="section-title">Operations and Programming</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="section-sub">A structured section for institutions, partners, and operators looking for clarity on SEMA’s role.</div>',
    unsafe_allow_html=True,
)

p1, p2 = st.columns([1.15, 0.85])
with p1:
    st.markdown(
        """
        <div class="card">
            <h3>How SEMA Supports the Sector</h3>
            <ul class="list-clean">
                <li>Supports national mine action coordination and visibility</li>
                <li>Facilitates policy and strategic direction</li>
                <li>Promotes standards, guidance, and institutional accountability</li>
                <li>Strengthens information management and public communication</li>
                <li>Engages operators and partners in national priorities</li>
                <li>Supports public awareness and institutional outreach</li>
            </ul>
        </div>
        """,
        unsafe_allow_html=True,
    )
with p2:
    st.markdown(
        """
        <div class="card">
            <h3>Priority Themes</h3>
            <p>Survey and prioritization</p>
            <p>Coordination with operators</p>
            <p>Public information and awareness</p>
            <p>Technical guidance and standards</p>
            <p>Partnerships and donor engagement</p>
            <p>Institutional reporting and visibility</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

# -------------------------
# NEWS
# -------------------------
st.markdown('<div class="section-title">Latest News and Official Updates</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="section-sub">Strong mine-action websites keep updates visible and institutionally framed for partners and the public.</div>',
    unsafe_allow_html=True,
)

n1, n2, n3 = st.columns(3)
news = [
    (
        "March 20, 2026",
        "SEMA reviews priority explosive hazard concerns with regional stakeholders",
        "The authority continued public and institutional engagement to support coordinated national priorities and safer access.",
    ),
    (
        "March 15, 2026",
        "Operator coordination meeting highlights implementation challenges and sector needs",
        "SEMA convened partners to strengthen alignment, clarify priorities, and reinforce operational coordination.",
    ),
    (
        "March 10, 2026",
        "Public information materials distributed to strengthen awareness of explosive hazards",
        "Awareness remains a critical component of protecting communities and reducing preventable harm.",
    ),
]
for col, item in zip([n1, n2, n3], news):
    with col:
        st.markdown(
            f"""
            <div class="news-card">
                <div class="news-top">Official Update</div>
                <div class="news-body">
                    <div class="news-date">{item[0]}</div>
                    <h3>{item[1]}</h3>
                    <p>{item[2]}</p>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

# -------------------------
# PUBLICATIONS
# -------------------------
st.markdown('<div class="section-title">Publications and Resources</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="section-sub">This section mirrors the strongest sector sites by making institutional documents easy to find.</div>',
    unsafe_allow_html=True,
)

r1, r2, r3, r4 = st.columns(4)
resources = [
    ("Annual Reports", "Official reporting on progress, priorities, and institutional performance."),
    ("National Strategy", "Strategic direction for Somalia’s mine action coordination and response."),
    ("Standards & Guidance", "Technical and institutional references supporting quality and consistency."),
    ("Public Awareness Materials", "Information resources for communities, partners, and public outreach."),
]
for col, item in zip([r1, r2, r3, r4], resources):
    with col:
        st.markdown(
            f"""
            <div class="card">
                <h3>{item[0]}</h3>
                <p>{item[1]}</p>
            </div>
            """,
            unsafe_allow_html=True,
        )

# -------------------------
# PARTNERSHIPS
# -------------------------
st.markdown('<div class="section-title">Partnerships</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="section-sub">Leading mine-action institutions present partnerships clearly to build trust and legitimacy.</div>',
    unsafe_allow_html=True,
)

st.markdown(
    """
    <div class="soft-block">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;">
            <div class="card"><h3>Government</h3><p>Federal and state institutions supporting national coordination and public safety.</p></div>
            <div class="card"><h3>Operators</h3><p>Implementing partners contributing technical expertise and field delivery.</p></div>
            <div class="card"><h3>Donors</h3><p>Partners supporting sustainable mine action outcomes and national capacity.</p></div>
            <div class="card"><h3>Communities</h3><p>Local actors whose safety, access, and resilience remain central to the mission.</p></div>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# -------------------------
# CONTACT CTA
# -------------------------
st.markdown(
    """
    <div class="cta">
        <h2 style="margin-top:0;color:#0B2545;">Contact SEMA</h2>
        <p class="muted" style="max-width:760px;margin:0 auto 1.2rem auto;">
            For official correspondence, institutional coordination, media requests, publications,
            or partner engagement, please use the official contact channels below.
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)

c1, c2, c3 = st.columns(3)
c1.metric("Telephone", "+252 61 555 7890")
c2.metric("Email", "info@sema.gov.so")
c3.metric("Location", "Mogadishu, Somalia")

# -------------------------
# FOOTER
# -------------------------
st.markdown(
    """
    <div class="footer">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:2rem;">
            <div>
                <h4>SEMA</h4>
                <p>Somalia Explosive Management Authority</p>
                <p>Leading national coordination, institutional visibility, and public information on mine action and explosive hazard management in Somalia.</p>
            </div>
            <div>
                <h4>Institution</h4>
                <ul>
                    <li>About SEMA</li>
                    <li>Mandate</li>
                    <li>Leadership</li>
                    <li>Partnerships</li>
                </ul>
            </div>
            <div>
                <h4>Resources</h4>
                <ul>
                    <li>News</li>
                    <li>Publications</li>
                    <li>Annual Reports</li>
                    <li>Standards & Guidance</li>
                </ul>
            </div>
            <div>
                <h4>Official Contact</h4>
                <ul>
                    <li>Mogadishu, Somalia</li>
                    <li>info@sema.gov.so</li>
                    <li>+252 61 555 7890</li>
                </ul>
            </div>
        </div>
        <hr style="margin:1.5rem 0;border-color:#2a2a2a;">
        <p style="text-align:center;margin:0;">© 2026 Somalia Explosive Management Authority (SEMA) — Official Institutional Website</p>
    </div>
    """,
    unsafe_allow_html=True,
)
