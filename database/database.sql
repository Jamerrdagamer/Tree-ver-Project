/*
datebase.sql - Database schema for Tree-ver App
Author: JH

1.00 JH Initial release with tables for users, trees, adoptions, observations, photos, comments, and likes.
*/

CREATE TABLE OR ALTER users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'community', -- 'admin' or 'community'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE trees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    species TEXT NOT NULL,
    estimated_age INTEGER,
    height_meters REAL,
    trunk_diameter_cm REAL,
    planted_date DATE,
    planted_by TEXT,
    health_status TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    qr_code TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE adoptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    tree_id INTEGER NOT NULL,
    adopted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (tree_id) REFERENCES trees(id),
    UNIQUE(user_id, tree_id)
);

CREATE TABLE observations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tree_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL, 
    -- 'tag', 'disease', 'wildlife', 'note'
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tree_id) REFERENCES trees(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);


CREATE TABLE photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tree_id INTEGER,
    observation_id INTEGER,
    uploaded_by INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tree_id) REFERENCES trees(id),
    FOREIGN KEY (observation_id) REFERENCES observations(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    observation_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (observation_id) REFERENCES observations(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    observation_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (observation_id) REFERENCES observations(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(observation_id, user_id)
);
