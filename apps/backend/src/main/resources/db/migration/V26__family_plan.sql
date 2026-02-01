-- ============================================================================
-- V26: Family Plan Feature
-- Family workspaces, members, invitations, and task/epic family fields
-- ============================================================================

-- 1. Families table (Family workspaces)
CREATE TABLE IF NOT EXISTS families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invite_code VARCHAR(20) UNIQUE,
    invite_code_expires_at TIMESTAMP WITH TIME ZONE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36)
);

CREATE INDEX IF NOT EXISTS idx_families_owner_id ON families(owner_id);
CREATE INDEX IF NOT EXISTS idx_families_invite_code ON families(invite_code) WHERE invite_code IS NOT NULL;

CREATE TRIGGER update_families_updated_at
    BEFORE UPDATE ON families
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. Family Members table (Links users to family workspaces)
CREATE TABLE IF NOT EXISTS family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT chk_family_member_role CHECK (role IN ('OWNER', 'ADULT', 'TEEN', 'CHILD')),
    CONSTRAINT uk_family_members_family_user UNIQUE (family_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_role ON family_members(role);
CREATE INDEX IF NOT EXISTS idx_family_members_active ON family_members(is_active) WHERE is_active = true;

CREATE TRIGGER update_family_members_updated_at
    BEFORE UPDATE ON family_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. Family Invites table (Invitation management)
CREATE TABLE IF NOT EXISTS family_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    suggested_role VARCHAR(20) NOT NULL,
    invited_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    accepted_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    invite_token VARCHAR(64) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT chk_invite_role CHECK (suggested_role IN ('OWNER', 'ADULT', 'TEEN', 'CHILD')),
    CONSTRAINT chk_invite_status CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED'))
);

CREATE INDEX IF NOT EXISTS idx_family_invites_family_id ON family_invites(family_id);
CREATE INDEX IF NOT EXISTS idx_family_invites_email ON family_invites(email);
CREATE INDEX IF NOT EXISTS idx_family_invites_status ON family_invites(status);
CREATE INDEX IF NOT EXISTS idx_family_invites_token ON family_invites(invite_token) WHERE invite_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_family_invites_invited_by ON family_invites(invited_by_id);

CREATE TRIGGER update_family_invites_updated_at
    BEFORE UPDATE ON family_invites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Add family fields to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'PRIVATE';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS approved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Add constraint for visibility
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS chk_task_visibility;
ALTER TABLE tasks ADD CONSTRAINT chk_task_visibility 
    CHECK (visibility IS NULL OR visibility IN ('PRIVATE', 'SHARED', 'ASSIGNED'));

CREATE INDEX IF NOT EXISTS idx_tasks_family_id ON tasks(family_id) WHERE family_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_visibility ON tasks(visibility) WHERE visibility IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to_user_id) WHERE assigned_to_user_id IS NOT NULL;

-- 5. Add family fields to epics table
ALTER TABLE epics ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id) ON DELETE SET NULL;
ALTER TABLE epics ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'PRIVATE';

-- Add constraint for visibility
ALTER TABLE epics DROP CONSTRAINT IF EXISTS chk_epic_visibility;
ALTER TABLE epics ADD CONSTRAINT chk_epic_visibility 
    CHECK (visibility IS NULL OR visibility IN ('PRIVATE', 'SHARED', 'ASSIGNED'));

CREATE INDEX IF NOT EXISTS idx_epics_family_id ON epics(family_id) WHERE family_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_epics_visibility ON epics(visibility) WHERE visibility IS NOT NULL;

-- 6. Create function to get user's family membership
CREATE OR REPLACE FUNCTION get_user_family_membership(p_user_id UUID)
RETURNS TABLE (
    family_id UUID,
    family_name VARCHAR(100),
    member_role VARCHAR(20),
    is_owner BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id AS family_id,
        f.name AS family_name,
        fm.role AS member_role,
        (f.owner_id = p_user_id) AS is_owner
    FROM families f
    JOIN family_members fm ON fm.family_id = f.id
    WHERE fm.user_id = p_user_id
    AND fm.is_active = true;
END;
$$ LANGUAGE plpgsql;
