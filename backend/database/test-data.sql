-- Insert a test chore
INSERT INTO chores (title, points, due_date) 
VALUES ('Test Chore', 10, CURDATE());

-- Assign it to a profile (replace 1 with an actual profile ID)
INSERT INTO chore_assignments (chore_id, profile_id, is_completed) 
VALUES (LAST_INSERT_ID(), 1, false); 