-- STEAM Portal Database Setup Script
-- Run this script to initialize the steam_db database

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS steam_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE steam_db;

-- Drop existing tables to start fresh
DROP TABLE IF EXISTS files;
DROP TABLE IF EXISTS content;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS grades;
DROP TABLE IF EXISTS file_categories;

-- Create grades table
CREATE TABLE grades (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age_range VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create categories table
CREATE TABLE categories (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create subcategories table
CREATE TABLE subcategories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category_id VARCHAR(20) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create content table
CREATE TABLE content (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  grade_id VARCHAR(20),
  category_id VARCHAR(20),
  type VARCHAR(50) DEFAULT 'lesson',
  content_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create files table
CREATE TABLE files (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  size INT,
  file_path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100),
  category_id VARCHAR(20),
  is_public BOOLEAN DEFAULT FALSE,
  download_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create file_categories table
CREATE TABLE file_categories (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample data into grades
INSERT INTO grades (id, name, age_range) VALUES
('kindergarten', 'Kindergarten', 'Ages 4-6'),
('grade1', 'Grade 1', 'Ages 6-7'),
('grade2', 'Grade 2', 'Ages 7-8'),
('grade3', 'Grade 3', 'Ages 8-9'),
('grade4', 'Grade 4', 'Ages 9-10'),
('grade5', 'Grade 5', 'Ages 10-11');

-- Insert sample data into categories
INSERT INTO categories (id, name, icon, color) VALUES
('math', 'Mathematics', 'fa-calculator', '#3498db'),
('science', 'Science', 'fa-flask', '#27ae60'),
('arts', 'Arts', 'fa-palette', '#e74c3c'),
('technology', 'Technology', 'fa-laptop', '#9b59b6'),
('engineering', 'Engineering', 'fa-cogs', '#95a5a6');

-- Insert sample data into subcategories
INSERT INTO subcategories (id, name, category_id) VALUES
('algebra', 'Algebra', 'math'),
('geometry', 'Geometry', 'math'),
('calculus', 'Calculus', 'math'),
('physics', 'Physics', 'science'),
('chemistry', 'Chemistry', 'science'),
('biology', 'Biology', 'science'),
('painting', 'Painting', 'arts'),
('music', 'Music', 'arts'),
('sculpture', 'Sculpture', 'arts'),
('programming', 'Programming', 'technology'),
('web-dev', 'Web Development', 'technology'),
('robotics', 'Robotics', 'technology'),
('mechanical', 'Mechanical Engineering', 'engineering'),
('civil', 'Civil Engineering', 'engineering'),
('electrical', 'Electrical Engineering', 'engineering');

-- Insert sample data into file_categories
INSERT INTO file_categories (id, name, icon, color) VALUES
('video', 'Videos', 'fa-video', '#e74c3c'),
('exercise', 'Exercises', 'fa-pencil-alt', '#3498db'),
('memo', 'Memos', 'fa-key', '#27ae60'),
('document', 'Documents', 'fa-file-pdf', '#9b59b6'),
('general', 'General', 'fa-folder', '#95a5a6');

-- Show the created tables
SHOW TABLES;

-- Display sample data
SELECT 'Grades:' as table_name;
SELECT * FROM grades;

SELECT 'Categories:' as table_name;
SELECT * FROM categories;

SELECT 'File Categories:' as table_name;
SELECT * FROM file_categories;
