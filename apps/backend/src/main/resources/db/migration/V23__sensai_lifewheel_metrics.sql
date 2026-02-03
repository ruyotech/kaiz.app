-- ============================================================================
-- V23: Add missing sensai_lifewheel_metrics table
-- Entity exists in app.kaiz.sensai.domain.LifeWheelMetric but table never created
-- ============================================================================

CREATE TABLE IF NOT EXISTS sensai_lifewheel_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    life_wheel_area_id VARCHAR(10) NOT NULL REFERENCES life_wheel_areas(id),
    score INTEGER NOT NULL DEFAULT 5,
    trend VARCHAR(10) DEFAULT 'stable',
    last_activity_at TIMESTAMP WITH TIME ZONE,
    tasks_completed INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT uk_sensai_lifewheel_user_area UNIQUE (user_id, life_wheel_area_id)
);

CREATE INDEX IF NOT EXISTS idx_sensai_lifewheel_user ON sensai_lifewheel_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_sensai_lifewheel_area ON sensai_lifewheel_metrics(life_wheel_area_id);

CREATE OR REPLACE TRIGGER update_sensai_lifewheel_metrics_updated_at
    BEFORE UPDATE ON sensai_lifewheel_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
