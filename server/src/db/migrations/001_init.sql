-- Portfolio CMS — initial schema (MySQL 8, utf8mb4).
-- All DATETIME columns are UTC (the pool sets time_zone = '+00:00').

CREATE TABLE users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(190) NOT NULL,
  password_hash VARCHAR(100) NOT NULL,
  role          ENUM('owner', 'editor') NOT NULL DEFAULT 'editor',
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Session tokens are stored as SHA-256 hashes; the raw token only lives in the cookie.
CREATE TABLE sessions (
  id           CHAR(64) NOT NULL,
  user_id      INT UNSIGNED NOT NULL,
  ip           VARCHAR(45) NOT NULL DEFAULT '',
  user_agent   VARCHAR(255) NOT NULL DEFAULT '',
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at   DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY ix_sessions_user (user_id),
  KEY ix_sessions_expires (expires_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Uploaded images and files. Images are stored as responsive variants named
-- <name>-<width>.<version>.<format>; files (the CV) as <name>.<version>.<ext>.
CREATE TABLE media (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(80) NOT NULL,
  kind          ENUM('image', 'file') NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime          VARCHAR(80) NOT NULL,
  ext           VARCHAR(10) NOT NULL,
  bytes         INT UNSIGNED NOT NULL,
  width         SMALLINT UNSIGNED NULL,
  height        SMALLINT UNSIGNED NULL,
  version       CHAR(8) NOT NULL,
  has_alpha     TINYINT(1) NOT NULL DEFAULT 0,
  widths        JSON NULL,
  formats       JSON NULL,
  alt           VARCHAR(300) NOT NULL DEFAULT '',
  created_by    INT UNSIGNED NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_media_name (name),
  CONSTRAINT fk_media_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Singletons edited as one form each: profile, social, hero, marquee, story,
-- sections, contact, seo. Shapes are checked by the zod schemas in settings.schema.ts.
CREATE TABLE settings (
  setting_key VARCHAR(40) NOT NULL,
  value       JSON NOT NULL,
  updated_by  INT UNSIGNED NULL,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (setting_key),
  CONSTRAINT fk_settings_updated_by FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE projects (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug        VARCHAR(80) NOT NULL,
  title       VARCHAR(160) NOT NULL,
  short_title VARCHAR(60) NOT NULL,
  kicker      VARCHAR(120) NOT NULL DEFAULT '',
  summary     VARCHAR(600) NOT NULL,
  note        VARCHAR(300) NOT NULL DEFAULT '',
  role        VARCHAR(300) NOT NULL DEFAULT '',
  featured    TINYINT(1) NOT NULL DEFAULT 0,
  image_id    INT UNSIGNED NOT NULL,
  image_alt   VARCHAR(300) NOT NULL,
  source_url  VARCHAR(500) NOT NULL DEFAULT '',
  live_url    VARCHAR(500) NOT NULL DEFAULT '',
  status      ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  sort_order  INT NOT NULL DEFAULT 0,
  created_by  INT UNSIGNED NULL,
  updated_by  INT UNSIGNED NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_projects_slug (slug),
  KEY ix_projects_order (status, sort_order),
  -- RESTRICT: an image in use cannot be deleted from the media library.
  CONSTRAINT fk_projects_image FOREIGN KEY (image_id) REFERENCES media (id) ON DELETE RESTRICT,
  CONSTRAINT fk_projects_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_projects_updated_by FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE project_stack (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_id INT UNSIGNED NOT NULL,
  label      VARCHAR(60) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY ix_project_stack_project (project_id, sort_order),
  KEY ix_project_stack_label (label),
  CONSTRAINT fk_project_stack_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE project_stats (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_id INT UNSIGNED NOT NULL,
  value      VARCHAR(20) NOT NULL,
  label      VARCHAR(60) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY ix_project_stats_project (project_id, sort_order),
  CONSTRAINT fk_project_stats_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A case study is told in steps ("the problem", "what i built", "what changed").
CREATE TABLE project_steps (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_id INT UNSIGNED NOT NULL,
  label      VARCHAR(60) NOT NULL,
  body       TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY ix_project_steps_project (project_id, sort_order),
  CONSTRAINT fk_project_steps_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Optional extras inside a step: a flow of stages, supporting facts, or a feature grid.
CREATE TABLE project_step_items (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  step_id    INT UNSIGNED NOT NULL,
  kind       ENUM('flow', 'fact', 'feature') NOT NULL,
  title      VARCHAR(160) NOT NULL DEFAULT '',
  body       VARCHAR(600) NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY ix_step_items_step (step_id, kind, sort_order),
  CONSTRAINT fk_step_items_step FOREIGN KEY (step_id) REFERENCES project_steps (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE skill_groups (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title      VARCHAR(80) NOT NULL,
  subtitle   VARCHAR(160) NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE skills (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  group_id   INT UNSIGNED NOT NULL,
  name       VARCHAR(60) NOT NULL,
  tag        VARCHAR(40) NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY ix_skills_group (group_id, sort_order),
  CONSTRAINT fk_skills_group FOREIGN KEY (group_id) REFERENCES skill_groups (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE certifications (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug       VARCHAR(80) NOT NULL,
  title      VARCHAR(200) NOT NULL,
  issuer     VARCHAR(200) NOT NULL,
  year       SMALLINT UNSIGNED NOT NULL,
  date_label VARCHAR(60) NOT NULL,
  image_id   INT UNSIGNED NOT NULL,
  image_alt  VARCHAR(300) NOT NULL,
  link_url   VARCHAR(500) NOT NULL DEFAULT '',
  link_label VARCHAR(80) NOT NULL DEFAULT '',
  status     ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_certifications_slug (slug),
  CONSTRAINT fk_certifications_image FOREIGN KEY (image_id) REFERENCES media (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Contact form inbox.
CREATE TABLE messages (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(190) NOT NULL,
  body        TEXT NOT NULL,
  status      ENUM('new', 'read', 'archived', 'spam') NOT NULL DEFAULT 'new',
  source_page VARCHAR(255) NOT NULL DEFAULT '',
  visitor     CHAR(16) NOT NULL DEFAULT '',
  user_agent  VARCHAR(255) NOT NULL DEFAULT '',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at     DATETIME NULL,
  PRIMARY KEY (id),
  KEY ix_messages_status (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Cookieless analytics. `visitor` is a hash of a daily salt + IP + user agent,
-- so the same person cannot be followed from one day to the next.
CREATE TABLE analytics_salts (
  day  DATE NOT NULL,
  salt CHAR(32) NOT NULL,
  PRIMARY KEY (day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE page_views (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  visitor       CHAR(16) NOT NULL,
  path          VARCHAR(255) NOT NULL,
  referrer_host VARCHAR(255) NOT NULL DEFAULT '',
  utm_source    VARCHAR(80) NOT NULL DEFAULT '',
  device        ENUM('desktop', 'mobile', 'tablet') NOT NULL,
  browser       VARCHAR(30) NOT NULL DEFAULT '',
  country       CHAR(2) NOT NULL DEFAULT '',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_page_views_created (created_at),
  KEY ix_page_views_visitor (visitor, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE events (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  visitor    CHAR(16) NOT NULL,
  name       VARCHAR(40) NOT NULL,
  label      VARCHAR(120) NOT NULL DEFAULT '',
  path       VARCHAR(255) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_events_created (created_at, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- One row per SEO audit of the live site; `checks` holds every check with its result.
CREATE TABLE seo_audits (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  url          VARCHAR(500) NOT NULL,
  score        TINYINT UNSIGNED NOT NULL,
  status_code  SMALLINT UNSIGNED NOT NULL,
  response_ms  INT UNSIGNED NOT NULL,
  html_bytes   INT UNSIGNED NOT NULL,
  checks       JSON NOT NULL,
  trigger_type ENUM('manual', 'schedule', 'publish') NOT NULL,
  created_by   INT UNSIGNED NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_seo_audits_created (created_at),
  CONSTRAINT fk_seo_audits_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Google Search Console data, one row per day per dimension value
-- (dimension 'date' has an empty item_key and holds the day's totals).
CREATE TABLE search_console_rows (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  day         DATE NOT NULL,
  dimension   ENUM('date', 'query', 'page') NOT NULL,
  item_key    VARCHAR(500) NOT NULL DEFAULT '',
  clicks      INT UNSIGNED NOT NULL DEFAULT 0,
  impressions INT UNSIGNED NOT NULL DEFAULT 0,
  ctr         DECIMAL(7,4) NOT NULL DEFAULT 0,
  position    DECIMAL(7,2) NOT NULL DEFAULT 0,
  synced_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_search_rows (day, dimension, item_key),
  KEY ix_search_rows_dimension (dimension, day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Each "Publish" press: the Vercel deploy hook call and its answer. `last_activity_id`
-- is the newest activity row included, so "not live yet" = content activity after it.
CREATE TABLE publishes (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  status           ENUM('triggered', 'failed') NOT NULL,
  last_activity_id BIGINT UNSIGNED NOT NULL DEFAULT 0,
  note         VARCHAR(200) NOT NULL DEFAULT '',
  response     VARCHAR(500) NOT NULL DEFAULT '',
  triggered_by INT UNSIGNED NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_publishes_created (created_at),
  CONSTRAINT fk_publishes_user FOREIGN KEY (triggered_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Audit trail of every change made in the CMS. Content actions since the last
-- publish are what the Publish page lists as "not live yet".
CREATE TABLE activity_log (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED NULL,
  action      VARCHAR(40) NOT NULL,
  entity_type VARCHAR(30) NOT NULL DEFAULT '',
  entity_id   INT UNSIGNED NULL,
  summary     VARCHAR(255) NOT NULL,
  is_content  TINYINT(1) NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_activity_created (created_at),
  KEY ix_activity_content (is_content, created_at),
  CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
