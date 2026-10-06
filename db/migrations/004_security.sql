-- Additive security storage. Apply before deploying the security release.
begin;
create table if not exists security_rate_limits (
  bucket_key text primary key,
  attempts integer not null,
  expires_at timestamptz not null
);
create index if not exists security_rate_limits_expiry_idx on security_rate_limits (expires_at);
create table if not exists admin_sessions (
  token_hash text primary key,
  credential_fingerprint text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists admin_sessions_expiry_idx on admin_sessions (expires_at);
commit;
