import streamlit as st

# -------------------------
# PAGE CONFIG
# -------------------------
st.set_page_config(
    page_title="SEMA | Somalia Explosive Management Authority",
    page_icon="💣",
    layout="wide",
    initial_sidebar_state="collapsed",
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
        padding-top: 1rem;
        padding-bottom: 2rem;
        max-width: 1300px;
    }}

    .main-header {{
        background: {SEMA_WHITE};
        border-bottom: 3px solid {SEMA_RED};
        padding: 1rem 0 1.2rem 0;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        margin-bottom: 1rem;
    }}

    .logo-wrap {{
        display: flex;
        align-items: center;
        gap: 1rem;
    }}

    .logo-badge {{
        width: 62px;
        height: 62px;
        border-radius: 14px;
        background: {SEMA_BLUE};
        color: {SEMA_WHITE};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.8rem;
        font-weight: 800;
        box-shadow: 0 4px 12px rgba(0,0,0,0.10);
    }}

    .logo-text h1 {{
        font-size: 1.8rem;
        font-weight: 800;
        color: {SEMA_BLUE};
        margin: 0;
        line-height: 1.1;
    }}

    .logo-text p {{
        font-size: 0.88rem;
        color: {SEMA_RED};
        margin: 0.25rem 0 0 0;
        font-weight: 600;
    }}

    .nav-bar {{
        display: flex;
        gap: 1.5rem;
        justify-content: flex-end;
        align-items: center;
        flex-wrap: wrap;
        padding-top: 0.7rem;
    }}

    .nav-item {{
        color: {SEMA_BLACK};
        font-weight: 600;
        font-size: 0.95rem;
        text-decoration: none;
    }}

    .nav-item:hover {{
        color: {SEMA_RED};
    }}

    .hero {{
        background: linear-gradient(135deg, {SEMA_BLUE} 0%, #001a33 100%);
        color: {SEMA_WHITE};
        border-radius: 22px;
        padding: 3rem 2.2rem;
        margin: 1rem 0 2rem 0;
    }}

    .pill {{
        display: inline-block;
        background: {SEMA_RED};
        color: {SEMA_WHITE};
        padding: 0.35rem 0.9rem;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 600;
        margin-right: 0.5rem;
        margin-bottom: 0.5rem;
    }}

    .hero-title {{
        font-size: 3rem;
        font-weight: 800;
        line-height: 1.1;
        margin-top: 0.6rem;
        margin-bottom: 1rem;
    }}

    .hero-sub {{
        font-size: 1.08rem;
        line-height: 1.7;
        max-width: 850px;
        opacity: 0.96;
    }}

    .hero-actions {{
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-top: 1.5rem;
    }}

    .btn-primary {{
        background: {SEMA_RED};
        color: white;
        padding: 0.85rem 1.4rem;
        border-radius: 999px;
        text-decoration: none;
        font-weight: 700;
        display: inline-block;
    }}

    .btn-outline {{
        border: 2px solid white;
        color: white;
        padding: 0.85rem 1.4rem;
        border-radius: 999px;
        text-decoration: none;
        font-weight: 700;
        display: inline-block;
    }}

    .section-title {{
        font-size: 2rem;
        font-weight: 800;
        color: {SEMA_BLUE};
        margin-top: 2rem;
        margin-bottom: 0.6rem;
    }}

    .section-sub {{
        color: {SEMA_GRAY};
        margin-bottom: 1.5rem;
        font-size: 1rem;
    }}

    .card {{
        background: {SEMA_WHITE};
        border: 1px solid #e6e6e6;
        border-left: 4px solid {SEMA_RED};
        border-radius: 14px;
        padding: 1.25rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        height: 100%;
    }}

    .card h3 {{
        color: {SEMA_BLUE};
        margin-bottom: 0.6rem;
        font-size: 1.2rem;
    }}

    .stat-card {{
        background: {SEMA_WHITE};
        border-radius: 14px;
        border-left: 4px solid {SEMA_RED};
        box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        padding: 1.3rem;
        height: 100%;
    }}

    .stat-number {{
        color: {SEMA_BLUE};
        font-weight: 800;
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }}

    .highlight-box {{
        background: {SEMA_LIGHT_BG};
        border-radius: 18px;
        padding: 1.8rem;
        margin-top: 1.5rem;
        margin-bottom: 2rem;
    }}

    .news-card {{
        background: {SEMA_WHITE};
        border-radius: 14px;
        border: 1px solid #e5e5e5;
        box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        overflow: hidden;
        height: 100%;
    }}

    .news-top {{
        background: {SEMA_BLUE};
        color: white;
        padding: 1.2rem;
        font-weight: 700;
        font-size: 1rem;
    }}

    .news-body {{
        padding: 1.2rem;
    }}

    .news-date {{
        color: {SEMA_RED};
        font-weight: 700;
        font-size: 0.85rem;
        margin-bottom: 0.6rem;
    }}

    .cta-box {{
        background: {SEMA_LIGHT_BG};
        border-radius: 18px;
        padding: 2rem;
        text-align: center;
        margin-top: 2rem;
    }}

    .footer {{
        background: {SEMA_BLACK};
        color: white;
        border-radius: 18px;
        padding: 2rem;
        margin-top: 2rem;
    }}

    .footer h4 {{
        color: {SEMA_RED};
        margin-bottom: 0.7rem;
    }}

    .footer p, .footer li {{
        color: #d9d9d9;
        font-size: 0.95rem;
    }}

    .footer ul {{
        list-style: none;
        padding-left: 0;
        margin: 0;
    }}

    .footer li {{
        margin-bottom: 0.45rem;
    }}

    .small-muted {{
        color: {SEMA_GRAY};
        font-size: 0.95rem;
    }}

    @media (max-width: 768px) {{
        .hero-title {{
            font-size: 2.1rem;
        }}
    }}
</style>
""",
    unsafe_allow_html=True,
)

# -------------------------
# HEADER
# -------------------------
h1, h2 = st.columns([1.3, 2])

with h1:
    st.markdown(
        """
        <div class="logo-wrap">
            <div class="logo-badge">SE</div>
            <div class="logo-text">
                <h1>SEMA</h1>
                <p>Somalia Explosive Management Authority</p>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

with h2:
    st.markdown(
        """
        <div class="nav-bar">
            <span class="nav-item">Home</span>
            <span class="nav-item">About Us</span>
            <span class="nav-item">Mandate</span>
            <span class="nav-item">Operations</span>
            <span class="nav-item">Statistics</span>
            <span class="nav-item">News</span>
            <span class="nav-item">Publications</span>
            <span class="nav-item">Contact</span>
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
        <div>
            <span class="pill">Ministry of Interior</span>
            <span class="pill">Federal Government of Somalia</span>
        </div>
        <div class="hero-title">Somalia National Mine Action Center</div>
        <div class="hero-sub">
            SEMA leads national coordination for mine action and explosive hazard management in Somalia.
            The authority supports regulation, planning, information management, public awareness,
            operator engagement, and strategic action to reduce the humanitarian and development impact
            of mines, ERW, and other explosive threats.
        </div>
        <div class="hero-actions">
            <span class="btn-primary">National Priorities</span>
            <span class="btn-outline">Explore Operations</span>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# -------------------------
# INTRO STATS
# -------------------------
st.markdown('<div class="section-title">National Contamination Overview</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="section-sub">A snapshot of the explosive contamination challenge affecting safety, access, and development.</div>',
    unsafe_allow_html=True,
)

s1, s2 = st.columns(2)
with s1:
    st.markdown(
        """
        <div class="stat-card">
            <div class="stat-number">about 30%</div>
            <p>of the territory of Somalia is estimated to be contaminated by mines and unexploded ordnance.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

with s2:
    st.markdown(
        """
        <div class="stat-card">
            <div class="stat-number">more than 139,000 km²</div>
            <p>of land and 14,000 km of water bodies require survey, assessment, or clearance attention.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

# -------------------------
# MANDATE
# -------------------------
st.markdown('<div class="section-title">Institutional Mandate</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="section-sub">SEMA provides national leadership, coordination, and oversight for explosive hazard management across Somalia.</div>',
    unsafe_allow_html=True,
)

m1, m2, m3 = st.columns(3)
with m1:
    st.markdown(
        """
        <div class="card">
            <h3>Mission</h3>
            <p>
                To protect lives, livelihoods, and infrastructure by coordinating and strengthening
                Somalia’s mine action response through effective policy, regulation, technical standards,
                and public safety measures.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

with m2:
    st.markdown(
        """
        <div class="card">
            <h3>Vision</h3>
            <p>
                A Somalia where communities can live, move, and develop free from the threat of mines,
                explosive remnants of war, and other explosive hazards.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

with m3:
    st.markdown(
        """
        <div class="card">
            <h3>Partnerships</h3>
            <p>
                SEMA works with federal and state institutions, humanitarian operators, donors, civil
                society, and communities to ensure coordinated and sustainable mine action outcomes.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

# -------------------------
# MOST MINED COUNTRY / IMPACT
# -------------------------
st.markdown(
    """
    <div class="highlight-box">
        <div class="section-title" style="margin-top:0;">The National Impact of Explosive Contamination</div>
        <div class="section-sub" style="margin-bottom:1rem;">
            Decades of conflict and insecurity have left Somalia heavily affected by explosive hazards,
            limiting access, threatening civilians, and slowing recovery and development.
        </div>
    """,
    unsafe_allow_html=True,
)

i1, i2, i3, i4 = st.columns(4)
i1.metric("Dangerous areas identified", "94,566 ha")
i2.metric("Civilian incidents", "982")
i3.metric("People injured", "1,003")
i4.metric("Deaths", "385")

st.markdown("</div>", unsafe_allow_html=True)

# -------------------------
# CORE FUNCTIONS
# -------------------------
st.markdown('<div class="section-title">Core Functions of the Center</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="section-sub">SEMA implements the functions entrusted to the authority in support of national mine action objectives.</div>',
    unsafe_allow_html=True,
)

f1, f2, f3 = st.columns(3)
f4, f5, f6 = st.columns(3)

functions = [
    ("Certification of operators", "Providing oversight and certification support for mine action operators and processes."),
    ("Inspection of territories", "Assessing hazardous locations and supporting evidence-based prioritization of action."),
    ("Activities planning", "Planning, organizing, and coordinating mine action interventions and national priorities."),
    ("Information management", "Managing data and information relevant to contamination, operations, and decision-making."),
    ("Education and information", "Raising public awareness of explosive risks and promoting safer community behavior."),
    ("Scientific and technical support", "Supporting technical standards, quality approaches, and operational effectiveness."),
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
# ACTIVITY IN NUMBERS
# -------------------------
st.markdown('<div class="section-title">SEMA Activity in Numbers</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="section-sub">Illustrative institutional and operational indicators demonstrating the scale of mine action effort.</div>',
    unsafe_allow_html=True,
)

n1, n2, n3 = st.columns(3)
n4, n5, n6 = st.columns(3)

stats = [
    ("145,934+ ha", "of dangerous areas were inspected"),
    ("56", "EOD operators were certified"),
    ("940", "certificates were issued"),
    ("53,000+", "reports were validated"),
    ("94,566", "training sessions were held"),
    ("2,247,972+", "participants were reached"),
]

for col, stat in zip([n1, n2, n3, n4, n5, n6], stats):
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

# -------------------------
# NEWS
# -------------------------
st.markdown('<div class="section-title">Latest News</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="section-sub">Institutional updates, operator coordination, risk education, and field engagement highlights.</div>',
    unsafe_allow_html=True,
)

news1, news2, news3 = st.columns(3)

news_items = [
    (
        "March 20, 2026",
        "Field inspection mission reviewed priority demand areas in Mogadishu",
        "SEMA teams continued technical engagement in support of survey, prioritization, and operational coordination."
    ),
    (
        "March 15, 2026",
        "SEMA leadership met mine action operators to address operational constraints",
        "The meeting focused on coordination, field implementation challenges, and national response alignment."
    ),
    (
        "March 10, 2026",
        "Public information materials on explosive hazards distributed to communities",
        "Risk education remains a critical pillar of the national response to explosive contamination."
    ),
]

for col, item in zip([news1, news2, news3], news_items):
    with col:
        st.markdown(
            f"""
            <div class="news-card">
                <div class="news-top">SEMA Update</div>
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
# PUBLICATIONS / RESOURCES
# -------------------------
st.markdown('<div class="section-title">Publications and Resources</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="section-sub">Key institutional and technical resources for partners, operators, and the public.</div>',
    unsafe_allow_html=True,
)

p1, p2, p3 = st.columns(3)
with p1:
    st.markdown(
        """
        <div class="card">
            <h3>Annual Reports</h3>
            <p>Institutional reporting on progress, partnerships, priorities, and implementation milestones.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )
with p2:
    st.markdown(
        """
        <div class="card">
            <h3>Strategic Framework</h3>
            <p>National direction for coordination, standards, prioritization, and sustainable mine action results.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )
with p3:
    st.markdown(
        """
        <div class="card">
            <h3>Guidelines and Standards</h3>
            <p>Technical references and operational guidance supporting quality, safety, and accountability.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

# -------------------------
# CONTACT CTA
# -------------------------
st.markdown(
    """
    <div class="cta-box">
        <div class="section-title" style="margin-top:0;">Contact SEMA</div>
        <p class="small-muted">
            For official correspondence, coordination inquiries, or institutional engagement, contact the authority through the channels below.
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
                <p>Working toward a safer Somalia through coordinated explosive hazard management and mine action leadership.</p>
            </div>
            <div>
                <h4>Quick Links</h4>
                <ul>
                    <li>About SEMA</li>
                    <li>National Mandate</li>
                    <li>Operations</li>
                    <li>Statistics</li>
                </ul>
            </div>
            <div>
                <h4>Resources</h4>
                <ul>
                    <li>Annual Reports</li>
                    <li>Strategic Framework</li>
                    <li>Technical Guidance</li>
                    <li>Public Awareness Materials</li>
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
        <hr style="margin:1.5rem 0;border-color:#333;">
        <p style="text-align:center;margin:0;">© 2026 Somalia Explosive Management Authority (SEMA) — United for a safer tomorrow.</p>
    </div>
    """,
    unsafe_allow_html=True,
)