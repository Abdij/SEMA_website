# SEMA Streamlit App

A deployable Streamlit website for the Somalia Explosive Management Authority (SEMA), with a hazard reporting system and operations dashboard.

## Features

- Public homepage inspired by the original SEMA prototype
- Hazard reporting form with validation
- SQLite database for reports
- Dashboard to view and update report status
- Optional admin password using Streamlit secrets

## Project structure

```text
sema_streamlit_app/
├── streamlit_app.py
├── requirements.txt
├── .gitignore
└── README.md
```

## Local run

```bash
pip install -r requirements.txt
streamlit run streamlit_app.py
```

## Deploy on Streamlit Community Cloud

1. Push these files to a GitHub repository.
2. Go to Streamlit Community Cloud.
3. Create a new app from your GitHub repo.
4. Set the main file path to:
   ```text
   streamlit_app.py
   ```
5. Optional: add a secret for the dashboard password.

## Optional secrets

In Streamlit Cloud, add this in **Secrets**:

```toml
ADMIN_PASSWORD = "change-this-password"
```

If no password is set, the dashboard stays open.

## Notes

- The app creates `hazards.db` automatically at runtime.
- For production scale, replace SQLite with PostgreSQL.
- You can later add:
  - photo uploads
  - email notifications
  - geolocation maps
  - user authentication
  - case assignment workflow
