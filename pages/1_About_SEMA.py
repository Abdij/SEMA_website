import streamlit as st
from pathlib import Path
import base64

st.set_page_config(
    page_title="About SEMA | Somalia Explosive Management Authority",
    page_icon="🛡️",
    layout="wide",
)

st.title("About SEMA")

st.markdown("""
The Somalia Explosive Management Authority (SEMA) is the national institution responsible for leading and coordinating mine action and explosive hazard management across Somalia.

SEMA works with government institutions, Federal Member States, operators, communities, and international partners to strengthen public safety, improve coordination, support information management, and reduce the impact of explosive hazards on people, services, livelihoods, and development.
""")

st.header("Mandate")

st.markdown("""
SEMA supports national coordination, policy direction, standards, information management, public reporting, operator engagement, and operational prioritisation across Somalia’s mine action sector.
""")

st.header("Core Responsibilities")

st.markdown("""
- National coordination of mine action stakeholders
- Policy direction, standards, and technical guidance
- Information management and public reporting
- Operator engagement and operational prioritisation
- Risk education and public information
- Support to safer recovery and development
""")