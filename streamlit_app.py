import streamlit as st
import time

# Page configuration
st.set_page_config(
    page_title="SEMA | Somalia Explosive Management Authority",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS for styling
st.markdown("""
<style>
    /* Import Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap');
    
    * {
        font-family: 'Inter', sans-serif;
    }
    
    /* Main container styling */
    .stApp {
        background: linear-gradient(105deg, #ffffff 0%, #eef5f3 100%);
    }
    
    /* Custom button styling */
    .stButton > button {
        background-color: #1e7f6e;
        color: white;
        border: none;
        padding: 0.75rem 2rem;
        border-radius: 40px;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    
    .stButton > button:hover {
        background-color: #0e5f51;
        transform: translateY(-2px);
    }
    
    /* Card styling */
    .card {
        background: white;
        border-radius: 28px;
        padding: 2rem;
        box-shadow: 0 12px 28px -8px rgba(0,0,0,0.06);
        border: 1px solid #e6f0ee;
        transition: all 0.3s ease;
        height: 100%;
    }
    
    .card:hover {
        transform: translateY(-5px);
        border-color: #1e7f6e;
    }
    
    .card-icon {
        font-size: 44px;
        color: #1e7f6e;
        margin-bottom: 1.5rem;
    }
    
    .card h3 {
        font-size: 1.7rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: #0a2b3e;
    }
    
    .card p {
        color: #3b5b6b;
        line-height: 1.6;
    }
    
    /* Function item styling */
    .func-item {
        background: white;
        border-radius: 24px;
        padding: 1.75rem;
        border-left: 4px solid #d4af37;
        box-shadow: 0 5px 12px rgba(0,0,0,0.02);
        height: 100%;
    }
    
    .func-item i {
        font-size: 36px;
        color: #1e7f6e;
        margin-bottom: 1rem;
    }
    
    .func-item h4 {
        font-size: 1.4rem;
        font-weight: 700;
        margin-bottom: 0.75rem;
        color: #0a2b3e;
    }
    
    /* Stat box styling */
    .stat-box {
        text-align: center;
        padding: 1rem;
    }
    
    .stat-number {
        font-size: 2.5rem;
        font-weight: 800;
        color: #d4af37;
    }
    
    /* News card */
    .news-card {
        background: white;
        border-radius: 28px;
        overflow: hidden;
        box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        border: 1px solid #e2edeb;
        height: 100%;
    }
    
    .news-img {
        background: #cbdcd8;
        height: 180px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 58px;
        color: #0a2b3e;
    }
    
    .news-content {
        padding: 1.5rem;
    }
    
    .news-date {
        font-size: 0.75rem;
        color: #1e7f6e;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    /* Hero section */
    .hero-badge {
        background: rgba(30,127,110,0.12);
        display: inline-block;
        padding: 6px 16px;
        border-radius: 30px;
        font-size: 0.8rem;
        font-weight: 600;
        color: #1e7f6e;
        margin-bottom: 1.25rem;
    }
    
    /* Stats banner */
    .stats-banner {
        background: #0a2b3e;
        padding: 3rem 0;
        border-radius: 0;
        margin: 0;
    }
    
    hr {
        margin: 0;
    }
    
    .contact-section {
        background: linear-gradient(135deg, #eef7f4 0%, #e2f0ec 100%);
        padding: 3rem;
        border-radius: 28px;
        margin: 2rem 0;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .card, .func-item {
            margin-bottom: 1rem;
        }
    }
</style>
""", unsafe_allow_html=True)

# Header Section
col1, col2, col3 = st.columns([1, 2, 1])
with col1:
    st.markdown("""
    <div style="display: flex; align-items: center; gap: 14px;">
        <div style="background: #0a2b3e; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-shield-alt" style="font-size: 26px; color: #d4af37;"></i>
        </div>
        <div>
            <h1 style="font-size: 1.55rem; font-weight: 800; color: #0a2b3e; margin: 0;">SEMA</h1>
            <span style="font-size: 0.75rem; color: #1e7f6e;">Somalia Explosive Management Authority</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

with col3:
    st.markdown("<div style='text-align: right; padding-top: 10px;'></div>", unsafe_allow_html=True)

# Hero Section
hero_col1, hero_col2 = st.columns([1, 0.8])
with hero_col1:
    st.markdown("""
    <div class="hero-badge">
        <i class="fas fa-exclamation-triangle"></i> National Mandate
    </div>
    <h1 style="font-size: 3.2rem; font-weight: 800; color: #0a2b3e; line-height: 1.2; margin-bottom: 1rem;">
        Securing Somalia<br>from Explosive Threats
    </h1>
    <p style="font-size: 1.15rem; color: #2c4c5c; margin-bottom: 2rem;">
        Coordinating national efforts in explosive hazard management, risk reduction, and capacity building for a safer Somalia.
    </p>
    """, unsafe_allow_html=True)
    
    if st.button("🚀 Explore Our Mission", key="explore"):
        st.info("SEMA — leading explosive risk reduction across Somalia. Visit our operations page for full details.")

with hero_col2:
    st.markdown("""
    <div style="background: #d9eae6; border-radius: 36px; padding: 20px; text-align: center; box-shadow: 0 20px 30px -15px rgba(0,0,0,0.1);">
        <i class="fas fa-land-mine-on" style="font-size: 180px; color: #0a2b3e; opacity: 0.85;"></i>
    </div>
    """, unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# Mission & Vision Cards
st.markdown("<h2 style='text-align: center; font-size: 2.2rem; font-weight: 800; color: #0a2b3e;'>Our Mandate</h2>", unsafe_allow_html=True)
st.markdown("<p style='text-align: center; color: #4a6272; margin-bottom: 2rem;'>Guided by international standards and Somali national security priorities</p>", unsafe_allow_html=True)

col1, col2, col3 = st.columns(3)
with col1:
    st.markdown("""
    <div class="card">
        <div class="card-icon"><i class="fas fa-bullseye"></i></div>
        <h3>Mission</h3>
        <p>To protect Somali lives and infrastructure by regulating, managing, and eliminating explosive risks through coordinated national strategy, technical expertise, and community resilience.</p>
    </div>
    """, unsafe_allow_html=True)

with col2:
    st.markdown("""
    <div class="card">
        <div class="card-icon"><i class="fas fa-eye"></i></div>
        <h3>Vision</h3>
        <p>A Somalia free from the threat of explosive ordnance, where safety, development, and stability prevail for all citizens.</p>
    </div>
    """, unsafe_allow_html=True)

with col3:
    st.markdown("""
    <div class="card">
        <div class="card-icon"><i class="fas fa-handshake"></i></div>
        <h3>Partnerships</h3>
        <p>Collaborating with federal states, international agencies, NGOs, and local communities to ensure sustainable explosive management.</p>
    </div>
    """, unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# Core Functions
st.markdown("<h2 style='text-align: center; font-size: 2.2rem; font-weight: 800; color: #0a2b3e;'>Core Functions</h2>", unsafe_allow_html=True)
st.markdown("<p style='text-align: center; color: #4a6272; margin-bottom: 2rem;'>SEMA leads explosive hazard management across Somalia with technical precision and accountability</p>", unsafe_allow_html=True)

func_col1, func_col2, func_col3, func_col4 = st.columns(4)
with func_col1:
    st.markdown("""
    <div class="func-item">
        <i class="fas fa-database"></i>
        <h4>Ordnance Registry</h4>
        <p>Maintaining a national database of explosive remnants, stockpile locations, and risk mapping.</p>
    </div>
    """, unsafe_allow_html=True)

with func_col2:
    st.markdown("""
    <div class="func-item">
        <i class="fas fa-chalkboard-user"></i>
        <h4>EOD Training</h4>
        <p>Delivering advanced Explosive Ordnance Disposal (EOD) and IED defeat courses for security forces.</p>
    </div>
    """, unsafe_allow_html=True)

with func_col3:
    st.markdown("""
    <div class="func-item">
        <i class="fas fa-building-shield"></i>
        <h4>Regulatory Oversight</h4>
        <p>Licensing and monitoring commercial explosives, ammunition storage facilities, and transport safety.</p>
    </div>
    """, unsafe_allow_html=True)

with func_col4:
    st.markdown("""
    <div class="func-item">
        <i class="fas fa-people-arrows"></i>
        <h4>Community Awareness</h4>
        <p>Risk education programs to protect civilians from explosive hazards, especially in rural areas.</p>
    </div>
    """, unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# Statistics Banner with dynamic counters
st.markdown("""
<div class="stats-banner">
    <div style="max-width: 1280px; margin: 0 auto; padding: 0 32px;">
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 30px; text-align: center;">
            <div class="stat-box">
                <div class="stat-number" id="stat-clear">0</div>
                <p style="color: white; font-weight: 500;">Hectares Cleared</p>
            </div>
            <div class="stat-box">
                <div class="stat-number" id="stat-eod">0</div>
                <p style="color: white; font-weight: 500;">EOD Operations</p>
            </div>
            <div class="stat-box">
                <div class="stat-number" id="stat-trained">0</div>
                <p style="color: white; font-weight: 500;">Personnel Trained</p>
            </div>
            <div class="stat-box">
                <div class="stat-number" id="stat-awareness">0</div>
                <p style="color: white; font-weight: 500;">Community Sessions</p>
            </div>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# JavaScript for counter animation
st.markdown("""
<script>
function animateCounter(elementId, target, suffix = '') {
    let current = 0;
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const increment = target / 50;
    const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(interval);
        }
        element.textContent = Math.floor(current).toLocaleString() + suffix;
    }, 30);
}

// Start animations when page loads
window.addEventListener('load', () => {
    setTimeout(() => {
        animateCounter('stat-clear', 1240, ' km²');
        animateCounter('stat-eod', 3450, '+');
        animateCounter('stat-trained', 2780, '+');
        animateCounter('stat-awareness', 890, '+');
    }, 500);
});
</script>
""", unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# Latest Updates
st.markdown("<h2 style='text-align: center; font-size: 2.2rem; font-weight: 800; color: #0a2b3e;'>Latest Updates</h2>", unsafe_allow_html=True)
st.markdown("<p style='text-align: center; color: #4a6272; margin-bottom: 2rem;'>Operational milestones, public alerts, and capacity building news</p>", unsafe_allow_html=True)

news_col1, news_col2, news_col3 = st.columns(3)
with news_col1:
    st.markdown("""
    <div class="news-card">
        <div class="news-img"><i class="fas fa-hard-hat"></i></div>
        <div class="news-content">
            <div class="news-date"><i class="far fa-calendar-alt"></i> March 20, 2026</div>
            <h4 style="margin: 12px 0 10px; font-size: 1.3rem;">New EOD training center opens in Mogadishu</h4>
            <p>SEMA inaugurates a state-of-the-art facility to enhance national disposal capabilities and regional cooperation.</p>
        </div>
    </div>
    """, unsafe_allow_html=True)

with news_col2:
    st.markdown("""
    <div class="news-card">
        <div class="news-img"><i class="fas fa-chalkboard"></i></div>
        <div class="news-content">
            <div class="news-date"><i class="far fa-calendar-alt"></i> March 5, 2026</div>
            <h4 style="margin: 12px 0 10px; font-size: 1.3rem;">Community risk awareness campaign reaches 15 districts</h4>
            <p>Interactive workshops and radio spots reduce explosive incidents among vulnerable populations.</p>
        </div>
    </div>
    """, unsafe_allow_html=True)

with news_col3:
    st.markdown("""
    <div class="news-card">
        <div class="news-img"><i class="fas fa-handcuffs"></i></div>
        <div class="news-content">
            <div class="news-date"><i class="far fa-calendar-alt"></i> February 18, 2026</div>
            <h4 style="margin: 12px 0 10px; font-size: 1.3rem;">Seizure of illegal explosives in joint operation</h4>
            <p>Federal and state forces disrupt illicit supply chains; SEMA provides technical support.</p>
        </div>
    </div>
    """, unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# Contact Section
with st.container():
    st.markdown("""
    <div class="contact-section">
        <div style="max-width: 700px; margin: 0 auto; text-align: center;">
            <h2 style="font-size: 2rem; font-weight: 800; color: #0a2b3e; margin-bottom: 1rem;">Report an Explosive Hazard</h2>
            <p style="margin-bottom: 1rem;">If you suspect unexploded ordnance or suspicious devices, stay clear and contact SEMA immediately.</p>
            <div style="display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; margin: 40px 0 20px;">
                <div>
                    <i class="fas fa-phone-alt" style="font-size: 26px; color: #1e7f6e;"></i>
                    <p style="font-weight: 500;">+252 61 555 7890</p>
                </div>
                <div>
                    <i class="fas fa-envelope" style="font-size: 26px; color: #1e7f6e;"></i>
                    <p style="font-weight: 500;">contact@sema.gov.so</p>
                </div>
                <div>
                    <i class="fas fa-map-marker-alt" style="font-size: 26px; color: #1e7f6e;"></i>
                    <p style="font-weight: 500;">KM4, Mogadishu, Somalia</p>
                </div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    col_btn1, col_btn2, col_btn3 = st.columns([1, 1, 1])
    with col_btn2:
        if st.button("⚠️ Report a hazard (24/7)", key="report", use_container_width=True):
            st.warning("📞 Emergency hotline: +252 61 555 7890\n📧 contact@sema.gov.so\nPlease stay at a safe distance and provide location details.")

# Footer
st.markdown("---")
footer_col1, footer_col2, footer_col3 = st.columns(3)
with footer_col1:
    st.markdown("""
    <h4 style="color: #0a2b3e;">Somalia Explosive Management Authority</h4>
    <p style="color: #4a6272;">Working towards a safer Somalia through professional explosive ordnance management, regulation, and public safety.</p>
    """, unsafe_allow_html=True)

with footer_col2:
    st.markdown("""
    <h4 style="color: #0a2b3e;">Quick links</h4>
    <p>📄 About SEMA<br>
    📋 Strategic Framework<br>
    🎓 EOD Guidelines<br>
    💼 Vacancies</p>
    """, unsafe_allow_html=True)

with footer_col3:
    st.markdown("""
    <h4 style="color: #0a2b3e;">Resources</h4>
    <p>📊 Annual Reports<br>
    📢 Public Awareness Material<br>
    🤝 Partner Organizations</p>
    """, unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)
st.markdown("<p style='text-align: center; color: #4a6272; padding: 1rem 0;'>© 2026 Somalia Explosive Management Authority (SEMA) — United for a safer tomorrow.</p>", unsafe_allow_html=True)