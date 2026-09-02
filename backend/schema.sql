CREATE DATABASE IF NOT EXISTS codryn;
USE codryn;
SHOW DATABASES;
USE codryn;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS repositories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    owner VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(500) NOT NULL,
    url VARCHAR(500) NOT NULL,
    description TEXT,
    default_branch VARCHAR(100),
    language VARCHAR(100),
    status VARCHAR(50) DEFAULT 'imported',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_repositories_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS repository_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    repository_id INT NOT NULL,
    path VARCHAR(1000) NOT NULL,
    name VARCHAR(255) NOT NULL,
    extension VARCHAR(50),
    language VARCHAR(100),
    size INT DEFAULT 0,
    content LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (repository_id)
        REFERENCES repositories(id)
        ON DELETE CASCADE,

    INDEX idx_repository_files_repository_id (repository_id),
    INDEX idx_repository_files_path (path(255))
);

CREATE TABLE IF NOT EXISTS analyses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    repository_id INT NOT NULL,

    tech_stack JSON,
    architecture JSON,
    dependencies JSON,
    apis JSON,
    database_info JSON,
    authentication JSON,
    deployment JSON,
    setup JSON,
    project_health JSON,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (repository_id)
        REFERENCES repositories(id)
        ON DELETE CASCADE,

    INDEX idx_analyses_repository_id (repository_id)
);

CREATE TABLE IF NOT EXISTS chat_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    repository_id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(255) DEFAULT 'New Conversation',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (repository_id)
        REFERENCES repositories(id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_chat_sessions_repository_id (repository_id),
    INDEX idx_chat_sessions_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    role ENUM('user', 'assistant') NOT NULL,
    content LONGTEXT NOT NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (session_id)
        REFERENCES chat_sessions(id)
        ON DELETE CASCADE,

    INDEX idx_chat_messages_session_id (session_id)
);
USE codryn;

SHOW TABLES;
