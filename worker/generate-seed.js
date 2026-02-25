#!/usr/bin/env node
// =============================================================================
// generate-seed.js — Generates flat SQL seed data for Acme Analytics (D1)
// Replaces recursive CTEs with pre-computed INSERT statements.
// Usage:  node generate-seed.js > seed-flat.sql
// =============================================================================

'use strict';

const BATCH_SIZE = 50;
const lines = [];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function esc(s) {
  if (s === null || s === undefined) return 'NULL';
  return "'" + String(s).replace(/'/g, "''") + "'";
}

function pad(n, width) {
  return String(n).padStart(width, '0');
}

function uuid(prefix, n) {
  return `${prefix}-0000-0000-0000-${pad(n, 12)}`;
}

function batchInsert(table, cols, rows, batchSize) {
  batchSize = batchSize || BATCH_SIZE;
  const colList = cols.join(', ');
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const values = chunk.map(function(r) { return '  (' + r.join(', ') + ')'; }).join(',\n');
    lines.push('INSERT INTO ' + table + ' (' + colList + ') VALUES\n' + values + ';');
    lines.push('');
  }
}

function emit(s) {
  lines.push(s);
}

// ---------------------------------------------------------------------------
// Lookup arrays — same as original seed's CTE value-lists
// ---------------------------------------------------------------------------

var firstNames = [
  'Alex','Jordan','Taylor','Morgan','Casey','Riley','Quinn','Avery','Cameron','Dakota',
  'Parker','Reese','Skyler','Logan','Finley','Harper','Emerson','Rowan','Sage','Blake',
  'Drew','Jamie','Kendall','Hayden','Charlie','Ellis','Frankie','Jules','Kai','Lee',
  'Max','Nico','Pat','Remy','Sam','Terry','Val','Winter','Yael','Zephyr'
];

var lastNames = [
  'Smith','Jones','Davis','Miller','Wilson','Moore','Taylor','Anderson','Thomas','Jackson',
  'White','Harris','Martin','Thompson','Garcia','Martinez','Robinson','Clark','Rodriguez','Lewis',
  'Lee','Walker','Hall','Allen','Young','Hernandez','King','Wright','Lopez','Hill',
  'Scott','Green','Adams','Baker','Nelson','Carter','Mitchell','Perez','Roberts','Turner'
];

var domains = [
  'acmecorp.com','techstart.io','dataflow.co','nexgen.dev','cloudpeak.io',
  'velocityai.com','pixelcraft.design','quantumleap.tech','streamline.app','forgelab.com'
];

var rolesArr = ['member','member','member','member','viewer'];
var plansArr = ['free','free','pro','pro','enterprise'];

var entryPages = ['/','/dashboard','/pricing','/docs','/blog','/sign-in','/dashboard/events','/dashboard/users'];
var exitPages = ['/dashboard','/dashboard/settings','/pricing','/sign-up','/dashboard/reports','/dashboard/files','/','/docs'];
var referrers = ['https://google.com','https://google.com','https://google.com','direct','direct',
                 'https://github.com','https://twitter.com','https://linkedin.com',
                 'https://news.ycombinator.com','https://reddit.com'];
var devicesArr = ['desktop','desktop','desktop','mobile','tablet'];
var browsersArr = ['Chrome','Chrome','Chrome','Firefox','Safari','Edge'];
var osesArr = ['macOS','Windows','Windows','Linux','iOS','Android'];
var countriesArr = ['US','US','US','UK','DE','FR','CA','AU','JP','BR','IN','NL'];
var citiesArr = ['San Francisco','New York','London','Berlin','Paris','Toronto','Sydney','Tokyo',
                'Sao Paulo','Mumbai','Amsterdam','Seattle','Austin','Chicago','Boston'];

var eventNames = ['page_view','page_view','page_view','page_view','click','click','signup','purchase',
                  'form_submit','search','file_download','button_click','modal_open','tab_switch',
                  'scroll_depth','video_play','error','api_call','export'];
var pageUrls = ['/dashboard','/dashboard/events','/dashboard/users','/dashboard/funnels',
                '/dashboard/reports','/dashboard/settings','/dashboard/alerts','/pricing',
                '/','/about','/docs','/blog','/docs/api','/dashboard/users/profile',
                '/dashboard/files','/sign-in','/sign-up','/dashboard/settings/billing','/dashboard/settings/team'];
var sources = ['direct','google','github','twitter','linkedin','referral','email','ads','producthunt'];
var evtDevices = ['desktop','desktop','desktop','mobile','tablet'];
var evtBrowsers = ['Chrome','Chrome','Firefox','Safari','Edge'];
var evtOses = ['macOS','Windows','Linux','iOS','Android'];
var evtCountries = ['US','US','US','UK','DE','FR','CA','AU','JP','BR'];
var viewports = [1920,1440,1366,1280,768,375,414,390];

var titlePrefixes = [
  'Update dependencies for','Fix layout issue in','Add loading state to',
  'Refactor','Write tests for','Optimize rendering of',
  'Add error handling to','Fix accessibility in','Implement caching for',
  'Add validation to','Fix race condition in','Update styles for',
  'Remove deprecated code from','Add logging to','Fix type errors in'
];
var titleSuffixes = [
  'user profile section','settings page','dashboard widget','navigation component',
  'search functionality','data export feature','notification system','billing module',
  'file upload handler','chart component','table pagination','modal dialog',
  'form validation','authentication flow','API client layer','webhook handler',
  'email templates','report generator','user permissions','caching layer'
];
var statusesArr = ['backlog','in_progress','review','done'];
var prioritiesArr = ['P0','P1','P2','P3'];
var labelValues = ['bug','feature','tech-debt','docs','testing','performance','security','infrastructure'];

var pagesList = [
  { idx: 0, path: '/dashboard', title: 'Dashboard' },
  { idx: 1, path: '/dashboard/events', title: 'Events Explorer' },
  { idx: 2, path: '/dashboard/users', title: 'Users' },
  { idx: 3, path: '/dashboard/funnels', title: 'Funnel Analysis' },
  { idx: 4, path: '/dashboard/reports', title: 'Reports' },
  { idx: 5, path: '/dashboard/settings', title: 'Settings' },
  { idx: 6, path: '/dashboard/alerts', title: 'Alert Rules' },
  { idx: 7, path: '/dashboard/files', title: 'File Manager' },
  { idx: 8, path: '/', title: 'Home' },
  { idx: 9, path: '/pricing', title: 'Pricing' },
  { idx: 10, path: '/docs', title: 'Documentation' },
  { idx: 11, path: '/blog', title: 'Blog' },
  { idx: 12, path: '/about', title: 'About Us' },
  { idx: 13, path: '/sign-in', title: 'Sign In' },
  { idx: 14, path: '/sign-up', title: 'Sign Up' },
];

var extensions = ['pdf','xlsx','docx','png','csv','json','txt','svg'];
var mimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png','text/csv','application/json','text/plain','image/svg+xml'
];
var parentFolders = [
  'f0000000-0000-0000-0000-000000000001',
  'f0000000-0000-0000-0000-000000000002',
  'f0000000-0000-0000-0000-000000000003',
  'f0000000-0000-0000-0000-000000000004',
  'f0000000-0000-0000-0000-000000000005',
];

// =============================================================================
// BUILD OUTPUT
// =============================================================================

emit('-- =============================================================================');
emit('-- Acme Analytics — Dedicated Database Schema + Seed Data (FLAT, no CTEs)');
emit('-- Auto-generated by generate-seed.js — all INSERTs are pre-computed');
emit('-- SQLite / Cloudflare D1, TEXT primary keys (UUIDs), realistic data');
emit('-- =============================================================================');
emit('');

// ---------------------------------------------------------------------------
// 1. Users (100 rows)
// ---------------------------------------------------------------------------
emit('-- ---------------------------------------------------------------------------');
emit('-- 1. Users (100 rows) — copied from shared fleet, same UUIDs');
emit('-- ---------------------------------------------------------------------------');
emit('CREATE TABLE IF NOT EXISTS users (');
emit('  id TEXT PRIMARY KEY,');
emit('  email TEXT UNIQUE NOT NULL,');
emit('  name TEXT NOT NULL,');
emit('  avatar_url TEXT,');
emit("  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),");
emit("  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('enterprise', 'pro', 'free')),");
emit('  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,');
emit('  last_seen TEXT');
emit(');');
emit('');

// First 30 handcrafted users — exactly as original
var handcraftedUsers = [
  ['a0000000-0000-0000-0000-000000000001','sarah.chen@acmecorp.com','Sarah Chen','https://api.dicebear.com/7.x/avataaars/svg?seed=sarah','admin','enterprise','-340 days','-1 hours'],
  ['a0000000-0000-0000-0000-000000000002','james.wilson@acmecorp.com','James Wilson','https://api.dicebear.com/7.x/avataaars/svg?seed=james','admin','enterprise','-335 days','-3 hours'],
  ['a0000000-0000-0000-0000-000000000003','maria.garcia@acmecorp.com','Maria Garcia','https://api.dicebear.com/7.x/avataaars/svg?seed=maria','admin','enterprise','-320 days','-2 hours'],
  ['a0000000-0000-0000-0000-000000000004','david.kim@acmecorp.com','David Kim','https://api.dicebear.com/7.x/avataaars/svg?seed=david','member','pro','-310 days','-5 hours'],
  ['a0000000-0000-0000-0000-000000000005','emily.johnson@acmecorp.com','Emily Johnson','https://api.dicebear.com/7.x/avataaars/svg?seed=emily','member','pro','-300 days','-1 days'],
  ['a0000000-0000-0000-0000-000000000006','michael.brown@techstart.io','Michael Brown','https://api.dicebear.com/7.x/avataaars/svg?seed=michael','admin','pro','-290 days','-4 hours'],
  ['a0000000-0000-0000-0000-000000000007','jessica.martinez@techstart.io','Jessica Martinez','https://api.dicebear.com/7.x/avataaars/svg?seed=jessica','member','pro','-285 days','-6 hours'],
  ['a0000000-0000-0000-0000-000000000008','robert.taylor@techstart.io','Robert Taylor','https://api.dicebear.com/7.x/avataaars/svg?seed=robert','viewer','free','-275 days','-2 days'],
  ['a0000000-0000-0000-0000-000000000009','lisa.anderson@dataflow.co','Lisa Anderson','https://api.dicebear.com/7.x/avataaars/svg?seed=lisa','admin','enterprise','-265 days','-30 minutes'],
  ['a0000000-0000-0000-0000-000000000010','daniel.thomas@dataflow.co','Daniel Thomas','https://api.dicebear.com/7.x/avataaars/svg?seed=daniel','member','pro','-260 days','-8 hours'],
  ['a0000000-0000-0000-0000-000000000011','amanda.jackson@dataflow.co','Amanda Jackson','https://api.dicebear.com/7.x/avataaars/svg?seed=amanda','viewer','free','-250 days','-3 days'],
  ['a0000000-0000-0000-0000-000000000012','christopher.white@nexgen.dev','Christopher White','https://api.dicebear.com/7.x/avataaars/svg?seed=christopher','member','pro','-245 days','-12 hours'],
  ['a0000000-0000-0000-0000-000000000013','stephanie.harris@nexgen.dev','Stephanie Harris','https://api.dicebear.com/7.x/avataaars/svg?seed=stephanie','viewer','free','-240 days','-1 days'],
  ['a0000000-0000-0000-0000-000000000014','matthew.martin@nexgen.dev','Matthew Martin','https://api.dicebear.com/7.x/avataaars/svg?seed=matthew','member','pro','-230 days','-5 hours'],
  ['a0000000-0000-0000-0000-000000000015','jennifer.thompson@cloudpeak.io','Jennifer Thompson','https://api.dicebear.com/7.x/avataaars/svg?seed=jennifer','admin','enterprise','-225 days','-2 hours'],
  ['a0000000-0000-0000-0000-000000000016','kevin.garcia@cloudpeak.io','Kevin Garcia','https://api.dicebear.com/7.x/avataaars/svg?seed=kevin','member','enterprise','-220 days','-45 minutes'],
  ['a0000000-0000-0000-0000-000000000017','rachel.martinez@cloudpeak.io','Rachel Martinez','https://api.dicebear.com/7.x/avataaars/svg?seed=rachel','member','pro','-210 days','-7 hours'],
  ['a0000000-0000-0000-0000-000000000018','andrew.robinson@cloudpeak.io','Andrew Robinson','https://api.dicebear.com/7.x/avataaars/svg?seed=andrew','viewer','free','-200 days','-4 days'],
  ['a0000000-0000-0000-0000-000000000019','nicole.clark@velocityai.com','Nicole Clark','https://api.dicebear.com/7.x/avataaars/svg?seed=nicole','admin','pro','-195 days','-1 hours'],
  ['a0000000-0000-0000-0000-000000000020','joshua.rodriguez@velocityai.com','Joshua Rodriguez','https://api.dicebear.com/7.x/avataaars/svg?seed=joshua','member','pro','-190 days','-3 hours'],
  ['a0000000-0000-0000-0000-000000000021','megan.lewis@velocityai.com','Megan Lewis','https://api.dicebear.com/7.x/avataaars/svg?seed=megan','viewer','free','-185 days','-2 days'],
  ['a0000000-0000-0000-0000-000000000022','brandon.lee@velocityai.com','Brandon Lee','https://api.dicebear.com/7.x/avataaars/svg?seed=brandon','member','pro','-180 days','-6 hours'],
  ['a0000000-0000-0000-0000-000000000023','ashley.walker@pixelcraft.design','Ashley Walker','https://api.dicebear.com/7.x/avataaars/svg?seed=ashley','admin','enterprise','-175 days','-20 minutes'],
  ['a0000000-0000-0000-0000-000000000024','tyler.hall@pixelcraft.design','Tyler Hall','https://api.dicebear.com/7.x/avataaars/svg?seed=tyler','member','pro','-170 days','-9 hours'],
  ['a0000000-0000-0000-0000-000000000025','samantha.allen@pixelcraft.design','Samantha Allen','https://api.dicebear.com/7.x/avataaars/svg?seed=samantha','viewer','free','-165 days','-1 days'],
  ['a0000000-0000-0000-0000-000000000026','ryan.young@quantumleap.tech','Ryan Young','https://api.dicebear.com/7.x/avataaars/svg?seed=ryan','member','enterprise','-160 days','-3 hours'],
  ['a0000000-0000-0000-0000-000000000027','lauren.hernandez@quantumleap.tech','Lauren Hernandez','https://api.dicebear.com/7.x/avataaars/svg?seed=lauren','member','pro','-155 days','-5 hours'],
  ['a0000000-0000-0000-0000-000000000028','jason.king@quantumleap.tech','Jason King','https://api.dicebear.com/7.x/avataaars/svg?seed=jason','viewer','free','-150 days','-2 days'],
  ['a0000000-0000-0000-0000-000000000029','brittany.wright@streamline.app','Brittany Wright','https://api.dicebear.com/7.x/avataaars/svg?seed=brittany','admin','pro','-145 days','-1 hours'],
  ['a0000000-0000-0000-0000-000000000030','justin.lopez@streamline.app','Justin Lopez','https://api.dicebear.com/7.x/avataaars/svg?seed=justin','member','pro','-140 days','-4 hours'],
];

(function() {
  var cols = ['id','email','name','avatar_url','role','plan','created_at','last_seen'];
  var rows = handcraftedUsers.map(function(u) {
    return [
      esc(u[0]), esc(u[1]), esc(u[2]), esc(u[3]), esc(u[4]), esc(u[5]),
      "datetime('now', '" + u[6] + "')",
      "datetime('now', '" + u[7] + "')"
    ];
  });
  batchInsert('users', cols, rows);
})();

// Generate remaining 70 users (31-100)
(function() {
  var cols = ['id','email','name','avatar_url','role','plan','created_at','last_seen'];
  var rows = [];
  for (var n = 31; n <= 100; n++) {
    var fn = firstNames[n % 40];
    var ln = lastNames[(n * 7) % 40];
    var domain = domains[n % 10];
    var role = rolesArr[n % 5];
    var plan = plansArr[n % 5];
    var createdDays = (n * 3) + 30;
    var lastSeenDays = n % 30;
    var lastSeenHours = (n * 37) % 24;
    rows.push([
      esc(uuid('a0000000', n)),
      esc('user' + n + '@' + domain),
      esc(fn + ' ' + ln),
      esc('https://api.dicebear.com/7.x/avataaars/svg?seed=user' + n),
      esc(role),
      esc(plan),
      "datetime('now', '-" + createdDays + " days')",
      "datetime('now', '-" + lastSeenDays + " days', '-" + lastSeenHours + " hours')"
    ]);
  }
  batchInsert('users', cols, rows);
})();

emit('CREATE INDEX idx_users_email ON users(email);');
emit('CREATE INDEX idx_users_role ON users(role);');
emit('CREATE INDEX idx_users_plan ON users(plan);');
emit('CREATE INDEX idx_users_created_at ON users(created_at);');
emit('');

// ---------------------------------------------------------------------------
// 2. Projects (12 rows)
// ---------------------------------------------------------------------------
emit('-- ---------------------------------------------------------------------------');
emit('-- 2. Projects (12 rows) — same as shared fleet');
emit('-- ---------------------------------------------------------------------------');
emit('CREATE TABLE IF NOT EXISTS projects (');
emit('  id TEXT PRIMARY KEY,');
emit('  name TEXT NOT NULL,');
emit('  description TEXT,');
emit("  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'planning')),");
emit('  owner_id TEXT REFERENCES users(id),');
emit('  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,');
emit('  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP');
emit(');');
emit('');

(function() {
  var data = [
    ['b0000000-0000-0000-0000-000000000001','Website Redesign','Complete overhaul of the marketing website with new brand guidelines','active','a0000000-0000-0000-0000-000000000001','-180 days','-2 hours'],
    ['b0000000-0000-0000-0000-000000000002','API Migration v3','Migrate all REST endpoints to v3 with breaking changes','active','a0000000-0000-0000-0000-000000000002','-150 days','-1 days'],
    ['b0000000-0000-0000-0000-000000000003','Mobile App Launch','React Native app for iOS and Android','active','a0000000-0000-0000-0000-000000000003','-120 days','-3 hours'],
    ['b0000000-0000-0000-0000-000000000004','Data Pipeline Refactor','Replace Airflow with Dagster for ETL pipelines','active','a0000000-0000-0000-0000-000000000009','-90 days','-5 hours'],
    ['b0000000-0000-0000-0000-000000000005','Customer Portal','Self-service portal for enterprise customers','active','a0000000-0000-0000-0000-000000000015','-200 days','-12 hours'],
    ['b0000000-0000-0000-0000-000000000006','Auth System Upgrade','Migrate from custom JWT to Clerk','active','a0000000-0000-0000-0000-000000000006','-60 days','-6 hours'],
    ['b0000000-0000-0000-0000-000000000007','Analytics Dashboard','Internal analytics dashboard for product team','active','a0000000-0000-0000-0000-000000000019','-45 days','-1 hours'],
    ['b0000000-0000-0000-0000-000000000008','Design System v2','Unified component library across all products','planning','a0000000-0000-0000-0000-000000000023','-30 days','-2 days'],
    ['b0000000-0000-0000-0000-000000000009','Performance Audit','Lighthouse scores below 60 on key pages, need to fix','active','a0000000-0000-0000-0000-000000000004','-25 days','-4 hours'],
    ['b0000000-0000-0000-0000-000000000010','Billing Integration','Stripe billing with usage-based pricing','archived','a0000000-0000-0000-0000-000000000029','-300 days','-45 days'],
    ['b0000000-0000-0000-0000-000000000011','Search Infrastructure','Replace Elasticsearch with Typesense','planning','a0000000-0000-0000-0000-000000000012','-15 days','-3 days'],
    ['b0000000-0000-0000-0000-000000000012','Internationalization','Add i18n support for EU market expansion','active','a0000000-0000-0000-0000-000000000026','-40 days','-8 hours'],
  ];
  var cols = ['id','name','description','status','owner_id','created_at','updated_at'];
  var rows = data.map(function(p) {
    return [
      esc(p[0]), esc(p[1]), esc(p[2]), esc(p[3]), esc(p[4]),
      "datetime('now', '" + p[5] + "')", "datetime('now', '" + p[6] + "')"
    ];
  });
  batchInsert('projects', cols, rows);
})();

emit('CREATE INDEX idx_projects_owner_id ON projects(owner_id);');
emit('CREATE INDEX idx_projects_status ON projects(status);');
emit('');

// ---------------------------------------------------------------------------
// 3. Tasks (200 rows)
// ---------------------------------------------------------------------------
emit('-- ---------------------------------------------------------------------------');
emit('-- 3. Tasks (200 rows) — same as shared fleet');
emit('-- ---------------------------------------------------------------------------');
emit('CREATE TABLE IF NOT EXISTS tasks (');
emit('  id TEXT PRIMARY KEY,');
emit('  title TEXT NOT NULL,');
emit('  description TEXT,');
emit("  status TEXT NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'in_progress', 'review', 'done')),");
emit("  priority TEXT NOT NULL DEFAULT 'P2' CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),");
emit('  project_id TEXT REFERENCES projects(id),');
emit('  assignee_id TEXT REFERENCES users(id),');
emit("  labels TEXT DEFAULT '[]',");
emit('  due_date TEXT,');
emit('  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,');
emit('  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP');
emit(');');
emit('');

// First 10 hand-crafted tasks
(function() {
  var data = [
    ['t0000000-0000-0000-0000-000000000001','Fix login redirect bug on Safari','Users on Safari 17 get stuck in a redirect loop after OAuth callback','in_progress','P0','b0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000002','["bug","auth"]','+3 days','-5 days'],
    ['t0000000-0000-0000-0000-000000000002','Add rate limiting to /api/events endpoint','We are seeing abuse from scrapers hitting analytics events','review','P1','b0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000010','["security","api"]','+7 days','-10 days'],
    ['t0000000-0000-0000-0000-000000000003','Implement dark mode toggle','Use next-themes, persist preference in localStorage','done','P2','b0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000005','["feature","ui"]','-5 days','-30 days'],
    ['t0000000-0000-0000-0000-000000000004','Upgrade Next.js to 14.2','Need the new caching improvements for ISR pages','in_progress','P1','b0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','["infrastructure","upgrade"]','+14 days','-7 days'],
    ['t0000000-0000-0000-0000-000000000005','Fix memory leak in WebSocket reconnect logic','Connection objects are not being cleaned up after disconnect','in_progress','P0','b0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000020','["bug","performance"]','+2 days','-3 days'],
    ['t0000000-0000-0000-0000-000000000006','Design new onboarding flow wireframes','Need Figma mockups for the 5-step onboarding wizard','done','P2','b0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000023','["design","ux"]','-10 days','-45 days'],
    ['t0000000-0000-0000-0000-000000000007','Write API documentation for v3 endpoints','OpenAPI spec + interactive docs with Swagger UI','in_progress','P2','b0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000014','["docs","api"]','+21 days','-14 days'],
    ['t0000000-0000-0000-0000-000000000008','Set up Sentry error tracking','Configure source maps upload in CI pipeline','done','P1','b0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000004','["infrastructure","monitoring"]','-20 days','-35 days'],
    ['t0000000-0000-0000-0000-000000000009','Refactor UserProfile component','Split the 800-line component into smaller pieces','backlog','P3','b0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000005','["refactor","tech-debt"]','+30 days','-20 days'],
    ['t0000000-0000-0000-0000-000000000010','Add CSV export to analytics table','Export filtered results with all visible columns','review','P2','b0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000019','["feature","analytics"]','+5 days','-8 days'],
  ];
  var cols = ['id','title','description','status','priority','project_id','assignee_id','labels','due_date','created_at'];
  var rows = data.map(function(t) {
    return [
      esc(t[0]), esc(t[1]), esc(t[2]), esc(t[3]), esc(t[4]), esc(t[5]), esc(t[6]), esc(t[7]),
      "date('now', '" + t[8] + "')",
      "datetime('now', '" + t[9] + "')"
    ];
  });
  batchInsert('tasks', cols, rows);
})();

// Generate remaining 190 tasks (11-200)
(function() {
  var cols = ['id','title','description','status','priority','project_id','assignee_id','labels','due_date','created_at'];
  var rows = [];
  for (var n = 11; n <= 200; n++) {
    var prefix = titlePrefixes[n % 15];
    var suffix = titleSuffixes[n % 20];
    var status = statusesArr[n % 4];
    var priority = prioritiesArr[n % 4];
    var projectId = uuid('b0000000', 1 + (n % 12));
    var assigneeId = uuid('a0000000', 1 + (n % 30));
    var label = labelValues[n % 8];
    var dueDayOffset = (n % 60) - 15;
    var createdDays = (n * 2) + 1;
    var sign = dueDayOffset >= 0 ? '+' : '';
    rows.push([
      esc(uuid('t0000000', n)),
      esc(prefix + ' ' + suffix),
      esc('Task description for item ' + n),
      esc(status),
      esc(priority),
      esc(projectId),
      esc(assigneeId),
      esc('["' + label + '"]'),
      "date('now', '" + sign + dueDayOffset + " days')",
      "datetime('now', '-" + createdDays + " days')"
    ]);
  }
  batchInsert('tasks', cols, rows);
})();

emit('CREATE INDEX idx_tasks_project_id ON tasks(project_id);');
emit('CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);');
emit('CREATE INDEX idx_tasks_status ON tasks(status);');
emit('CREATE INDEX idx_tasks_priority ON tasks(priority);');
emit('');

// ---------------------------------------------------------------------------
// 4. Sessions (3000 rows)
// ---------------------------------------------------------------------------
emit('-- ---------------------------------------------------------------------------');
emit('-- 4. Sessions (3000 rows)');
emit('-- ---------------------------------------------------------------------------');
emit('CREATE TABLE IF NOT EXISTS sessions (');
emit('  id TEXT PRIMARY KEY,');
emit('  user_id TEXT REFERENCES users(id),');
emit('  started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,');
emit('  ended_at TEXT,');
emit('  duration_seconds INTEGER,');
emit('  pages_viewed INTEGER NOT NULL DEFAULT 1,');
emit('  entry_page TEXT NOT NULL,');
emit('  exit_page TEXT,');
emit('  referrer TEXT,');
emit("  device TEXT CHECK (device IN ('desktop', 'mobile', 'tablet')),");
emit('  browser TEXT,');
emit('  os TEXT,');
emit('  country TEXT,');
emit('  city TEXT,');
emit('  is_bounce INTEGER NOT NULL DEFAULT 0');
emit(');');
emit('');

(function() {
  var cols = ['id','user_id','started_at','ended_at','duration_seconds','pages_viewed',
              'entry_page','exit_page','referrer','device','browser','os','country','city','is_bounce'];
  var rows = [];
  for (var n = 1; n <= 3000; n++) {
    var minutesAgo = Math.floor(n * 43.2);
    var durationSec = 60 + ((n * 137) % 1800);
    var isBounce = (n % 4 === 0) ? 1 : 0;
    rows.push([
      esc(uuid('s0000000', n)),
      esc(uuid('a0000000', 1 + (n % 100))),
      "datetime('now', '-" + minutesAgo + " minutes')",
      "datetime('now', '-" + minutesAgo + " minutes', '+" + durationSec + " seconds')",
      String(durationSec),
      String(1 + (n % 12)),
      esc(entryPages[n % 8]),
      esc(exitPages[n % 8]),
      esc(referrers[n % 10]),
      esc(devicesArr[n % 5]),
      esc(browsersArr[n % 6]),
      esc(osesArr[n % 6]),
      esc(countriesArr[n % 12]),
      esc(citiesArr[n % 15]),
      String(isBounce)
    ]);
  }
  batchInsert('sessions', cols, rows);
})();

emit('CREATE INDEX idx_sessions_user_id ON sessions(user_id);');
emit('CREATE INDEX idx_sessions_started_at ON sessions(started_at);');
emit('CREATE INDEX idx_sessions_is_bounce ON sessions(is_bounce);');
emit('CREATE INDEX idx_sessions_referrer ON sessions(referrer);');
emit('CREATE INDEX idx_sessions_country ON sessions(country);');
emit('');

// ---------------------------------------------------------------------------
// 5. Analytics Events (8000 rows)
// ---------------------------------------------------------------------------
emit('-- ---------------------------------------------------------------------------');
emit('-- 5. Analytics Events (8000 rows)');
emit('-- ---------------------------------------------------------------------------');
emit('CREATE TABLE IF NOT EXISTS analytics_events (');
emit('  id TEXT PRIMARY KEY,');
emit('  event_name TEXT NOT NULL,');
emit('  user_id TEXT REFERENCES users(id),');
emit('  session_id TEXT REFERENCES sessions(id),');
emit('  page_url TEXT,');
emit("  properties TEXT DEFAULT '{}',");
emit('  timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP');
emit(');');
emit('');

(function() {
  var cols = ['id','event_name','user_id','session_id','page_url','properties','timestamp'];
  var rows = [];
  for (var n = 1; n <= 8000; n++) {
    var evtName = eventNames[n % 19];
    var userId = uuid('a0000000', 1 + (n % 100));
    var pageUrl = pageUrls[n % 19];
    var source = sources[n % 9];
    var device = evtDevices[n % 5];
    var browser = evtBrowsers[n % 5];
    var os = evtOses[n % 5];
    var durationMs = ((n * 137) % 30000) + 500;
    var country = evtCountries[n % 10];
    var vpWidth = viewports[n % 8];
    var sessionPageNum = 1 + (n % 8);
    var minutesAgo = Math.floor((n / 8000.0) * 90.0 * 24.0 * 60.0);

    // Build JSON as a string literal to avoid json_object() CPU overhead
    var props = '{"source":' + JSON.stringify(source) +
      ',"device":' + JSON.stringify(device) +
      ',"browser":' + JSON.stringify(browser) +
      ',"os":' + JSON.stringify(os) +
      ',"duration_ms":' + durationMs +
      ',"country":' + JSON.stringify(country) +
      ',"viewport_width":' + vpWidth +
      ',"session_page_number":' + sessionPageNum + '}';

    rows.push([
      esc(uuid('ev000000', n)),
      esc(evtName),
      esc(userId),
      'NULL',
      esc(pageUrl),
      esc(props),
      "datetime('now', '-" + minutesAgo + " minutes')"
    ]);
  }
  batchInsert('analytics_events', cols, rows);
})();

emit('CREATE INDEX idx_events_event_name ON analytics_events(event_name);');
emit('CREATE INDEX idx_events_user_id ON analytics_events(user_id);');
emit('CREATE INDEX idx_events_timestamp ON analytics_events(timestamp);');
emit('CREATE INDEX idx_events_page_url ON analytics_events(page_url);');
emit('CREATE INDEX idx_events_session_id ON analytics_events(session_id);');
emit('');

// ---------------------------------------------------------------------------
// 6. Page Analytics (~1350 rows = 15 pages x 90 days)
// ---------------------------------------------------------------------------
emit('-- ---------------------------------------------------------------------------');
emit('-- 6. Page Analytics (~1350 rows)');
emit('-- ---------------------------------------------------------------------------');
emit('CREATE TABLE IF NOT EXISTS page_analytics (');
emit('  id TEXT PRIMARY KEY,');
emit('  page_path TEXT NOT NULL,');
emit('  page_title TEXT NOT NULL,');
emit('  date TEXT NOT NULL,');
emit('  views INTEGER NOT NULL DEFAULT 0,');
emit('  unique_views INTEGER NOT NULL DEFAULT 0,');
emit('  avg_duration_seconds REAL NOT NULL DEFAULT 0,');
emit('  bounce_rate REAL NOT NULL DEFAULT 0,');
emit('  entries INTEGER NOT NULL DEFAULT 0,');
emit('  exits INTEGER NOT NULL DEFAULT 0,');
emit('  UNIQUE(page_path, date)');
emit(');');
emit('');

// The original CTE uses strftime('%w', ...) for day-of-week which is only knowable at runtime.
// Since we want relative dates from 'now', we keep the datetime('now', ...) approach
// but we CANNOT call strftime in JS. So we emit the formulas using SQLite functions inline.
// However, that would require a SELECT expression per row, which defeats the purpose.
//
// Instead, since the day-of-week boost is a minor variation, we'll use a deterministic
// approximation: use (d % 7) as a proxy for the day of the week. This preserves the
// spirit of the original (weekday variation) while being fully pre-computable.
// The original used: CAST(strftime('%w', date('now', '-' || (89 - d) || ' days')) AS INTEGER)
// We approximate with: d % 7 (gives 0-6 rotation, same range as strftime %w)
(function() {
  var cols = ['id','page_path','page_title','date','views','unique_views','avg_duration_seconds','bounce_rate','entries','exits'];
  var rows = [];
  for (var d = 0; d <= 89; d++) {
    for (var pi = 0; pi < pagesList.length; pi++) {
      var p = pagesList[pi];
      var daysAgo = 89 - d;
      // Use d % 7 as proxy for day-of-week (0-6) — same range as strftime('%w')
      var dow = d % 7;
      var views = 50 + (dow * 20) + ((p.idx * 7 + d * 13 + 29) % 80);
      var uniqueViews = 30 + (dow * 12) + ((p.idx * 11 + d * 7 + 17) % 50);
      var avgDuration = 15.0 + ((p.idx * 17 + d * 11 + 23) % 240);
      var bounceRate = 15.0 + ((p.idx * 13 + d * 9 + 7) % 50);
      var entries = 10 + ((p.idx * 3 + d * 5 + 11) % 40);
      var exits = 8 + ((p.idx * 5 + d * 3 + 19) % 35);

      var idStr = 'pa' + pad(p.idx, 6) + '-0000-0000-0000-' + pad(d, 12);

      rows.push([
        esc(idStr),
        esc(p.path),
        esc(p.title),
        "date('now', '-" + daysAgo + " days')",
        String(views),
        String(uniqueViews),
        String(avgDuration),
        String(bounceRate),
        String(entries),
        String(exits)
      ]);
    }
  }
  batchInsert('page_analytics', cols, rows);
})();

emit('CREATE INDEX idx_page_analytics_path ON page_analytics(page_path);');
emit('CREATE INDEX idx_page_analytics_date ON page_analytics(date);');
emit('');

// ---------------------------------------------------------------------------
// 7. Funnels (4 rows) + Funnel Steps (20 rows)
// ---------------------------------------------------------------------------
emit('-- ---------------------------------------------------------------------------');
emit('-- 7. Funnels');
emit('-- ---------------------------------------------------------------------------');
emit('CREATE TABLE IF NOT EXISTS funnels (');
emit('  id TEXT PRIMARY KEY,');
emit('  name TEXT NOT NULL,');
emit('  description TEXT,');
emit('  created_by TEXT REFERENCES users(id),');
emit('  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,');
emit('  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP');
emit(');');
emit('');
emit('CREATE TABLE IF NOT EXISTS funnel_steps (');
emit('  id TEXT PRIMARY KEY,');
emit('  funnel_id TEXT NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,');
emit('  step_order INTEGER NOT NULL,');
emit('  name TEXT NOT NULL,');
emit('  event_name TEXT NOT NULL,');
emit('  count INTEGER NOT NULL DEFAULT 0,');
emit('  UNIQUE(funnel_id, step_order)');
emit(');');
emit('');

(function() {
  var funnelData = [
    ['c0000000-0000-0000-0000-000000000001','Signup Funnel','Tracks the user journey from landing page to paid conversion','a0000000-0000-0000-0000-000000000001','-90 days'],
    ['c0000000-0000-0000-0000-000000000002','Purchase Funnel','Tracks the e-commerce checkout conversion funnel','a0000000-0000-0000-0000-000000000019','-60 days'],
    ['c0000000-0000-0000-0000-000000000003','Onboarding Funnel','Tracks new user activation from signup to first value moment','a0000000-0000-0000-0000-000000000003','-45 days'],
    ['c0000000-0000-0000-0000-000000000004','Feature Adoption Funnel','Tracks adoption of the analytics dashboard feature','a0000000-0000-0000-0000-000000000009','-30 days'],
  ];
  var cols = ['id','name','description','created_by','created_at'];
  var rows = funnelData.map(function(f) {
    return [esc(f[0]), esc(f[1]), esc(f[2]), esc(f[3]), "datetime('now', '" + f[4] + "')"];
  });
  batchInsert('funnels', cols, rows);
})();

(function() {
  var stepsData = [
    // Signup Funnel
    ['fs000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001',1,'Landing Page','page_view',12847],
    ['fs000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000001',2,'Sign Up Click','signup',5234],
    ['fs000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000001',3,'Onboarding Start','form_submit',3891],
    ['fs000000-0000-0000-0000-000000000004','c0000000-0000-0000-0000-000000000001',4,'First Action','button_click',2156],
    ['fs000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000001',5,'Paid Conversion','purchase',892],
    // Purchase Funnel
    ['fs000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000002',1,'Product View','page_view',8432],
    ['fs000000-0000-0000-0000-000000000007','c0000000-0000-0000-0000-000000000002',2,'Add to Cart','button_click',3217],
    ['fs000000-0000-0000-0000-000000000008','c0000000-0000-0000-0000-000000000002',3,'Begin Checkout','form_submit',2105],
    ['fs000000-0000-0000-0000-000000000009','c0000000-0000-0000-0000-000000000002',4,'Payment Info','form_submit',1834],
    ['fs000000-0000-0000-0000-000000000010','c0000000-0000-0000-0000-000000000002',5,'Order Placed','purchase',1523],
    // Onboarding Funnel
    ['fs000000-0000-0000-0000-000000000011','c0000000-0000-0000-0000-000000000003',1,'Account Created','signup',6200],
    ['fs000000-0000-0000-0000-000000000012','c0000000-0000-0000-0000-000000000003',2,'Profile Setup','form_submit',4980],
    ['fs000000-0000-0000-0000-000000000013','c0000000-0000-0000-0000-000000000003',3,'First Project','button_click',3450],
    ['fs000000-0000-0000-0000-000000000014','c0000000-0000-0000-0000-000000000003',4,'Invite Team','form_submit',1890],
    ['fs000000-0000-0000-0000-000000000015','c0000000-0000-0000-0000-000000000003',5,'First Insight','page_view',1245],
    // Feature Adoption Funnel
    ['fs000000-0000-0000-0000-000000000016','c0000000-0000-0000-0000-000000000004',1,'Feature Viewed','page_view',4500],
    ['fs000000-0000-0000-0000-000000000017','c0000000-0000-0000-0000-000000000004',2,'Feature Clicked','click',2800],
    ['fs000000-0000-0000-0000-000000000018','c0000000-0000-0000-0000-000000000004',3,'Feature Used','button_click',1950],
    ['fs000000-0000-0000-0000-000000000019','c0000000-0000-0000-0000-000000000004',4,'Repeated Use','button_click',1200],
    ['fs000000-0000-0000-0000-000000000020','c0000000-0000-0000-0000-000000000004',5,'Power User','api_call',680],
  ];
  var cols = ['id','funnel_id','step_order','name','event_name','count'];
  var rows = stepsData.map(function(s) {
    return [esc(s[0]), esc(s[1]), String(s[2]), esc(s[3]), esc(s[4]), String(s[5])];
  });
  batchInsert('funnel_steps', cols, rows);
})();

emit('CREATE INDEX idx_funnel_steps_funnel_id ON funnel_steps(funnel_id);');
emit('');

// ---------------------------------------------------------------------------
// 8. Reports (8 rows)
// ---------------------------------------------------------------------------
emit('-- ---------------------------------------------------------------------------');
emit('-- 8. Reports');
emit('-- ---------------------------------------------------------------------------');
emit('CREATE TABLE IF NOT EXISTS reports (');
emit('  id TEXT PRIMARY KEY,');
emit('  title TEXT NOT NULL,');
emit('  description TEXT,');
emit("  format TEXT NOT NULL DEFAULT 'pdf' CHECK (format IN ('pdf', 'csv', 'excel')),");
emit("  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('ready', 'generating', 'scheduled', 'failed')),");
emit('  size_bytes INTEGER DEFAULT 0,');
emit("  report_type TEXT NOT NULL DEFAULT 'traffic' CHECK (report_type IN ('traffic', 'users', 'conversion', 'revenue', 'retention', 'performance')),");
emit('  created_by TEXT REFERENCES users(id),');
emit('  generated_at TEXT,');
emit('  schedule TEXT,');
emit('  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP');
emit(');');
emit('');

(function() {
  // [id, title, description, format, status, size_bytes, report_type, created_by, generated_at_offset|null, schedule|null, created_at_offset]
  var data = [
    ['d0000000-0000-0000-0000-000000000001','Weekly Traffic Summary','Aggregated traffic metrics including page views, unique visitors, and session data for the past 7 days','pdf','ready',2516582,'traffic','a0000000-0000-0000-0000-000000000001','-2 days','0 9 * * MON','-60 days'],
    ['d0000000-0000-0000-0000-000000000002','Monthly Active Users','Detailed breakdown of monthly active users by plan tier, geography, and engagement level','pdf','ready',3250585,'users','a0000000-0000-0000-0000-000000000003','-5 days','0 9 1 * *','-90 days'],
    ['d0000000-0000-0000-0000-000000000003','Conversion Funnel Report','Step-by-step conversion analysis for all active funnels with week-over-week comparison','pdf','ready',1887436,'conversion','a0000000-0000-0000-0000-000000000019','-7 days',null,'-30 days'],
    ['d0000000-0000-0000-0000-000000000004','Revenue Analytics','Revenue breakdown by plan, cohort, and geography with MRR/ARR tracking','excel','ready',5872025,'revenue','a0000000-0000-0000-0000-000000000009','-3 days','0 9 * * MON','-120 days'],
    ['d0000000-0000-0000-0000-000000000005','User Retention Cohorts','Weekly cohort retention analysis showing 12-week retention curves','csv','ready',933888,'retention','a0000000-0000-0000-0000-000000000019','-7 days',null,'-45 days'],
    ['d0000000-0000-0000-0000-000000000006','Top Pages Performance','Performance metrics for the top 50 pages including load times, bounce rate, and engagement','pdf','ready',1258291,'performance','a0000000-0000-0000-0000-000000000004','-1 days','0 9 * * FRI','-75 days'],
    ['d0000000-0000-0000-0000-000000000007','Quarterly Business Review','Comprehensive quarterly report covering all key metrics and KPIs','pdf','scheduled',0,'traffic','a0000000-0000-0000-0000-000000000001',null,'0 9 1 1,4,7,10 *','-180 days'],
    ['d0000000-0000-0000-0000-000000000008','API Usage Report','API endpoint usage statistics, error rates, and response time percentiles','excel','ready',4194304,'performance','a0000000-0000-0000-0000-000000000002','-4 days',null,'-20 days'],
  ];
  var cols = ['id','title','description','format','status','size_bytes','report_type','created_by','generated_at','schedule','created_at'];
  var rows = data.map(function(r) {
    return [
      esc(r[0]), esc(r[1]), esc(r[2]), esc(r[3]), esc(r[4]),
      String(r[5]), esc(r[6]), esc(r[7]),
      r[8] ? "datetime('now', '" + r[8] + "')" : 'NULL',
      r[9] ? esc(r[9]) : 'NULL',
      "datetime('now', '" + r[10] + "')"
    ];
  });
  batchInsert('reports', cols, rows);
})();

emit('CREATE INDEX idx_reports_report_type ON reports(report_type);');
emit('CREATE INDEX idx_reports_status ON reports(status);');
emit('CREATE INDEX idx_reports_created_by ON reports(created_by);');
emit('');

// ---------------------------------------------------------------------------
// 9. Alert Rules (7 rows) + Alert History (12 rows)
// ---------------------------------------------------------------------------
emit('-- ---------------------------------------------------------------------------');
emit('-- 9. Alert Rules + Alert History');
emit('-- ---------------------------------------------------------------------------');
emit('CREATE TABLE IF NOT EXISTS alert_rules (');
emit('  id TEXT PRIMARY KEY,');
emit('  name TEXT NOT NULL,');
emit('  description TEXT,');
emit('  condition_metric TEXT NOT NULL,');
emit("  condition_operator TEXT NOT NULL CHECK (condition_operator IN ('gt', 'lt', 'gte', 'lte', 'eq', 'pct_above', 'pct_below')),");
emit('  condition_threshold REAL NOT NULL,');
emit("  condition_window TEXT NOT NULL DEFAULT '1h',");
emit("  severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),");
emit('  active INTEGER NOT NULL DEFAULT 1,');
emit('  notify_email INTEGER NOT NULL DEFAULT 1,');
emit('  notify_slack INTEGER NOT NULL DEFAULT 0,');
emit('  created_by TEXT REFERENCES users(id),');
emit('  last_triggered_at TEXT,');
emit('  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,');
emit('  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP');
emit(');');
emit('');

(function() {
  // [id, name, desc, metric, operator, threshold, window, severity, active, email, slack, created_by, last_triggered|null, created_at]
  var data = [
    ['e0000000-0000-0000-0000-000000000001','Traffic Spike','Alert when page views exceed 150% of the hourly average','page_views','pct_above',150,'1h','warning',1,1,1,'a0000000-0000-0000-0000-000000000001','-1 days','-60 days'],
    ['e0000000-0000-0000-0000-000000000002','Error Rate Threshold','Alert when error event rate exceeds 5% of total events','error_rate','gt',5,'15m','critical',1,1,1,'a0000000-0000-0000-0000-000000000002','-2 days','-45 days'],
    ['e0000000-0000-0000-0000-000000000003','Low Conversion Rate','Alert when signup conversion drops below 2%','conversion_rate','lt',2,'24h','warning',1,1,0,'a0000000-0000-0000-0000-000000000019','-6 days','-30 days'],
    ['e0000000-0000-0000-0000-000000000004','Revenue Drop','Alert when daily revenue drops more than 20% below average','daily_revenue','pct_below',20,'24h','critical',1,1,1,'a0000000-0000-0000-0000-000000000009','-4 days','-90 days'],
    ['e0000000-0000-0000-0000-000000000005','New User Surge','Alert when new signups exceed 200% of daily average','new_signups','pct_above',200,'24h','info',1,0,0,'a0000000-0000-0000-0000-000000000003',null,'-20 days'],
    ['e0000000-0000-0000-0000-000000000006','Session Duration Drop','Alert when average session duration falls below 30 seconds','avg_session_duration','lt',30,'1h','warning',0,1,0,'a0000000-0000-0000-0000-000000000004','-10 days','-15 days'],
    ['e0000000-0000-0000-0000-000000000007','API Latency','Alert when p95 API response time exceeds 2000ms','api_p95_latency','gt',2000,'5m','critical',1,1,1,'a0000000-0000-0000-0000-000000000002','-3 days','-40 days'],
  ];
  var cols = ['id','name','description','condition_metric','condition_operator','condition_threshold','condition_window','severity','active','notify_email','notify_slack','created_by','last_triggered_at','created_at'];
  var rows = data.map(function(r) {
    return [
      esc(r[0]), esc(r[1]), esc(r[2]), esc(r[3]), esc(r[4]),
      String(r[5]), esc(r[6]), esc(r[7]), String(r[8]), String(r[9]), String(r[10]),
      esc(r[11]),
      r[12] ? "datetime('now', '" + r[12] + "')" : 'NULL',
      "datetime('now', '" + r[13] + "')"
    ];
  });
  batchInsert('alert_rules', cols, rows);
})();

emit('');
emit('CREATE TABLE IF NOT EXISTS alert_history (');
emit('  id TEXT PRIMARY KEY,');
emit('  alert_rule_id TEXT NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,');
emit('  triggered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,');
emit('  resolved_at TEXT,');
emit('  metric_value REAL NOT NULL,');
emit('  threshold_value REAL NOT NULL,');
emit("  status TEXT NOT NULL DEFAULT 'triggered' CHECK (status IN ('triggered', 'acknowledged', 'resolved')),");
emit('  notes TEXT');
emit(');');
emit('');

(function() {
  // [id, alert_rule_id, triggered_offset, resolved_extra_minutes, metric_value, threshold_value, status]
  var data = [
    ['ah000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','-1 days',18,172.5,150,'resolved'],
    ['ah000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000001','-5 days',31,180.0,150,'resolved'],
    ['ah000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000001','-12 days',44,187.5,150,'acknowledged'],
    ['ah000000-0000-0000-0000-000000000004','e0000000-0000-0000-0000-000000000002','-2 days',57,6.5,5,'resolved'],
    ['ah000000-0000-0000-0000-000000000005','e0000000-0000-0000-0000-000000000002','-8 days',10,6.75,5,'resolved'],
    ['ah000000-0000-0000-0000-000000000006','e0000000-0000-0000-0000-000000000003','-6 days',23,2.7,2,'acknowledged'],
    ['ah000000-0000-0000-0000-000000000007','e0000000-0000-0000-0000-000000000004','-4 days',36,28.0,20,'resolved'],
    ['ah000000-0000-0000-0000-000000000008','e0000000-0000-0000-0000-000000000004','-15 days',49,29.0,20,'resolved'],
    ['ah000000-0000-0000-0000-000000000009','e0000000-0000-0000-0000-000000000006','-10 days',2,34.5,30,'acknowledged'],
    ['ah000000-0000-0000-0000-000000000010','e0000000-0000-0000-0000-000000000007','-3 days',15,2900.0,2000,'resolved'],
    ['ah000000-0000-0000-0000-000000000011','e0000000-0000-0000-0000-000000000007','-9 days',28,3100.0,2000,'resolved'],
    ['ah000000-0000-0000-0000-000000000012','e0000000-0000-0000-0000-000000000007','-20 days',41,3300.0,2000,'acknowledged'],
  ];
  var cols = ['id','alert_rule_id','triggered_at','resolved_at','metric_value','threshold_value','status','notes'];
  var rows = data.map(function(r) {
    return [
      esc(r[0]), esc(r[1]),
      "datetime('now', '" + r[2] + "')",
      "datetime('now', '" + r[2] + "', '+" + r[3] + " minutes')",
      String(r[4]), String(r[5]), esc(r[6]), 'NULL'
    ];
  });
  batchInsert('alert_history', cols, rows);
})();

emit('CREATE INDEX idx_alert_history_rule_id ON alert_history(alert_rule_id);');
emit('CREATE INDEX idx_alert_history_triggered_at ON alert_history(triggered_at);');
emit('');

// ---------------------------------------------------------------------------
// 10. Files (~81 rows)
// ---------------------------------------------------------------------------
emit('-- ---------------------------------------------------------------------------');
emit('-- 10. Files');
emit('-- ---------------------------------------------------------------------------');
emit('CREATE TABLE IF NOT EXISTS files (');
emit('  id TEXT PRIMARY KEY,');
emit('  name TEXT NOT NULL,');
emit('  mime_type TEXT,');
emit('  size_bytes INTEGER DEFAULT 0,');
emit('  is_folder INTEGER NOT NULL DEFAULT 0,');
emit('  parent_id TEXT REFERENCES files(id),');
emit('  created_by TEXT REFERENCES users(id),');
emit('  trashed INTEGER NOT NULL DEFAULT 0,');
emit('  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,');
emit('  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP');
emit(');');
emit('');

// Top-level folders (5)
(function() {
  var data = [
    ['f0000000-0000-0000-0000-000000000001','Documents','a0000000-0000-0000-0000-000000000001','-300 days'],
    ['f0000000-0000-0000-0000-000000000002','Images','a0000000-0000-0000-0000-000000000001','-300 days'],
    ['f0000000-0000-0000-0000-000000000003','Reports','a0000000-0000-0000-0000-000000000003','-250 days'],
    ['f0000000-0000-0000-0000-000000000004','Designs','a0000000-0000-0000-0000-000000000023','-200 days'],
    ['f0000000-0000-0000-0000-000000000005','Exports','a0000000-0000-0000-0000-000000000009','-150 days'],
  ];
  var cols = ['id','name','is_folder','created_by','created_at'];
  var rows = data.map(function(r) {
    return [esc(r[0]), esc(r[1]), '1', esc(r[2]), "datetime('now', '" + r[3] + "')"];
  });
  batchInsert('files', cols, rows);
})();

// Sub-folders (7)
(function() {
  var data = [
    ['f0000000-0000-0000-0000-000000000006','Contracts','f0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','-290 days'],
    ['f0000000-0000-0000-0000-000000000007','Proposals','f0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000003','-280 days'],
    ['f0000000-0000-0000-0000-000000000008','Logos','f0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000023','-270 days'],
    ['f0000000-0000-0000-0000-000000000009','Screenshots','f0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000005','-260 days'],
    ['f0000000-0000-0000-0000-000000000010','Q4 2024','f0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000009','-120 days'],
    ['f0000000-0000-0000-0000-000000000011','Q1 2025','f0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000009','-60 days'],
    ['f0000000-0000-0000-0000-000000000012','Mockups','f0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000023','-180 days'],
  ];
  var cols = ['id','name','is_folder','parent_id','created_by','created_at'];
  var rows = data.map(function(r) {
    return [esc(r[0]), esc(r[1]), '1', esc(r[2]), esc(r[3]), "datetime('now', '" + r[4] + "')"];
  });
  batchInsert('files', cols, rows);
})();

// Files in folders (39 handcrafted files)
(function() {
  var data = [
    ['f1000000-0000-0000-0000-000000000001','Master Services Agreement - Acme Corp.pdf','application/pdf',245760,'f0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000001','-280 days'],
    ['f1000000-0000-0000-0000-000000000002','NDA - CloudPeak.pdf','application/pdf',128000,'f0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000001','-270 days'],
    ['f1000000-0000-0000-0000-000000000003','SLA Template v2.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',89600,'f0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000003','-250 days'],
    ['f1000000-0000-0000-0000-000000000004','Vendor Agreement - TechDistro.pdf','application/pdf',198400,'f0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000001','-200 days'],
    ['f1000000-0000-0000-0000-000000000005','Employee Handbook 2025.pdf','application/pdf',512000,'f0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000015','-30 days'],
    ['f1000000-0000-0000-0000-000000000006','Q4 Product Roadmap Proposal.pptx','application/vnd.openxmlformats-officedocument.presentationml.presentation',3145728,'f0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000003','-120 days'],
    ['f1000000-0000-0000-0000-000000000007','Budget Proposal FY2025.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',156672,'f0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000009','-90 days'],
    ['f1000000-0000-0000-0000-000000000008','Partnership Proposal - VelocityAI.pdf','application/pdf',287744,'f0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000019','-60 days'],
    ['f1000000-0000-0000-0000-000000000009','Infrastructure Upgrade Proposal.pdf','application/pdf',445440,'f0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000026','-45 days'],
    ['f1000000-0000-0000-0000-000000000010','logo-primary.svg','image/svg+xml',4096,'f0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000023','-260 days'],
    ['f1000000-0000-0000-0000-000000000011','logo-dark.svg','image/svg+xml',4352,'f0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000023','-260 days'],
    ['f1000000-0000-0000-0000-000000000012','logo-icon-only.png','image/png',24576,'f0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000023','-258 days'],
    ['f1000000-0000-0000-0000-000000000013','favicon.ico','image/x-icon',1024,'f0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000023','-258 days'],
    ['f1000000-0000-0000-0000-000000000014','og-image.png','image/png',307200,'f0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000024','-180 days'],
    ['f1000000-0000-0000-0000-000000000015','dashboard-v2-dark.png','image/png',1048576,'f0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000005','-45 days'],
    ['f1000000-0000-0000-0000-000000000016','onboarding-step3-bug.png','image/png',524288,'f0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000007','-20 days'],
    ['f1000000-0000-0000-0000-000000000017','mobile-nav-collapsed.png','image/png',389120,'f0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000017','-15 days'],
    ['f1000000-0000-0000-0000-000000000018','settings-new-layout.png','image/png',716800,'f0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000005','-10 days'],
    ['f1000000-0000-0000-0000-000000000019','Q4-2024-Revenue-Report.pdf','application/pdf',892928,'f0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000009','-100 days'],
    ['f1000000-0000-0000-0000-000000000020','Customer-Churn-Analysis-Oct.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',234496,'f0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000019','-95 days'],
    ['f1000000-0000-0000-0000-000000000021','NPS-Survey-Results-Q4.pdf','application/pdf',456704,'f0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000003','-85 days'],
    ['f1000000-0000-0000-0000-000000000022','Engineering-Velocity-Report.pdf','application/pdf',345088,'f0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000004','-80 days'],
    ['f1000000-0000-0000-0000-000000000023','Q1-2025-OKR-Progress.pdf','application/pdf',567296,'f0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000009','-50 days'],
    ['f1000000-0000-0000-0000-000000000024','Monthly-Active-Users-Jan.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',178176,'f0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000019','-40 days'],
    ['f1000000-0000-0000-0000-000000000025','Infrastructure-Cost-Report-Feb.pdf','application/pdf',623616,'f0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000026','-25 days'],
    ['f1000000-0000-0000-0000-000000000026','dashboard-redesign-v3.fig','application/octet-stream',8388608,'f0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000023','-170 days'],
    ['f1000000-0000-0000-0000-000000000027','mobile-app-screens.fig','application/octet-stream',12582912,'f0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000023','-130 days'],
    ['f1000000-0000-0000-0000-000000000028','icon-set-v2.svg','image/svg+xml',65536,'f0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000024','-100 days'],
    ['f1000000-0000-0000-0000-000000000029','email-template-designs.fig','application/octet-stream',4194304,'f0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000023','-70 days'],
    ['f1000000-0000-0000-0000-000000000030','component-library-specs.pdf','application/pdf',2097152,'f0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000024','-40 days'],
    ['f1000000-0000-0000-0000-000000000031','users-export-2025-01-15.csv','text/csv',45056,'f0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000009','-40 days'],
    ['f1000000-0000-0000-0000-000000000032','events-export-2025-01-20.csv','text/csv',2097152,'f0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000019','-35 days'],
    ['f1000000-0000-0000-0000-000000000033','invoices-2024-annual.pdf','application/pdf',1572864,'f0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000029','-55 days'],
    ['f1000000-0000-0000-0000-000000000034','audit-log-export-feb-2025.json','application/json',892928,'f0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000002','-20 days'],
    ['f1000000-0000-0000-0000-000000000035','Company Overview 2025.pdf','application/pdf',3670016,null,'a0000000-0000-0000-0000-000000000001','-60 days'],
    ['f1000000-0000-0000-0000-000000000036','Quick Start Guide.pdf','application/pdf',1048576,null,'a0000000-0000-0000-0000-000000000003','-200 days'],
    ['f1000000-0000-0000-0000-000000000037','team-photo-offsite-2024.jpg','image/jpeg',5242880,null,'a0000000-0000-0000-0000-000000000015','-150 days'],
    ['f1000000-0000-0000-0000-000000000038','product-demo-recording.mp4','video/mp4',52428800,null,'a0000000-0000-0000-0000-000000000019','-30 days'],
    ['f1000000-0000-0000-0000-000000000039','release-notes-v4.2.md','text/markdown',8192,null,'a0000000-0000-0000-0000-000000000001','-10 days'],
  ];
  var cols = ['id','name','mime_type','size_bytes','parent_id','created_by','created_at'];
  var rows = data.map(function(r) {
    return [
      esc(r[0]), esc(r[1]), esc(r[2]), String(r[3]),
      r[4] ? esc(r[4]) : 'NULL',
      esc(r[5]),
      "datetime('now', '" + r[6] + "')"
    ];
  });
  batchInsert('files', cols, rows);
})();

// Generate 30 additional files (CTE-generated in original)
(function() {
  var cols = ['id','name','mime_type','size_bytes','parent_id','created_by','created_at'];
  var rows = [];
  for (var n = 1; n <= 30; n++) {
    var ext = extensions[n % 8];
    var mime = mimeTypes[n % 8];
    var sizeBytes = ((n * 10240) % 5242880) + 1024;
    var parentId = parentFolders[n % 5];
    var createdBy = uuid('a0000000', 1 + (n % 30));
    var daysAgo = n * 3;
    rows.push([
      esc('f2000000-0000-0000-0000-' + pad(n, 12)),
      esc('file-' + n + '.' + ext),
      esc(mime),
      String(sizeBytes),
      esc(parentId),
      esc(createdBy),
      "datetime('now', '-" + daysAgo + " days')"
    ]);
  }
  batchInsert('files', cols, rows);
})();

// Mark trashed files
emit("UPDATE files SET trashed = 1 WHERE name IN ('file-3.docx', 'file-7.txt', 'file-12.csv');");
emit('');

emit('CREATE INDEX idx_files_parent_id ON files(parent_id);');
emit('CREATE INDEX idx_files_created_by ON files(created_by);');
emit('CREATE INDEX idx_files_trashed ON files(trashed);');
emit('');

// ---------------------------------------------------------------------------
// 11. Workspace Settings (1 row)
// ---------------------------------------------------------------------------
emit('-- ---------------------------------------------------------------------------');
emit('-- 11. Workspace Settings');
emit('-- ---------------------------------------------------------------------------');
emit('CREATE TABLE IF NOT EXISTS workspace_settings (');
emit('  id TEXT PRIMARY KEY,');
emit("  name TEXT NOT NULL DEFAULT 'Acme Analytics',");
emit("  timezone TEXT NOT NULL DEFAULT 'America/New_York',");
emit("  date_format TEXT NOT NULL DEFAULT 'MMM d, yyyy',");
emit('  logo_url TEXT,');
emit('  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,');
emit('  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP');
emit(');');
emit('');

(function() {
  var cols = ['id','name','timezone','date_format'];
  var rows = [[
    esc('ws000000-0000-0000-0000-000000000001'),
    esc('Acme Analytics'),
    esc('America/New_York'),
    esc('MMM d, yyyy')
  ]];
  batchInsert('workspace_settings', cols, rows);
})();

// ---------------------------------------------------------------------------
// 12. Notification Preferences (5 rows)
// ---------------------------------------------------------------------------
emit('-- ---------------------------------------------------------------------------');
emit('-- 12. Notification Preferences');
emit('-- ---------------------------------------------------------------------------');
emit('CREATE TABLE IF NOT EXISTS notification_preferences (');
emit('  id TEXT PRIMARY KEY,');
emit('  user_id TEXT NOT NULL REFERENCES users(id) UNIQUE,');
emit('  email_enabled INTEGER NOT NULL DEFAULT 1,');
emit('  slack_enabled INTEGER NOT NULL DEFAULT 0,');
emit('  weekly_digest INTEGER NOT NULL DEFAULT 1,');
emit('  alert_notifications INTEGER NOT NULL DEFAULT 1,');
emit('  marketing INTEGER NOT NULL DEFAULT 0,');
emit('  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP');
emit(');');
emit('');

(function() {
  var data = [
    ['np000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001',1,1,1,1,0],
    ['np000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000002',1,0,1,1,0],
    ['np000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000003',1,1,0,1,1],
    ['np000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000009',1,0,1,1,0],
    ['np000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000019',1,1,1,0,0],
  ];
  var cols = ['id','user_id','email_enabled','slack_enabled','weekly_digest','alert_notifications','marketing'];
  var rows = data.map(function(r) {
    return [esc(r[0]), esc(r[1]), String(r[2]), String(r[3]), String(r[4]), String(r[5]), String(r[6])];
  });
  batchInsert('notification_preferences', cols, rows);
})();

// ---------------------------------------------------------------------------
// 13. API Keys (3 rows)
// ---------------------------------------------------------------------------
emit('-- ---------------------------------------------------------------------------');
emit('-- 13. API Keys');
emit('-- ---------------------------------------------------------------------------');
emit('CREATE TABLE IF NOT EXISTS api_keys (');
emit('  id TEXT PRIMARY KEY,');
emit('  name TEXT NOT NULL,');
emit('  key_hash TEXT NOT NULL,');
emit('  key_prefix TEXT NOT NULL,');
emit('  created_by TEXT REFERENCES users(id),');
emit('  last_used_at TEXT,');
emit('  expires_at TEXT,');
emit('  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP');
emit(');');
emit('');

(function() {
  var data = [
    ['aa000000-0000-0000-0000-000000000001','Production Key','sha256_placeholder_prod_key_hash','ak_prod_','a0000000-0000-0000-0000-000000000001','-30 minutes','-160 days'],
    ['aa000000-0000-0000-0000-000000000002','Development Key','sha256_placeholder_dev_key_hash','ak_dev_x','a0000000-0000-0000-0000-000000000001','-1 days','-95 days'],
    ['aa000000-0000-0000-0000-000000000003','CI/CD Pipeline','sha256_placeholder_ci_key_hash','ak_ci_ab','a0000000-0000-0000-0000-000000000002','-2 hours','-45 days'],
  ];
  var cols = ['id','name','key_hash','key_prefix','created_by','last_used_at','created_at'];
  var rows = data.map(function(r) {
    return [
      esc(r[0]), esc(r[1]), esc(r[2]), esc(r[3]), esc(r[4]),
      "datetime('now', '" + r[5] + "')",
      "datetime('now', '" + r[6] + "')"
    ];
  });
  batchInsert('api_keys', cols, rows);
})();

// ---------------------------------------------------------------------------
// 14. Billing (1 row)
// ---------------------------------------------------------------------------
emit('-- ---------------------------------------------------------------------------');
emit('-- 14. Billing');
emit('-- ---------------------------------------------------------------------------');
emit('CREATE TABLE IF NOT EXISTS billing (');
emit('  id TEXT PRIMARY KEY,');
emit("  plan TEXT NOT NULL DEFAULT 'pro' CHECK (plan IN ('free', 'pro', 'enterprise')),");
emit('  monthly_amount INTEGER NOT NULL DEFAULT 0,');
emit('  usage_events INTEGER NOT NULL DEFAULT 0,');
emit('  usage_limit INTEGER NOT NULL DEFAULT 100000,');
emit("  next_billing_date TEXT NOT NULL DEFAULT (date('now', '+30 days')),");
emit('  payment_method_type TEXT,');
emit('  payment_method_last4 TEXT,');
emit('  payment_method_expires TEXT,');
emit('  stripe_customer_id TEXT,');
emit('  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,');
emit('  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP');
emit(');');
emit('');

(function() {
  var cols = ['id','plan','monthly_amount','usage_events','usage_limit','next_billing_date','payment_method_type','payment_method_last4','payment_method_expires'];
  var rows = [[
    esc('bi000000-0000-0000-0000-000000000001'),
    esc('pro'), '4900', '67432', '100000',
    "date('now', '+18 days')",
    esc('visa'), esc('4242'), esc('12/2027')
  ]];
  batchInsert('billing', cols, rows);
})();

emit('-- ---------------------------------------------------------------------------');
emit('-- Done');
emit('-- ---------------------------------------------------------------------------');

// =============================================================================
// Flush all buffered output to stdout
// =============================================================================
process.stdout.write(lines.join('\n') + '\n');
