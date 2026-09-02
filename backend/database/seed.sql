-- ============================================================
-- CODRYN SEED DATA
-- Optional: demo/test data for development
-- ============================================================

USE codryn;

-- Demo user (password: demo1234)
-- bcrypt hash of 'demo1234' with 10 rounds
INSERT IGNORE INTO users (name, email, password_hash) VALUES
  ('Demo User', 'demo@codryn.dev', '$2a$10$rJ7tO7YzIkHjbMBqCLt9kO5GsZVf6tQdL2QJAaTxAFHCNkFZ3qWGe');

-- Demo repository
INSERT IGNORE INTO repositories (user_id, owner, name, full_name, url, description, default_branch, language, status)
VALUES (
  1,
  'expressjs',
  'express',
  'expressjs/express',
  'https://github.com/expressjs/express',
  'Fast, unopinionated, minimalist web framework for node.',
  'master',
  'JavaScript',
  'pending'
);
