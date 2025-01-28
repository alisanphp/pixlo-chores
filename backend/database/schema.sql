-- Database creation
CREATE DATABASE IF NOT EXISTS calender_app;
USE calender_app;

-- Profiles table
CREATE TABLE profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    color_theme VARCHAR(50) NOT NULL,
    icon_name VARCHAR(50) NOT NULL DEFAULT 'UserCircleIcon',
    points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chores table
CREATE TABLE chores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    points INT NOT NULL,
    is_repeat BOOLEAN DEFAULT FALSE,
    repeat_start_date DATE,
    repeat_interval ENUM('daily', 'weekly', 'monthly') NULL,
    repeat_all_day BOOLEAN DEFAULT TRUE,
    repeat_time TIME NULL,
    repeat_days JSON NULL, -- Weekly için günleri JSON olarak saklayacağız: ["MON", "TUE", etc.]
    repeat_until DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chore assignments table
CREATE TABLE chore_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    chore_id INT NOT NULL,
    profile_id INT NOT NULL,
    assignment_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chore_id) REFERENCES chores(id),
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
);

-- Chore profiles table (çoklu profil için)
CREATE TABLE chore_profiles (
    chore_id INT NOT NULL,
    profile_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (chore_id, profile_id),
    FOREIGN KEY (chore_id) REFERENCES chores(id),
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
);

-- Rewards table
CREATE TABLE rewards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    points_cost INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reward assignments table
CREATE TABLE reward_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reward_id INT NOT NULL,
    profile_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reward_id) REFERENCES rewards(id),
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
);

-- Penalties table
CREATE TABLE penalties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    points INT NOT NULL,
    profile_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
); 