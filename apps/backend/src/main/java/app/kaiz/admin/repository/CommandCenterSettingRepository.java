package app.kaiz.admin.repository;

import app.kaiz.admin.domain.CommandCenterSetting;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommandCenterSettingRepository extends JpaRepository<CommandCenterSetting, UUID> {

    Optional<CommandCenterSetting> findBySettingKey(String settingKey);

    List<CommandCenterSetting> findByActiveTrue();

    List<CommandCenterSetting> findBySecretFalseAndActiveTrue();
}
