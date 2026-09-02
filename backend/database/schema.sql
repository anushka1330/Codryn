-- ============================================================
-- CODRYN DATABASE SCHEMA
-- ============================================================
-- Run this once to create all tables.
-- Use initializeDatabase() in config/database.js for auto-init.
-- ============================================================

CREATE DATABASE IF NOT EXISTS codryn
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE codryn;

-- ── USERS ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100)    NOT NULL,
  email         VARCHAR(255)    NOT NULL,
  password_hash VARCHAR(255)    NOT NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── REPOSITORIES ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS repositories (
  id             INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id        INT UNSIGNED    NULL,
  owner          VARCHAR(255)    NOT NULL,
  name           VARCHAR(255)    NOT NULL,
  full_name      VARCHAR(511)    NOT NULL,
  url            VARCHAR(1024)   NOT NULL,
  description    TEXT            NULL,
  default_branch VARCHAR(100)    NOT NULL DEFAULT 'main',
  language       VARCHAR(100)    NULL,
  stars          INT UNSIGNED    NOT NULL DEFAULT 0,
  forks          INT UNSIGNED    NOT NULL DEFAULT 0,
  status         ENUM('pending','importing','analyzing','analyzed','error')
                                 NOT NULL DEFAULT 'pending',
  error_message  TEXT            NULL,
  created_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_repositories_full_name (full_name),
  KEY idx_repositories_user_id (user_id),
  KEY idx_repositories_status  (status),
  CONSTRAINT fk_repositories_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── REPOSITORY FILES ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS repository_files (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  repository_id INT UNSIGNED    NOT NULL,
  path          VARCHAR(2048)   NOT NULL,
  name          VARCHAR(255)    NOT NULL,
  extension     VARCHAR(50)     NULL,
  language      VARCHAR(100)    NULL,
  size          INT UNSIGNED    NOT NULL DEFAULT 0,
  content       MEDIUMTEXT      NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_repo_files_repo_id   (repository_id),
  KEY idx_repo_files_extension (extension),
  CONSTRAINT fk_repo_files_repository
    FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── ANALYSES ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS analyses (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  repository_id    INT UNSIGNED NOT NULL,
  tech_stack       JSON         NULL COMMENT 'Detected technologies',
  architecture     JSON         NULL COMMENT 'Architecture layers and components',
  dependencies     JSON         NULL COMMENT 'Key packages and libraries',
  apis             JSON         NULL COMMENT 'Detected API routes',
  database_info    JSON         NULL COMMENT 'Database models and schema',
  authentication   JSON         NULL COMMENT 'Auth patterns and providers',
  deployment       JSON         NULL COMMENT 'Deployment configuration',
  setup            JSON         NULL COMMENT 'Setup instructions',
  project_health   JSON         NULL COMMENT 'Health scores and findings',
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_analyses_repository_id (repository_id),
  CONSTRAINT fk_analyses_repository
    FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── CHAT SESSIONS ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS chat_sessions (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  repository_id INT UNSIGNED NOT NULL,
  user_id       INT UNSIGNED NULL,
  title         VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_chat_sessions_repo_id (repository_id),
  KEY idx_chat_sessions_user_id (user_id),
  CONSTRAINT fk_chat_sessions_repository
    FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_sessions_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── CHAT MESSAGES ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS chat_messages (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id INT UNSIGNED NOT NULL,
  role       ENUM('user','assistant') NOT NULL,
  content    TEXT         NOT NULL,
  metadata   JSON         NULL COMMENT 'Citations, file references, etc.',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_chat_messages_session_id (session_id),
  CONSTRAINT fk_chat_messages_session
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
