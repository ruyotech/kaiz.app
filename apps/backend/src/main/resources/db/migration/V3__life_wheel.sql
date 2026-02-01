-- ============================================================================
-- V3: Life Wheel Module
-- 8 Life Dimensions & Eisenhower Matrix Quadrants
-- Reference data used across tasks, challenges, and other modules
-- ============================================================================

-- ============================================================================
-- LIFE WHEEL AREAS (8 dimensions)
-- ============================================================================
CREATE TABLE life_wheel_areas (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10) NOT NULL,
    color VARCHAR(7) NOT NULL,
    display_order INT NOT NULL
);

INSERT INTO life_wheel_areas (id, name, icon, color, display_order) VALUES
    ('lw-1', 'Health & Fitness', '💪', '#10B981', 1),
    ('lw-2', 'Career & Work', '💼', '#3B82F6', 2),
    ('lw-3', 'Finance & Money', '💰', '#F59E0B', 3),
    ('lw-4', 'Personal Growth', '📚', '#8B5CF6', 4),
    ('lw-5', 'Relationships & Family', '❤️', '#EF4444', 5),
    ('lw-6', 'Social Life', '👥', '#EC4899', 6),
    ('lw-7', 'Fun & Recreation', '🎮', '#14B8A6', 7),
    ('lw-8', 'Environment & Home', '🏡', '#84CC16', 8);

-- ============================================================================
-- EISENHOWER QUADRANTS
-- ============================================================================
CREATE TABLE eisenhower_quadrants (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    label VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    color VARCHAR(7) NOT NULL,
    display_order INT NOT NULL
);

INSERT INTO eisenhower_quadrants (id, name, label, description, color, display_order) VALUES
    ('eq-1', 'Urgent & Important', 'Do First', 'Crisis, deadlines, problems', '#EF4444', 1),
    ('eq-2', 'Not Urgent & Important', 'Schedule', 'Growth zone, planning, prevention', '#F59E0B', 2),
    ('eq-3', 'Urgent & Not Important', 'Delegate', 'Interruptions, some meetings, some calls', '#3B82F6', 3),
    ('eq-4', 'Not Urgent & Not Important', 'Eliminate', 'Time wasters, busy work', '#6B7280', 4);
