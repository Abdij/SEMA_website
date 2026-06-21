import streamlit as st
from pathlib import Path
import base64

st.set_page_config(
    page_title="SEMA | Somalia Explosive Management Authority",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="collapsed",
)

BASE_DIR = Path(__file__).resolve().parent
LOGO_PATH = BASE_DIR / "assets/SEMA_logo.png"
HERO_PATH = BASE_DIR /"assets/mine_action.jpg"
MAP_PATH = BASE_DIR / "assets/somalia_map.jpg"
NEWS1_PATH = BASE_DIR / "assets/mine_education.jpg"
NEWS2_PATH = BASE_DIR / "assets/mine_survey.jpg"
NEWS3_PATH = BASE_DIR / "assets/coordination_meeting.jpg"

SEMA_RED = "#C1121F"
SEMA_BLUE = "#1484C6"
SEMA_DARK_BLUE = "#003B64"
SEMA_NAVY = "#062B49"
SEMA_LIGHT = "#F7FAFC"
SEMA_TEXT = "#111827"
SEMA_MUTED = "#5F6B76"
SEMA_BORDER = "#E5EEF7"


def load_image_base64(image_path: Path):
    try:
        if image_path.exists():
            return base64.b64encode(image_path.read_bytes()).decode()
    except Exception:
        return None
    return None


logo_base64 = load_image_base64(LOGO_PATH)
hero_base64 = load_image_base64(HERO_PATH)
map_base64 = load_image_base64(MAP_PATH)
news1_base64 = load_image_base64(NEWS1_PATH)
news2_base64 = load_image_base64(NEWS2_PATH)
news3_base64 = load_image_base64(NEWS3_PATH)

if logo_base64:
    logo_html = f'<img class="logo" src="data:image/png;base64,{logo_base64}">'
else:
    logo_html = '<div class="logo-fallback">SEMA</div>'


st.markdown(
    f"""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

html, body, [class*="css"] {{
    font-family: 'Inter', sans-serif;
    font-size: 18px;
}}

.stApp {{
    background: white;
    color: {SEMA_TEXT};
}}

.block-container {{
    max-width: 1280px;
    padding-top: 0.8rem;
    padding-bottom: 2rem;
}}

#MainMenu, footer, header {{
    visibility: hidden;
}}

.top-strip {{
    display: flex;
    justify-content: flex-end;
    gap: 0.7rem;
    font-size: 0.78rem;
    color: {SEMA_TEXT};
    margin-bottom: 0.6rem;
}}

.header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
    padding: 0.2rem 0 0.6rem 0;
}}

.brand {{
    display: flex;
    align-items: center;
    gap: 1rem;
}}

.logo {{
    width: 110px;
    height: auto;
}}

.logo-fallback {{
    width: 72px;
    height: 72px;
    background: {SEMA_BLUE};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    border-radius: 12px;
}}

.brand-title {{
    font-size: 2.4rem;
    font-weight: 900;
    color: {SEMA_BLUE};
    line-height: 1;
    margin-bottom: 0.25rem;
}}

.brand-sub {{
    font-size: 0.88rem;
    color: {SEMA_RED};
    font-weight: 800;
    line-height: 1.15;
}}

.header-actions {{
    display: flex;
    align-items: center;
    gap: 0.9rem;
}}

.donate-btn {{
    background: {SEMA_RED};
    color: white !important;
    text-decoration: none;
    padding: 0.65rem 1rem;
    border-radius: 6px;
    font-weight: 800;
    font-size: 0.85rem;
}}

.search-dot {{
    width: 34px;
    height: 34px;
    border: 1px solid {SEMA_BORDER};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}}

.nav {{
    display: flex;
    justify-content: center;
    gap: 2rem;
    border-top: 1px solid {SEMA_BORDER};
    border-bottom: 1px solid {SEMA_BORDER};
    padding: 0.75rem 0;
    margin-bottom: 0;
    flex-wrap: wrap;
}}

.nav a {{
    color: {SEMA_TEXT};
    text-decoration: none;
    font-size: 1.1rem;
    font-weight: 800;
}}

.nav a:hover {{
    color: {SEMA_RED};
}}

.hero {{
    position: relative;
    min-height: 420px;
    background:
        linear-gradient(
            90deg,
            rgba(6,43,73,0.80),
            rgba(6,43,73,0.45)
        ),
        url("data:image/jpeg;base64,{hero_base64}");
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    margin-bottom: 0;
}}

.hero-content {{
    max-width: 620px;
    padding: 4rem 2rem;
    color: white;
}}

.hero h1 {{
    font-size: 3.1rem;
    line-height: 1.05;
    font-weight: 900;
    margin: 0 0 1rem 0;
}}

.hero p {{
    font-size: 1.02rem;
    line-height: 1.7;
    max-width: 560px;
    margin-bottom: 1.4rem;
}}

.btn-primary {{
    display: inline-block;
    background: {SEMA_RED};
    color: white !important;
    padding: 0.8rem 1.25rem;
    border-radius: 6px;
    text-decoration: none !important;
    font-weight: 800;
    font-size: 0.9rem;
}}
.btn-primary:hover {{
    text-decoration: none !important;
    background: #A80F1A;
}}
.stats-bar {{
    background: white;
    margin: -2.2rem 1.4rem 2rem 1.4rem;
    position: relative;
    z-index: 3;
    border-radius: 8px;
    box-shadow: 0 14px 35px rgba(0,0,0,0.12);
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    overflow: hidden;
}}

.stat {{
    text-align: center;
    padding: 1.35rem 1rem;
    border-right: 1px solid {SEMA_BORDER};
}}

.stat:last-child {{
    border-right: none;
}}

.stat-number {{
    color: {SEMA_BLUE};
    font-size: 1.35rem;
    font-weight: 900;
    line-height: 1.05;
}}

.stat-label {{
    color: {SEMA_MUTED};
    font-size: 0.76rem;
    font-weight: 700;
    margin-top: 0.35rem;
}}

.section {{
    padding: 1.6rem 0;
}}

.section h2 {{
    font-size: 2rem;
    color: {SEMA_TEXT};
    font-weight: 900;
    margin-bottom: 0.5rem;
}}

.section-intro {{
    color: {SEMA_MUTED};
    font-size: 1.05rem;
    max-width: 900px;
    line-height: 1.55;
    margin-bottom: 1.6rem;
}}

.cards-4 {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.2rem;
}}

.card {{
    background: white;
    border: 1px solid {SEMA_BORDER};
    border-radius: 8px;
    padding: 1.5rem;
    min-height: 300px;
    box-shadow: 0 8px 22px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
}}

.icon {{
    font-size: 1.8rem;
    color: {SEMA_BLUE};
    margin-bottom: 1.2rem;
    min-height: 42px;
}}

.card h3 {{
    font-size: 1.2rem;
    font-weight: 900;
    color: {SEMA_TEXT};
    margin: 0 0 1.3rem 0;
    min-height: 58px;
}}

.card p {{
    color: {SEMA_MUTED};
    font-size: 0.98rem;
    line-height: 1.55;
    margin: 0;
}}
.about-band {{
    background: {SEMA_LIGHT};
    border: 1px solid {SEMA_BORDER};
    border-radius: 12px;
    padding: 2rem;
    margin: 2rem 0;
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 2rem;
    align-items: start;
}}

.about-band h2 {{
    font-size: 1.7rem;
    margin-top: 0;
    color: {SEMA_TEXT};
}}

.about-band p {{
    color: {SEMA_MUTED};
    line-height: 1.75;
    font-size: 0.96rem;
}}

.about-list {{
    background: white;
    border: 1px solid {SEMA_BORDER};
    border-radius: 10px;
    padding: 1.4rem;
}}

.about-list h3 {{
    margin-top: 0;
    color: {SEMA_BLUE};
    font-size: 1.05rem;
}}

.about-list ul {{
    margin: 0;
    padding-left: 1.2rem;
}}

.about-list li {{
    margin-bottom: 0.7rem;
    color: {SEMA_MUTED};
    line-height: 1.5;
}}

.map-band {{
    background: linear-gradient(120deg, {SEMA_NAVY}, {SEMA_BLUE});
    color: white;
    border-radius: 8px;
    padding: 2rem;
    display: grid;
    grid-template-columns: 1fr 0.8fr;
    gap: 2rem;
    align-items: center;
    margin: 1.5rem 0 2rem 0;
}}

.map-placeholder {{
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.22);
    border-radius: 8px;
    min-height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 4rem;
}}
.somalia-map {{
    max-width: 85%;
    max-height: 230px;
    object-fit: contain;
    opacity: 0.95;
}}

.news-grid {{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.2rem;
}}

.news-card {{
    border: 1px solid {SEMA_BORDER};
    border-radius: 8px;
    overflow: hidden;
    background: white;
    box-shadow: 0 8px 22px rgba(0,0,0,0.05);
}}

.news-image {{
    height: 180px;
    overflow: hidden;
}}

.news-image img {{
    width: 100%;
    height: 180px;
    object-fit: cover;
    display: block;
}}

.news-body {{
    padding: 1rem;
}}

.news-date {{
    color: {SEMA_BLUE};
    font-size: 0.75rem;
    font-weight: 900;
    margin-bottom: 0.4rem;
}}

.news-body h3 {{
    font-size: 1.2rem;
    margin: 0 0 0.5rem 0;
    font-weight: 900;
}}

.news-body h3 a{{
    color: {SEMA_TEXT};
    text-decoration: none !important;
}}

.news-body h3 a:hover{{
    color: {SEMA_RED};
    text-decoration: none !important;
}}

.news-body p {{
    color: {SEMA_MUTED};
    font-size: 0.84rem;
    line-height: 1.55;
}}

.partners-strip {{
    background: {SEMA_LIGHT};
    border: 1px solid {SEMA_BORDER};
    border-radius: 12px;
    padding: 2rem;
    margin: 2rem 0;
    text-align: center;
}}

.partners-strip h2 {{
    margin-top: 0;
    color: {SEMA_TEXT};
    font-size: 1.45rem;
}}

.partners-strip p {{
    color: {SEMA_MUTED};
    margin-bottom: 1.5rem;
}}

.partner-grid {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
}}

.partner-item {{
    background: white;
    border: 1px solid {SEMA_BORDER};
    border-radius: 10px;
    padding: 1rem;
    font-weight: 800;
    color: {SEMA_BLUE};
}}

.footer {{
    background: {SEMA_NAVY};
    color: white;
    margin-top: 2rem;
    padding: 2rem;
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr 1fr;
    gap: 2rem;
}}

.footer a {{
    color: #FFFFFF !important;
    text-decoration: none !important;
    font-weight: 700;
}}

.footer a:hover {{
    color: #7DD3FC !important;
    text-decoration: none !important;
}}

.footer h4 {{
    margin-top: 0;
    margin-bottom: 1rem;
    color: white;
}}

.footer p, .footer li {{
    color: #D7E6F3;
    font-size: 1rem;
    line-height: 1.6;
}}

.footer ul {{
    list-style: none;
    padding: 0;
    margin: 0;
}}

.copyright {{
    background: #032139;
    color: #D7E6F3;
    text-align: center;
    padding: 0.9rem;
    font-size: 0.78rem;
}}

@media (max-width: 900px) {{
    .header {{
        align-items: flex-start;
        flex-direction: column;
    }}
    .nav {{
        justify-content: flex-start;
        gap: 1rem;
    }}
    .hero h1 {{
        font-size: 2.2rem;
    }}
    .stats-bar,
    .cards-4,
    .news-grid,
    .map-band,
    .footer {{
        grid-template-columns: 1fr;
    }}
}}
</style>
""",
    unsafe_allow_html=True,
)

st.markdown(
    f"""
<div class="top-strip">
    <span>EN</span>
    <span>|</span>
    <span>SO</span>
</div>

<div class="header">
    <div class="brand">
        {logo_html}
        <div>
            <div class="brand-title">SEMA</div>
            <div class="brand-sub">Somalia Explosive<br>Management Authority</div>
        </div>
    </div>

</div>

<div class="nav">
    <a href="#home">Home</a>
    <a href="/About_SEMA">About</a>
    <a href="/Mandate">Mandate</a>
    <a href="/Operations">Operations</a>
    <a href="/Operators">Operators</a>
    <a href="/Publications">Publications</a>
    <a href="/News">News</a>
    <a href="/Contact">Contact</a>
</div>

<div id="home" class="hero">
    <div class="hero-content">
        <h1>Leading Somalia's Response<br>to Explosive Hazards</h1>
        <p>
            The Somalia Explosive Management Authority (SEMA) leads national coordination,
            policy oversight, information management, and operational prioritisation to
            reduce the impact of explosive hazards across Somalia.
        </p>
        <a class="btn-primary" href="#about">Learn More</a>
    </div>
</div>

<div class="stats-bar">
    <div class="stat">
        <div class="stat-number">20+</div>
        <div class="stat-label">Years of sector service</div>
    </div>
    <div class="stat">
        <div class="stat-number">All</div>
        <div class="stat-label">Federal Member States</div>
    </div>
    <div class="stat">
        <div class="stat-number">1000+</div>
        <div class="stat-label">Personnel trained</div>
    </div>
    <div class="stat">
        <div class="stat-number">Millions</div>
        <div class="stat-label">People reached through awareness</div>
    </div>
</div>
""",
    unsafe_allow_html=True,
)

st.markdown(
    """
<div id="about" class="section">
    <h2>What We Do</h2>
    <div class="section-intro">
        SEMA provides leadership and coordination across Somalia’s mine action sector to support effective,
        accountable, and principled action. The authority works with government institutions, operators,
        partners, and communities to reduce the impact of explosive hazards.
    </div>
</div>
""",
    unsafe_allow_html=True,
)

st.markdown(
    f"""
<div class="cards-4">
    <div class="card">
        <div class="icon">🧭</div>
        <h3>Survey & Clearance Coordination</h3>
        <p>Technical survey, prioritization, clearance coordination, and operational visibility.</p>
    </div>
    <div class="card">
        <div class="icon">📣</div>
        <h3>Risk Education</h3>
        <p>Community awareness and safer behaviour messaging for affected populations.</p>
    </div>
    <div class="card">
        <div class="icon">🤝</div>
        <h3>Victim Assistance</h3>
        <p>Supporting coordination around the needs of survivors and affected communities.</p>
    </div>
    <div class="card">
        <div class="icon">🏛️</div>
        <h3>Capacity Building</h3>
        <p>Strengthening institutional systems, standards, information management, and coordination.</p>
    </div>
</div>

<div class="map-band">
<div>
<h2>National Coverage</h2>
<p>SEMA supports mine action coordination across Somalia, working with Federal Member States, operators, and partners to strengthen national oversight, information management, prioritisation, and public safety.</p>
<a class="btn-primary" href="/Operations">View Operations</a>
</div>
<div class="map-placeholder">
    <img src="data:image/jpeg;base64,{map_base64}" class="somalia-map">
</div>
</div>
</div>
<div id="news" class="section">
<h2>Latest News</h2>
<div class="section-intro">Official updates, coordination news, publications, and public information from SEMA.</div>

<div class="news-grid">
<a class="news-card" href="/News">
<div class="news-image"><img src="data:image/jpeg;base64,{news1_base64}"></div>
<div class="news-body">
<div class="news-date">May 10, 2026</div>
<h3>SEMA strengthens national risk education coordination</h3>
<p>Partners reviewed public awareness priorities and community safety messaging.</p>
</div>
</a>

<a class="news-card" href="/News">
<div class="news-image"><img src="data:image/jpeg;base64,{news2_base64}"></div>
<div class="news-body">
<div class="news-date">April 28, 2026</div>
<h3>New standards for survey and clearance published</h3>
<p>SEMA shared updated technical guidance for operators and sector partners.</p>
</div>
</a>

<a class="news-card" href="/News">
<div class="news-image"><img src="data:image/jpeg;base64,{news3_base64}"></div>
<div class="news-body">
<div class="news-date">April 15, 2026</div>
<h3>National coordination meeting held in Mogadishu</h3>
<p>Government, operators, and partners discussed implementation priorities.</p>
</div>
</a>
</div>
</div>
<div class="partners-strip">
<h2>Partners and Coordination</h2>
<p>SEMA works with national institutions, operators, donors, and technical partners to support a coordinated mine action response in Somalia.</p>

<div class="partner-grid">
<div class="partner-item">Government Institutions</div>
<div class="partner-item">Federal Member States</div>
<div class="partner-item">Mine Action Operators</div>
<div class="partner-item">International Partners</div>
</div>
</div>
<div id="contact" class="footer">
<div>
<h4>SEMA</h4>
<p>Somalia Explosive Management Authority</p>
<p>National leadership, coordination, and public information for mine action and explosive hazard management.</p>
</div>

<div>
<h4>Quick Links</h4>
<ul>
<li><a href="/About_SEMA">About</a></li>
<li><a href="/Mandate">Mandate</a></li>
<li><a href="/Operations">Operations</a></li>
<li><a href="/Operators">Operators</a></li>
<li><a href="/Publications">Publications</a></li>
<li><a href="/News">News</a></li>
<li><a href="/Contact">Contact</a></li>
</ul>
</div>

<div>
<h4>Resources</h4>
<ul>
<li>Policies & Standards</li>
<li>Guidelines</li>
<li>Reports</li>
<li>Data & Maps</li>
</ul>
</div>

<div>
<h4>Contact</h4>
<ul>
<li>Mogadishu, Somalia</li>
<li>info@sema.gov.so</li>
<li>+252 61 555 7890</li>
</ul>
</div>
</div>

<div class="copyright">
© 2026 Somalia Explosive Management Authority (SEMA). All rights reserved.
</div>
""",
    unsafe_allow_html=True,
)
