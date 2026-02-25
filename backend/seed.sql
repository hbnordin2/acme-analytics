-- =============================================================================
-- Acme Analytics — Dedicated Database Schema + Seed Data
-- PostgreSQL 16, UUID primary keys, realistic data
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 1. Users (100 rows) — copied from shared fleet, same UUIDs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('enterprise', 'pro', 'free')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMPTZ
);

INSERT INTO users (id, email, name, avatar_url, role, plan, created_at, last_seen) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'sarah.chen@acmecorp.com', 'Sarah Chen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', 'admin', 'enterprise', NOW() - INTERVAL '340 days', NOW() - INTERVAL '1 hour'),
  ('a0000000-0000-0000-0000-000000000002', 'james.wilson@acmecorp.com', 'James Wilson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=james', 'admin', 'enterprise', NOW() - INTERVAL '335 days', NOW() - INTERVAL '3 hours'),
  ('a0000000-0000-0000-0000-000000000003', 'maria.garcia@acmecorp.com', 'Maria Garcia', 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria', 'admin', 'enterprise', NOW() - INTERVAL '320 days', NOW() - INTERVAL '2 hours'),
  ('a0000000-0000-0000-0000-000000000004', 'david.kim@acmecorp.com', 'David Kim', 'https://api.dicebear.com/7.x/avataaars/svg?seed=david', 'member', 'pro', NOW() - INTERVAL '310 days', NOW() - INTERVAL '5 hours'),
  ('a0000000-0000-0000-0000-000000000005', 'emily.johnson@acmecorp.com', 'Emily Johnson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily', 'member', 'pro', NOW() - INTERVAL '300 days', NOW() - INTERVAL '1 day'),
  ('a0000000-0000-0000-0000-000000000006', 'michael.brown@techstart.io', 'Michael Brown', 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael', 'admin', 'pro', NOW() - INTERVAL '290 days', NOW() - INTERVAL '4 hours'),
  ('a0000000-0000-0000-0000-000000000007', 'jessica.martinez@techstart.io', 'Jessica Martinez', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jessica', 'member', 'pro', NOW() - INTERVAL '285 days', NOW() - INTERVAL '6 hours'),
  ('a0000000-0000-0000-0000-000000000008', 'robert.taylor@techstart.io', 'Robert Taylor', 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert', 'viewer', 'free', NOW() - INTERVAL '275 days', NOW() - INTERVAL '2 days'),
  ('a0000000-0000-0000-0000-000000000009', 'lisa.anderson@dataflow.co', 'Lisa Anderson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa', 'admin', 'enterprise', NOW() - INTERVAL '265 days', NOW() - INTERVAL '30 minutes'),
  ('a0000000-0000-0000-0000-000000000010', 'daniel.thomas@dataflow.co', 'Daniel Thomas', 'https://api.dicebear.com/7.x/avataaars/svg?seed=daniel', 'member', 'pro', NOW() - INTERVAL '260 days', NOW() - INTERVAL '8 hours'),
  ('a0000000-0000-0000-0000-000000000011', 'amanda.jackson@dataflow.co', 'Amanda Jackson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=amanda', 'viewer', 'free', NOW() - INTERVAL '250 days', NOW() - INTERVAL '3 days'),
  ('a0000000-0000-0000-0000-000000000012', 'christopher.white@nexgen.dev', 'Christopher White', 'https://api.dicebear.com/7.x/avataaars/svg?seed=christopher', 'member', 'pro', NOW() - INTERVAL '245 days', NOW() - INTERVAL '12 hours'),
  ('a0000000-0000-0000-0000-000000000013', 'stephanie.harris@nexgen.dev', 'Stephanie Harris', 'https://api.dicebear.com/7.x/avataaars/svg?seed=stephanie', 'viewer', 'free', NOW() - INTERVAL '240 days', NOW() - INTERVAL '1 day'),
  ('a0000000-0000-0000-0000-000000000014', 'matthew.martin@nexgen.dev', 'Matthew Martin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=matthew', 'member', 'pro', NOW() - INTERVAL '230 days', NOW() - INTERVAL '5 hours'),
  ('a0000000-0000-0000-0000-000000000015', 'jennifer.thompson@cloudpeak.io', 'Jennifer Thompson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jennifer', 'admin', 'enterprise', NOW() - INTERVAL '225 days', NOW() - INTERVAL '2 hours'),
  ('a0000000-0000-0000-0000-000000000016', 'kevin.garcia@cloudpeak.io', 'Kevin Garcia', 'https://api.dicebear.com/7.x/avataaars/svg?seed=kevin', 'member', 'enterprise', NOW() - INTERVAL '220 days', NOW() - INTERVAL '45 minutes'),
  ('a0000000-0000-0000-0000-000000000017', 'rachel.martinez@cloudpeak.io', 'Rachel Martinez', 'https://api.dicebear.com/7.x/avataaars/svg?seed=rachel', 'member', 'pro', NOW() - INTERVAL '210 days', NOW() - INTERVAL '7 hours'),
  ('a0000000-0000-0000-0000-000000000018', 'andrew.robinson@cloudpeak.io', 'Andrew Robinson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=andrew', 'viewer', 'free', NOW() - INTERVAL '200 days', NOW() - INTERVAL '4 days'),
  ('a0000000-0000-0000-0000-000000000019', 'nicole.clark@velocityai.com', 'Nicole Clark', 'https://api.dicebear.com/7.x/avataaars/svg?seed=nicole', 'admin', 'pro', NOW() - INTERVAL '195 days', NOW() - INTERVAL '1 hour'),
  ('a0000000-0000-0000-0000-000000000020', 'joshua.rodriguez@velocityai.com', 'Joshua Rodriguez', 'https://api.dicebear.com/7.x/avataaars/svg?seed=joshua', 'member', 'pro', NOW() - INTERVAL '190 days', NOW() - INTERVAL '3 hours'),
  ('a0000000-0000-0000-0000-000000000021', 'megan.lewis@velocityai.com', 'Megan Lewis', 'https://api.dicebear.com/7.x/avataaars/svg?seed=megan', 'viewer', 'free', NOW() - INTERVAL '185 days', NOW() - INTERVAL '2 days'),
  ('a0000000-0000-0000-0000-000000000022', 'brandon.lee@velocityai.com', 'Brandon Lee', 'https://api.dicebear.com/7.x/avataaars/svg?seed=brandon', 'member', 'pro', NOW() - INTERVAL '180 days', NOW() - INTERVAL '6 hours'),
  ('a0000000-0000-0000-0000-000000000023', 'ashley.walker@pixelcraft.design', 'Ashley Walker', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ashley', 'admin', 'enterprise', NOW() - INTERVAL '175 days', NOW() - INTERVAL '20 minutes'),
  ('a0000000-0000-0000-0000-000000000024', 'tyler.hall@pixelcraft.design', 'Tyler Hall', 'https://api.dicebear.com/7.x/avataaars/svg?seed=tyler', 'member', 'pro', NOW() - INTERVAL '170 days', NOW() - INTERVAL '9 hours'),
  ('a0000000-0000-0000-0000-000000000025', 'samantha.allen@pixelcraft.design', 'Samantha Allen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=samantha', 'viewer', 'free', NOW() - INTERVAL '165 days', NOW() - INTERVAL '1 day'),
  ('a0000000-0000-0000-0000-000000000026', 'ryan.young@quantumleap.tech', 'Ryan Young', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ryan', 'member', 'enterprise', NOW() - INTERVAL '160 days', NOW() - INTERVAL '3 hours'),
  ('a0000000-0000-0000-0000-000000000027', 'lauren.hernandez@quantumleap.tech', 'Lauren Hernandez', 'https://api.dicebear.com/7.x/avataaars/svg?seed=lauren', 'member', 'pro', NOW() - INTERVAL '155 days', NOW() - INTERVAL '5 hours'),
  ('a0000000-0000-0000-0000-000000000028', 'jason.king@quantumleap.tech', 'Jason King', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jason', 'viewer', 'free', NOW() - INTERVAL '150 days', NOW() - INTERVAL '2 days'),
  ('a0000000-0000-0000-0000-000000000029', 'brittany.wright@streamline.app', 'Brittany Wright', 'https://api.dicebear.com/7.x/avataaars/svg?seed=brittany', 'admin', 'pro', NOW() - INTERVAL '145 days', NOW() - INTERVAL '1 hour'),
  ('a0000000-0000-0000-0000-000000000030', 'justin.lopez@streamline.app', 'Justin Lopez', 'https://api.dicebear.com/7.x/avataaars/svg?seed=justin', 'member', 'pro', NOW() - INTERVAL '140 days', NOW() - INTERVAL '4 hours');

-- Generate remaining 70 users
INSERT INTO users (id, email, name, avatar_url, role, plan, created_at, last_seen)
SELECT
  ('a0000000-0000-0000-0000-' || LPAD(n::TEXT, 12, '0'))::UUID AS id,
  'user' || n || '@' || (ARRAY['acmecorp.com','techstart.io','dataflow.co','nexgen.dev','cloudpeak.io','velocityai.com','pixelcraft.design','quantumleap.tech','streamline.app','forgelab.com'])[1 + (n % 10)] AS email,
  (ARRAY['Alex','Jordan','Taylor','Morgan','Casey','Riley','Quinn','Avery','Cameron','Dakota','Parker','Reese','Skyler','Logan','Finley','Harper','Emerson','Rowan','Sage','Blake','Drew','Jamie','Kendall','Hayden','Charlie','Ellis','Frankie','Jules','Kai','Lee','Max','Nico','Pat','Remy','Sam','Terry','Val','Winter','Yael','Zephyr'])[1 + (n % 40)]
  || ' ' ||
  (ARRAY['Smith','Jones','Davis','Miller','Wilson','Moore','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Garcia','Martinez','Robinson','Clark','Rodriguez','Lewis','Lee','Walker','Hall','Allen','Young','Hernandez','King','Wright','Lopez','Hill','Scott','Green','Adams','Baker','Nelson','Carter','Mitchell','Perez','Roberts','Turner'])[1 + ((n * 7) % 40)] AS name,
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user' || n AS avatar_url,
  (ARRAY['member','member','member','member','viewer'])[1 + (n % 5)] AS role,
  (ARRAY['free','free','pro','pro','enterprise'])[1 + (n % 5)] AS plan,
  NOW() - (((n * 3) + 30) || ' days')::INTERVAL AS created_at,
  NOW() - ((n % 30) || ' days')::INTERVAL - ((n * 37 % 24) || ' hours')::INTERVAL AS last_seen
FROM generate_series(31, 100) AS n;

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_plan ON users(plan);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ---------------------------------------------------------------------------
-- 2. Projects (12 rows) — same as shared fleet
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'planning')),
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO projects (id, name, description, status, owner_id, created_at, updated_at) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Website Redesign', 'Complete overhaul of the marketing website with new brand guidelines', 'active', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '180 days', NOW() - INTERVAL '2 hours'),
  ('b0000000-0000-0000-0000-000000000002', 'API Migration v3', 'Migrate all REST endpoints to v3 with breaking changes', 'active', 'a0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '150 days', NOW() - INTERVAL '1 day'),
  ('b0000000-0000-0000-0000-000000000003', 'Mobile App Launch', 'React Native app for iOS and Android', 'active', 'a0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '120 days', NOW() - INTERVAL '3 hours'),
  ('b0000000-0000-0000-0000-000000000004', 'Data Pipeline Refactor', 'Replace Airflow with Dagster for ETL pipelines', 'active', 'a0000000-0000-0000-0000-000000000009', NOW() - INTERVAL '90 days', NOW() - INTERVAL '5 hours'),
  ('b0000000-0000-0000-0000-000000000005', 'Customer Portal', 'Self-service portal for enterprise customers', 'active', 'a0000000-0000-0000-0000-000000000015', NOW() - INTERVAL '200 days', NOW() - INTERVAL '12 hours'),
  ('b0000000-0000-0000-0000-000000000006', 'Auth System Upgrade', 'Migrate from custom JWT to Clerk', 'active', 'a0000000-0000-0000-0000-000000000006', NOW() - INTERVAL '60 days', NOW() - INTERVAL '6 hours'),
  ('b0000000-0000-0000-0000-000000000007', 'Analytics Dashboard', 'Internal analytics dashboard for product team', 'active', 'a0000000-0000-0000-0000-000000000019', NOW() - INTERVAL '45 days', NOW() - INTERVAL '1 hour'),
  ('b0000000-0000-0000-0000-000000000008', 'Design System v2', 'Unified component library across all products', 'planning', 'a0000000-0000-0000-0000-000000000023', NOW() - INTERVAL '30 days', NOW() - INTERVAL '2 days'),
  ('b0000000-0000-0000-0000-000000000009', 'Performance Audit', 'Lighthouse scores below 60 on key pages, need to fix', 'active', 'a0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '25 days', NOW() - INTERVAL '4 hours'),
  ('b0000000-0000-0000-0000-000000000010', 'Billing Integration', 'Stripe billing with usage-based pricing', 'archived', 'a0000000-0000-0000-0000-000000000029', NOW() - INTERVAL '300 days', NOW() - INTERVAL '45 days'),
  ('b0000000-0000-0000-0000-000000000011', 'Search Infrastructure', 'Replace Elasticsearch with Typesense', 'planning', 'a0000000-0000-0000-0000-000000000012', NOW() - INTERVAL '15 days', NOW() - INTERVAL '3 days'),
  ('b0000000-0000-0000-0000-000000000012', 'Internationalization', 'Add i18n support for EU market expansion', 'active', 'a0000000-0000-0000-0000-000000000026', NOW() - INTERVAL '40 days', NOW() - INTERVAL '8 hours');

CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);

-- ---------------------------------------------------------------------------
-- 3. Tasks (200 rows) — same as shared fleet
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'in_progress', 'review', 'done')),
  priority TEXT NOT NULL DEFAULT 'P2' CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
  project_id UUID REFERENCES projects(id),
  assignee_id UUID REFERENCES users(id),
  labels TEXT[] DEFAULT '{}',
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO tasks (title, description, status, priority, project_id, assignee_id, labels, due_date, created_at) VALUES
  ('Fix login redirect bug on Safari', 'Users on Safari 17 get stuck in a redirect loop after OAuth callback', 'in_progress', 'P0', 'b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', ARRAY['bug', 'auth'], CURRENT_DATE + INTERVAL '3 days', NOW() - INTERVAL '5 days'),
  ('Add rate limiting to /api/events endpoint', 'We are seeing abuse from scrapers hitting analytics events', 'review', 'P1', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000010', ARRAY['security', 'api'], CURRENT_DATE + INTERVAL '7 days', NOW() - INTERVAL '10 days'),
  ('Implement dark mode toggle', 'Use next-themes, persist preference in localStorage', 'done', 'P2', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', ARRAY['feature', 'ui'], CURRENT_DATE - INTERVAL '5 days', NOW() - INTERVAL '30 days'),
  ('Upgrade Next.js to 14.2', 'Need the new caching improvements for ISR pages', 'in_progress', 'P1', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', ARRAY['infrastructure', 'upgrade'], CURRENT_DATE + INTERVAL '14 days', NOW() - INTERVAL '7 days'),
  ('Fix memory leak in WebSocket reconnect logic', 'Connection objects are not being cleaned up after disconnect', 'in_progress', 'P0', 'b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000020', ARRAY['bug', 'performance'], CURRENT_DATE + INTERVAL '2 days', NOW() - INTERVAL '3 days'),
  ('Design new onboarding flow wireframes', 'Need Figma mockups for the 5-step onboarding wizard', 'done', 'P2', 'b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000023', ARRAY['design', 'ux'], CURRENT_DATE - INTERVAL '10 days', NOW() - INTERVAL '45 days'),
  ('Write API documentation for v3 endpoints', 'OpenAPI spec + interactive docs with Swagger UI', 'in_progress', 'P2', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000014', ARRAY['docs', 'api'], CURRENT_DATE + INTERVAL '21 days', NOW() - INTERVAL '14 days'),
  ('Set up Sentry error tracking', 'Configure source maps upload in CI pipeline', 'done', 'P1', 'b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000004', ARRAY['infrastructure', 'monitoring'], CURRENT_DATE - INTERVAL '20 days', NOW() - INTERVAL '35 days'),
  ('Refactor UserProfile component', 'Split the 800-line component into smaller pieces', 'backlog', 'P3', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', ARRAY['refactor', 'tech-debt'], CURRENT_DATE + INTERVAL '30 days', NOW() - INTERVAL '20 days'),
  ('Add CSV export to analytics table', 'Export filtered results with all visible columns', 'review', 'P2', 'b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000019', ARRAY['feature', 'analytics'], CURRENT_DATE + INTERVAL '5 days', NOW() - INTERVAL '8 days');

-- Generate remaining 190 tasks
INSERT INTO tasks (title, description, status, priority, project_id, assignee_id, labels, due_date, created_at)
SELECT
  (ARRAY[
    'Update dependencies for', 'Fix layout issue in', 'Add loading state to',
    'Refactor', 'Write tests for', 'Optimize rendering of',
    'Add error handling to', 'Fix accessibility in', 'Implement caching for',
    'Add validation to', 'Fix race condition in', 'Update styles for',
    'Remove deprecated code from', 'Add logging to', 'Fix type errors in'
  ])[1 + (n % 15)]
  || ' ' ||
  (ARRAY[
    'user profile section', 'settings page', 'dashboard widget', 'navigation component',
    'search functionality', 'data export feature', 'notification system', 'billing module',
    'file upload handler', 'chart component', 'table pagination', 'modal dialog',
    'form validation', 'authentication flow', 'API client layer', 'webhook handler',
    'email templates', 'report generator', 'user permissions', 'caching layer'
  ])[1 + (n % 20)] AS title,
  'Task description for item ' || n AS description,
  (ARRAY['backlog', 'in_progress', 'review', 'done'])[1 + (n % 4)] AS status,
  (ARRAY['P0', 'P1', 'P2', 'P3'])[1 + (n % 4)] AS priority,
  ('b0000000-0000-0000-0000-' || LPAD((1 + (n % 12))::TEXT, 12, '0'))::UUID AS project_id,
  ('a0000000-0000-0000-0000-' || LPAD((1 + (n % 30))::TEXT, 12, '0'))::UUID AS assignee_id,
  ARRAY[(ARRAY['bug', 'feature', 'tech-debt', 'docs', 'testing', 'performance', 'security', 'infrastructure'])[1 + (n % 8)]] AS labels,
  CURRENT_DATE + ((n % 60) - 15 || ' days')::INTERVAL AS due_date,
  NOW() - ((n * 2 + 1) || ' days')::INTERVAL AS created_at
FROM generate_series(11, 200) AS n;

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- ---------------------------------------------------------------------------
-- 4. Sessions — tracks user sessions with duration and metadata
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  pages_viewed INTEGER NOT NULL DEFAULT 1,
  entry_page TEXT NOT NULL,
  exit_page TEXT,
  referrer TEXT,
  device TEXT CHECK (device IN ('desktop', 'mobile', 'tablet')),
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  is_bounce BOOLEAN NOT NULL DEFAULT FALSE
);

-- Generate 3000 sessions over last 90 days
INSERT INTO sessions (user_id, started_at, ended_at, duration_seconds, pages_viewed, entry_page, exit_page, referrer, device, browser, os, country, city, is_bounce)
SELECT
  ('a0000000-0000-0000-0000-' || LPAD((1 + (n % 100))::TEXT, 12, '0'))::UUID AS user_id,
  NOW() - ((n * 43.2) || ' minutes')::INTERVAL AS started_at,
  NOW() - ((n * 43.2) || ' minutes')::INTERVAL + ((60 + (n * 137 % 1800)) || ' seconds')::INTERVAL AS ended_at,
  60 + (n * 137 % 1800) AS duration_seconds,
  1 + (n % 12) AS pages_viewed,
  (ARRAY['/', '/dashboard', '/pricing', '/docs', '/blog', '/sign-in', '/dashboard/events', '/dashboard/users'])[1 + (n % 8)] AS entry_page,
  (ARRAY['/dashboard', '/dashboard/settings', '/pricing', '/sign-up', '/dashboard/reports', '/dashboard/files', '/', '/docs'])[1 + (n % 8)] AS exit_page,
  (ARRAY['https://google.com', 'https://google.com', 'https://google.com', 'direct', 'direct', 'https://github.com', 'https://twitter.com', 'https://linkedin.com', 'https://news.ycombinator.com', 'https://reddit.com'])[1 + (n % 10)] AS referrer,
  (ARRAY['desktop', 'desktop', 'desktop', 'mobile', 'tablet'])[1 + (n % 5)] AS device,
  (ARRAY['Chrome', 'Chrome', 'Chrome', 'Firefox', 'Safari', 'Edge'])[1 + (n % 6)] AS browser,
  (ARRAY['macOS', 'Windows', 'Windows', 'Linux', 'iOS', 'Android'])[1 + (n % 6)] AS os,
  (ARRAY['US', 'US', 'US', 'UK', 'DE', 'FR', 'CA', 'AU', 'JP', 'BR', 'IN', 'NL'])[1 + (n % 12)] AS country,
  (ARRAY['San Francisco', 'New York', 'London', 'Berlin', 'Paris', 'Toronto', 'Sydney', 'Tokyo', 'Sao Paulo', 'Mumbai', 'Amsterdam', 'Seattle', 'Austin', 'Chicago', 'Boston'])[1 + (n % 15)] AS city,
  (n % 4 = 0) AS is_bounce
FROM generate_series(1, 3000) AS n;

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_started_at ON sessions(started_at);
CREATE INDEX idx_sessions_is_bounce ON sessions(is_bounce);
CREATE INDEX idx_sessions_referrer ON sessions(referrer);
CREATE INDEX idx_sessions_country ON sessions(country);

-- ---------------------------------------------------------------------------
-- 5. Analytics Events (8000 rows) — enriched with session_id
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  session_id UUID REFERENCES sessions(id),
  page_url TEXT,
  properties JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO analytics_events (event_name, user_id, session_id, page_url, properties, timestamp)
SELECT
  (ARRAY['page_view', 'page_view', 'page_view', 'page_view', 'click', 'click', 'signup', 'purchase', 'form_submit', 'search', 'file_download', 'button_click', 'modal_open', 'tab_switch', 'scroll_depth', 'video_play', 'error', 'api_call', 'export'])[1 + (n % 19)] AS event_name,
  ('a0000000-0000-0000-0000-' || LPAD((1 + (n % 100))::TEXT, 12, '0'))::UUID AS user_id,
  NULL AS session_id,
  (ARRAY[
    '/dashboard', '/dashboard/events', '/dashboard/users', '/dashboard/funnels',
    '/dashboard/reports', '/dashboard/settings', '/dashboard/alerts',
    '/pricing', '/', '/about', '/docs', '/blog', '/docs/api',
    '/dashboard/users/profile', '/dashboard/files', '/sign-in',
    '/sign-up', '/dashboard/settings/billing', '/dashboard/settings/team'
  ])[1 + (n % 19)] AS page_url,
  jsonb_build_object(
    'source', (ARRAY['direct', 'google', 'github', 'twitter', 'linkedin', 'referral', 'email', 'ads', 'producthunt'])[1 + (n % 9)],
    'device', (ARRAY['desktop', 'desktop', 'desktop', 'mobile', 'tablet'])[1 + (n % 5)],
    'browser', (ARRAY['Chrome', 'Chrome', 'Firefox', 'Safari', 'Edge'])[1 + (n % 5)],
    'os', (ARRAY['macOS', 'Windows', 'Linux', 'iOS', 'Android'])[1 + (n % 5)],
    'duration_ms', (n * 137 % 30000) + 500,
    'country', (ARRAY['US', 'US', 'US', 'UK', 'DE', 'FR', 'CA', 'AU', 'JP', 'BR'])[1 + (n % 10)],
    'viewport_width', (ARRAY[1920, 1440, 1366, 1280, 768, 375, 414, 390])[1 + (n % 8)],
    'session_page_number', 1 + (n % 8)
  ) AS properties,
  NOW() - (POWER(n::float / 8000.0, 1.2) * INTERVAL '90 days') AS timestamp
FROM generate_series(1, 8000) AS n;

CREATE INDEX idx_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_events_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_events_page_url ON analytics_events(page_url);
CREATE INDEX idx_events_session_id ON analytics_events(session_id);

-- ---------------------------------------------------------------------------
-- 6. Page Analytics — pre-aggregated per-page metrics
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS page_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_path TEXT NOT NULL,
  page_title TEXT NOT NULL,
  date DATE NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  unique_views INTEGER NOT NULL DEFAULT 0,
  avg_duration_seconds NUMERIC(8,2) NOT NULL DEFAULT 0,
  bounce_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  entries INTEGER NOT NULL DEFAULT 0,
  exits INTEGER NOT NULL DEFAULT 0,
  UNIQUE(page_path, date)
);

-- Generate 30 days of page analytics for 15 pages
INSERT INTO page_analytics (page_path, page_title, date, views, unique_views, avg_duration_seconds, bounce_rate, entries, exits)
SELECT
  p.path,
  p.title,
  d.date,
  (50 + (EXTRACT(DOW FROM d.date)::int * 20) + (random() * 80)::int) AS views,
  (30 + (EXTRACT(DOW FROM d.date)::int * 12) + (random() * 50)::int) AS unique_views,
  (15 + (random() * 240)::int)::numeric(8,2) AS avg_duration_seconds,
  (15 + (random() * 50)::int)::numeric(5,2) AS bounce_rate,
  (10 + (random() * 40)::int) AS entries,
  (8 + (random() * 35)::int) AS exits
FROM
  (VALUES
    ('/dashboard', 'Dashboard'),
    ('/dashboard/events', 'Events Explorer'),
    ('/dashboard/users', 'Users'),
    ('/dashboard/funnels', 'Funnel Analysis'),
    ('/dashboard/reports', 'Reports'),
    ('/dashboard/settings', 'Settings'),
    ('/dashboard/alerts', 'Alert Rules'),
    ('/dashboard/files', 'File Manager'),
    ('/', 'Home'),
    ('/pricing', 'Pricing'),
    ('/docs', 'Documentation'),
    ('/blog', 'Blog'),
    ('/about', 'About Us'),
    ('/sign-in', 'Sign In'),
    ('/sign-up', 'Sign Up')
  ) AS p(path, title),
  generate_series(CURRENT_DATE - INTERVAL '89 days', CURRENT_DATE, '1 day') AS d(date);

CREATE INDEX idx_page_analytics_path ON page_analytics(page_path);
CREATE INDEX idx_page_analytics_date ON page_analytics(date);

-- ---------------------------------------------------------------------------
-- 7. Funnels
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS funnels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS funnel_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  name TEXT NOT NULL,
  event_name TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(funnel_id, step_order)
);

INSERT INTO funnels (id, name, description, created_by, created_at) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Signup Funnel', 'Tracks the user journey from landing page to paid conversion', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '90 days'),
  ('c0000000-0000-0000-0000-000000000002', 'Purchase Funnel', 'Tracks the e-commerce checkout conversion funnel', 'a0000000-0000-0000-0000-000000000019', NOW() - INTERVAL '60 days'),
  ('c0000000-0000-0000-0000-000000000003', 'Onboarding Funnel', 'Tracks new user activation from signup to first value moment', 'a0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '45 days'),
  ('c0000000-0000-0000-0000-000000000004', 'Feature Adoption Funnel', 'Tracks adoption of the analytics dashboard feature', 'a0000000-0000-0000-0000-000000000009', NOW() - INTERVAL '30 days');

INSERT INTO funnel_steps (funnel_id, step_order, name, event_name, count) VALUES
  -- Signup Funnel
  ('c0000000-0000-0000-0000-000000000001', 1, 'Landing Page', 'page_view', 12847),
  ('c0000000-0000-0000-0000-000000000001', 2, 'Sign Up Click', 'signup', 5234),
  ('c0000000-0000-0000-0000-000000000001', 3, 'Onboarding Start', 'form_submit', 3891),
  ('c0000000-0000-0000-0000-000000000001', 4, 'First Action', 'button_click', 2156),
  ('c0000000-0000-0000-0000-000000000001', 5, 'Paid Conversion', 'purchase', 892),
  -- Purchase Funnel
  ('c0000000-0000-0000-0000-000000000002', 1, 'Product View', 'page_view', 8432),
  ('c0000000-0000-0000-0000-000000000002', 2, 'Add to Cart', 'button_click', 3217),
  ('c0000000-0000-0000-0000-000000000002', 3, 'Begin Checkout', 'form_submit', 2105),
  ('c0000000-0000-0000-0000-000000000002', 4, 'Payment Info', 'form_submit', 1834),
  ('c0000000-0000-0000-0000-000000000002', 5, 'Order Placed', 'purchase', 1523),
  -- Onboarding Funnel
  ('c0000000-0000-0000-0000-000000000003', 1, 'Account Created', 'signup', 6200),
  ('c0000000-0000-0000-0000-000000000003', 2, 'Profile Setup', 'form_submit', 4980),
  ('c0000000-0000-0000-0000-000000000003', 3, 'First Project', 'button_click', 3450),
  ('c0000000-0000-0000-0000-000000000003', 4, 'Invite Team', 'form_submit', 1890),
  ('c0000000-0000-0000-0000-000000000003', 5, 'First Insight', 'page_view', 1245),
  -- Feature Adoption Funnel
  ('c0000000-0000-0000-0000-000000000004', 1, 'Feature Viewed', 'page_view', 4500),
  ('c0000000-0000-0000-0000-000000000004', 2, 'Feature Clicked', 'click', 2800),
  ('c0000000-0000-0000-0000-000000000004', 3, 'Feature Used', 'button_click', 1950),
  ('c0000000-0000-0000-0000-000000000004', 4, 'Repeated Use', 'button_click', 1200),
  ('c0000000-0000-0000-0000-000000000004', 5, 'Power User', 'api_call', 680);

CREATE INDEX idx_funnel_steps_funnel_id ON funnel_steps(funnel_id);

-- ---------------------------------------------------------------------------
-- 8. Reports
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  format TEXT NOT NULL DEFAULT 'pdf' CHECK (format IN ('pdf', 'csv', 'excel')),
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('ready', 'generating', 'scheduled', 'failed')),
  size_bytes BIGINT DEFAULT 0,
  report_type TEXT NOT NULL DEFAULT 'traffic' CHECK (report_type IN ('traffic', 'users', 'conversion', 'revenue', 'retention', 'performance')),
  created_by UUID REFERENCES users(id),
  generated_at TIMESTAMPTZ,
  schedule TEXT, -- cron expression or null
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO reports (id, title, description, format, status, size_bytes, report_type, created_by, generated_at, schedule, created_at) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Weekly Traffic Summary', 'Aggregated traffic metrics including page views, unique visitors, and session data for the past 7 days', 'pdf', 'ready', 2516582, 'traffic', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days', '0 9 * * MON', NOW() - INTERVAL '60 days'),
  ('d0000000-0000-0000-0000-000000000002', 'Monthly Active Users', 'Detailed breakdown of monthly active users by plan tier, geography, and engagement level', 'pdf', 'ready', 3250585, 'users', 'a0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '5 days', '0 9 1 * *', NOW() - INTERVAL '90 days'),
  ('d0000000-0000-0000-0000-000000000003', 'Conversion Funnel Report', 'Step-by-step conversion analysis for all active funnels with week-over-week comparison', 'pdf', 'ready', 1887436, 'conversion', 'a0000000-0000-0000-0000-000000000019', NOW() - INTERVAL '7 days', NULL, NOW() - INTERVAL '30 days'),
  ('d0000000-0000-0000-0000-000000000004', 'Revenue Analytics', 'Revenue breakdown by plan, cohort, and geography with MRR/ARR tracking', 'excel', 'ready', 5872025, 'revenue', 'a0000000-0000-0000-0000-000000000009', NOW() - INTERVAL '3 days', '0 9 * * MON', NOW() - INTERVAL '120 days'),
  ('d0000000-0000-0000-0000-000000000005', 'User Retention Cohorts', 'Weekly cohort retention analysis showing 12-week retention curves', 'csv', 'ready', 933888, 'retention', 'a0000000-0000-0000-0000-000000000019', NOW() - INTERVAL '7 days', NULL, NOW() - INTERVAL '45 days'),
  ('d0000000-0000-0000-0000-000000000006', 'Top Pages Performance', 'Performance metrics for the top 50 pages including load times, bounce rate, and engagement', 'pdf', 'ready', 1258291, 'performance', 'a0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '1 day', '0 9 * * FRI', NOW() - INTERVAL '75 days'),
  ('d0000000-0000-0000-0000-000000000007', 'Quarterly Business Review', 'Comprehensive quarterly report covering all key metrics and KPIs', 'pdf', 'scheduled', 0, 'traffic', 'a0000000-0000-0000-0000-000000000001', NULL, '0 9 1 1,4,7,10 *', NOW() - INTERVAL '180 days'),
  ('d0000000-0000-0000-0000-000000000008', 'API Usage Report', 'API endpoint usage statistics, error rates, and response time percentiles', 'excel', 'ready', 4194304, 'performance', 'a0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '4 days', NULL, NOW() - INTERVAL '20 days');

CREATE INDEX idx_reports_report_type ON reports(report_type);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_by ON reports(created_by);

-- ---------------------------------------------------------------------------
-- 9. Alert Rules + Alert History
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alert_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  condition_metric TEXT NOT NULL,
  condition_operator TEXT NOT NULL CHECK (condition_operator IN ('gt', 'lt', 'gte', 'lte', 'eq', 'pct_above', 'pct_below')),
  condition_threshold NUMERIC NOT NULL,
  condition_window TEXT NOT NULL DEFAULT '1h',
  severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  notify_email BOOLEAN NOT NULL DEFAULT TRUE,
  notify_slack BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO alert_rules (id, name, description, condition_metric, condition_operator, condition_threshold, condition_window, severity, active, notify_email, notify_slack, created_by, last_triggered_at, created_at) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'Traffic Spike', 'Alert when page views exceed 150% of the hourly average', 'page_views', 'pct_above', 150, '1h', 'warning', true, true, true, 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day', NOW() - INTERVAL '60 days'),
  ('e0000000-0000-0000-0000-000000000002', 'Error Rate Threshold', 'Alert when error event rate exceeds 5% of total events', 'error_rate', 'gt', 5, '15m', 'critical', true, true, true, 'a0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '2 days', NOW() - INTERVAL '45 days'),
  ('e0000000-0000-0000-0000-000000000003', 'Low Conversion Rate', 'Alert when signup conversion drops below 2%', 'conversion_rate', 'lt', 2, '24h', 'warning', true, true, false, 'a0000000-0000-0000-0000-000000000019', NOW() - INTERVAL '6 days', NOW() - INTERVAL '30 days'),
  ('e0000000-0000-0000-0000-000000000004', 'Revenue Drop', 'Alert when daily revenue drops more than 20% below average', 'daily_revenue', 'pct_below', 20, '24h', 'critical', true, true, true, 'a0000000-0000-0000-0000-000000000009', NOW() - INTERVAL '4 days', NOW() - INTERVAL '90 days'),
  ('e0000000-0000-0000-0000-000000000005', 'New User Surge', 'Alert when new signups exceed 200% of daily average', 'new_signups', 'pct_above', 200, '24h', 'info', true, false, false, 'a0000000-0000-0000-0000-000000000003', NULL, NOW() - INTERVAL '20 days'),
  ('e0000000-0000-0000-0000-000000000006', 'Session Duration Drop', 'Alert when average session duration falls below 30 seconds', 'avg_session_duration', 'lt', 30, '1h', 'warning', false, true, false, 'a0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '10 days', NOW() - INTERVAL '15 days'),
  ('e0000000-0000-0000-0000-000000000007', 'API Latency', 'Alert when p95 API response time exceeds 2000ms', 'api_p95_latency', 'gt', 2000, '5m', 'critical', true, true, true, 'a0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '3 days', NOW() - INTERVAL '40 days');

CREATE TABLE IF NOT EXISTS alert_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_rule_id UUID NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  metric_value NUMERIC NOT NULL,
  threshold_value NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'triggered' CHECK (status IN ('triggered', 'acknowledged', 'resolved')),
  notes TEXT
);

-- Generate alert history
INSERT INTO alert_history (alert_rule_id, triggered_at, resolved_at, metric_value, threshold_value, status, notes)
SELECT
  rule_id,
  ts,
  ts + ((5 + (ROW_NUMBER() OVER () * 13 % 60)) || ' minutes')::INTERVAL,
  threshold + (threshold * (0.1 + (ROW_NUMBER() OVER () * 0.05))),
  threshold,
  CASE WHEN ROW_NUMBER() OVER () % 3 = 0 THEN 'acknowledged' ELSE 'resolved' END,
  NULL
FROM (
  VALUES
    ('e0000000-0000-0000-0000-000000000001'::UUID, NOW() - INTERVAL '1 day', 150::NUMERIC),
    ('e0000000-0000-0000-0000-000000000001'::UUID, NOW() - INTERVAL '5 days', 150::NUMERIC),
    ('e0000000-0000-0000-0000-000000000001'::UUID, NOW() - INTERVAL '12 days', 150::NUMERIC),
    ('e0000000-0000-0000-0000-000000000002'::UUID, NOW() - INTERVAL '2 days', 5::NUMERIC),
    ('e0000000-0000-0000-0000-000000000002'::UUID, NOW() - INTERVAL '8 days', 5::NUMERIC),
    ('e0000000-0000-0000-0000-000000000003'::UUID, NOW() - INTERVAL '6 days', 2::NUMERIC),
    ('e0000000-0000-0000-0000-000000000004'::UUID, NOW() - INTERVAL '4 days', 20::NUMERIC),
    ('e0000000-0000-0000-0000-000000000004'::UUID, NOW() - INTERVAL '15 days', 20::NUMERIC),
    ('e0000000-0000-0000-0000-000000000006'::UUID, NOW() - INTERVAL '10 days', 30::NUMERIC),
    ('e0000000-0000-0000-0000-000000000007'::UUID, NOW() - INTERVAL '3 days', 2000::NUMERIC),
    ('e0000000-0000-0000-0000-000000000007'::UUID, NOW() - INTERVAL '9 days', 2000::NUMERIC),
    ('e0000000-0000-0000-0000-000000000007'::UUID, NOW() - INTERVAL '20 days', 2000::NUMERIC)
) AS v(rule_id, ts, threshold);

CREATE INDEX idx_alert_history_rule_id ON alert_history(alert_rule_id);
CREATE INDEX idx_alert_history_triggered_at ON alert_history(triggered_at);

-- ---------------------------------------------------------------------------
-- 10. Files (same as shared fleet)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT DEFAULT 0,
  is_folder BOOLEAN NOT NULL DEFAULT FALSE,
  parent_id UUID REFERENCES files(id),
  created_by UUID REFERENCES users(id),
  trashed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Top-level folders
INSERT INTO files (id, name, is_folder, created_by, created_at) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Documents', TRUE, 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '300 days'),
  ('f0000000-0000-0000-0000-000000000002', 'Images', TRUE, 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '300 days'),
  ('f0000000-0000-0000-0000-000000000003', 'Reports', TRUE, 'a0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '250 days'),
  ('f0000000-0000-0000-0000-000000000004', 'Designs', TRUE, 'a0000000-0000-0000-0000-000000000023', NOW() - INTERVAL '200 days'),
  ('f0000000-0000-0000-0000-000000000005', 'Exports', TRUE, 'a0000000-0000-0000-0000-000000000009', NOW() - INTERVAL '150 days');

-- Sub-folders
INSERT INTO files (id, name, is_folder, parent_id, created_by, created_at) VALUES
  ('f0000000-0000-0000-0000-000000000006', 'Contracts', TRUE, 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '290 days'),
  ('f0000000-0000-0000-0000-000000000007', 'Proposals', TRUE, 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '280 days'),
  ('f0000000-0000-0000-0000-000000000008', 'Logos', TRUE, 'f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000023', NOW() - INTERVAL '270 days'),
  ('f0000000-0000-0000-0000-000000000009', 'Screenshots', TRUE, 'f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', NOW() - INTERVAL '260 days'),
  ('f0000000-0000-0000-0000-000000000010', 'Q4 2024', TRUE, 'f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000009', NOW() - INTERVAL '120 days'),
  ('f0000000-0000-0000-0000-000000000011', 'Q1 2025', TRUE, 'f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000009', NOW() - INTERVAL '60 days'),
  ('f0000000-0000-0000-0000-000000000012', 'Mockups', TRUE, 'f0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000023', NOW() - INTERVAL '180 days');

-- Files in folders (same as shared fleet seed)
INSERT INTO files (name, mime_type, size_bytes, parent_id, created_by, created_at) VALUES
  ('Master Services Agreement - Acme Corp.pdf', 'application/pdf', 245760, 'f0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '280 days'),
  ('NDA - CloudPeak.pdf', 'application/pdf', 128000, 'f0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '270 days'),
  ('SLA Template v2.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 89600, 'f0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '250 days'),
  ('Vendor Agreement - TechDistro.pdf', 'application/pdf', 198400, 'f0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '200 days'),
  ('Employee Handbook 2025.pdf', 'application/pdf', 512000, 'f0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000015', NOW() - INTERVAL '30 days'),
  ('Q4 Product Roadmap Proposal.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 3145728, 'f0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '120 days'),
  ('Budget Proposal FY2025.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 156672, 'f0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000009', NOW() - INTERVAL '90 days'),
  ('Partnership Proposal - VelocityAI.pdf', 'application/pdf', 287744, 'f0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000019', NOW() - INTERVAL '60 days'),
  ('Infrastructure Upgrade Proposal.pdf', 'application/pdf', 445440, 'f0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000026', NOW() - INTERVAL '45 days'),
  ('logo-primary.svg', 'image/svg+xml', 4096, 'f0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000023', NOW() - INTERVAL '260 days'),
  ('logo-dark.svg', 'image/svg+xml', 4352, 'f0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000023', NOW() - INTERVAL '260 days'),
  ('logo-icon-only.png', 'image/png', 24576, 'f0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000023', NOW() - INTERVAL '258 days'),
  ('favicon.ico', 'image/x-icon', 1024, 'f0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000023', NOW() - INTERVAL '258 days'),
  ('og-image.png', 'image/png', 307200, 'f0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000024', NOW() - INTERVAL '180 days'),
  ('dashboard-v2-dark.png', 'image/png', 1048576, 'f0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000005', NOW() - INTERVAL '45 days'),
  ('onboarding-step3-bug.png', 'image/png', 524288, 'f0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000007', NOW() - INTERVAL '20 days'),
  ('mobile-nav-collapsed.png', 'image/png', 389120, 'f0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000017', NOW() - INTERVAL '15 days'),
  ('settings-new-layout.png', 'image/png', 716800, 'f0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000005', NOW() - INTERVAL '10 days'),
  ('Q4-2024-Revenue-Report.pdf', 'application/pdf', 892928, 'f0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000009', NOW() - INTERVAL '100 days'),
  ('Customer-Churn-Analysis-Oct.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 234496, 'f0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000019', NOW() - INTERVAL '95 days'),
  ('NPS-Survey-Results-Q4.pdf', 'application/pdf', 456704, 'f0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '85 days'),
  ('Engineering-Velocity-Report.pdf', 'application/pdf', 345088, 'f0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '80 days'),
  ('Q1-2025-OKR-Progress.pdf', 'application/pdf', 567296, 'f0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000009', NOW() - INTERVAL '50 days'),
  ('Monthly-Active-Users-Jan.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 178176, 'f0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000019', NOW() - INTERVAL '40 days'),
  ('Infrastructure-Cost-Report-Feb.pdf', 'application/pdf', 623616, 'f0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000026', NOW() - INTERVAL '25 days'),
  ('dashboard-redesign-v3.fig', 'application/octet-stream', 8388608, 'f0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000023', NOW() - INTERVAL '170 days'),
  ('mobile-app-screens.fig', 'application/octet-stream', 12582912, 'f0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000023', NOW() - INTERVAL '130 days'),
  ('icon-set-v2.svg', 'image/svg+xml', 65536, 'f0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000024', NOW() - INTERVAL '100 days'),
  ('email-template-designs.fig', 'application/octet-stream', 4194304, 'f0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000023', NOW() - INTERVAL '70 days'),
  ('component-library-specs.pdf', 'application/pdf', 2097152, 'f0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000024', NOW() - INTERVAL '40 days'),
  ('users-export-2025-01-15.csv', 'text/csv', 45056, 'f0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000009', NOW() - INTERVAL '40 days'),
  ('events-export-2025-01-20.csv', 'text/csv', 2097152, 'f0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000019', NOW() - INTERVAL '35 days'),
  ('invoices-2024-annual.pdf', 'application/pdf', 1572864, 'f0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000029', NOW() - INTERVAL '55 days'),
  ('audit-log-export-feb-2025.json', 'application/json', 892928, 'f0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '20 days'),
  ('Company Overview 2025.pdf', 'application/pdf', 3670016, NULL, 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '60 days'),
  ('Quick Start Guide.pdf', 'application/pdf', 1048576, NULL, 'a0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '200 days'),
  ('team-photo-offsite-2024.jpg', 'image/jpeg', 5242880, NULL, 'a0000000-0000-0000-0000-000000000015', NOW() - INTERVAL '150 days'),
  ('product-demo-recording.mp4', 'video/mp4', 52428800, NULL, 'a0000000-0000-0000-0000-000000000019', NOW() - INTERVAL '30 days'),
  ('release-notes-v4.2.md', 'text/markdown', 8192, NULL, 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '10 days');

-- Generate more files
INSERT INTO files (name, mime_type, size_bytes, parent_id, created_by, created_at)
SELECT
  'file-' || n || '.' || (ARRAY['pdf', 'xlsx', 'docx', 'png', 'csv', 'json', 'txt', 'svg'])[1 + (n % 8)] AS name,
  (ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'text/csv', 'application/json', 'text/plain', 'image/svg+xml'])[1 + (n % 8)] AS mime_type,
  (n * 10240 % 5242880) + 1024 AS size_bytes,
  (ARRAY['f0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000005'])[(1 + (n % 5))]::UUID AS parent_id,
  ('a0000000-0000-0000-0000-' || LPAD((1 + (n % 30))::TEXT, 12, '0'))::UUID AS created_by,
  NOW() - ((n * 3) || ' days')::INTERVAL AS created_at
FROM generate_series(1, 30) AS n;

UPDATE files SET trashed = TRUE WHERE name IN ('file-3.docx', 'file-7.txt', 'file-12.csv');

CREATE INDEX idx_files_parent_id ON files(parent_id);
CREATE INDEX idx_files_created_by ON files(created_by);
CREATE INDEX idx_files_trashed ON files(trashed);

-- ---------------------------------------------------------------------------
-- 11. Workspace Settings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workspace_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'Acme Analytics',
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  date_format TEXT NOT NULL DEFAULT 'MMM d, yyyy',
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO workspace_settings (name, timezone, date_format) VALUES
  ('Acme Analytics', 'America/New_York', 'MMM d, yyyy');

-- ---------------------------------------------------------------------------
-- 12. Notification Preferences (per user)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  slack_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  weekly_digest BOOLEAN NOT NULL DEFAULT TRUE,
  alert_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  marketing BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed for the first few users
INSERT INTO notification_preferences (user_id, email_enabled, slack_enabled, weekly_digest, alert_notifications, marketing) VALUES
  ('a0000000-0000-0000-0000-000000000001', true, true, true, true, false),
  ('a0000000-0000-0000-0000-000000000002', true, false, true, true, false),
  ('a0000000-0000-0000-0000-000000000003', true, true, false, true, true),
  ('a0000000-0000-0000-0000-000000000009', true, false, true, true, false),
  ('a0000000-0000-0000-0000-000000000019', true, true, true, false, false);

-- ---------------------------------------------------------------------------
-- 13. API Keys
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL, -- first 8 chars for display
  created_by UUID REFERENCES users(id),
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO api_keys (id, name, key_hash, key_prefix, created_by, last_used_at, created_at) VALUES
  ('aa000000-0000-0000-0000-000000000001', 'Production Key', 'sha256_placeholder_prod_key_hash', 'ak_prod_', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '160 days'),
  ('aa000000-0000-0000-0000-000000000002', 'Development Key', 'sha256_placeholder_dev_key_hash', 'ak_dev_x', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day', NOW() - INTERVAL '95 days'),
  ('aa000000-0000-0000-0000-000000000003', 'CI/CD Pipeline', 'sha256_placeholder_ci_key_hash', 'ak_ci_ab', 'a0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '45 days');

-- ---------------------------------------------------------------------------
-- 14. Billing
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS billing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan TEXT NOT NULL DEFAULT 'pro' CHECK (plan IN ('free', 'pro', 'enterprise')),
  monthly_amount INTEGER NOT NULL DEFAULT 0, -- cents
  usage_events INTEGER NOT NULL DEFAULT 0,
  usage_limit INTEGER NOT NULL DEFAULT 100000,
  next_billing_date DATE NOT NULL DEFAULT CURRENT_DATE + INTERVAL '30 days',
  payment_method_type TEXT,
  payment_method_last4 TEXT,
  payment_method_expires TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO billing (plan, monthly_amount, usage_events, usage_limit, next_billing_date, payment_method_type, payment_method_last4, payment_method_expires) VALUES
  ('pro', 4900, 67432, 100000, CURRENT_DATE + INTERVAL '18 days', 'visa', '4242', '12/2027');

-- ---------------------------------------------------------------------------
-- Done
-- ---------------------------------------------------------------------------
