package app.kaiz.admin.infrastructure;

import app.kaiz.admin.domain.AdminUser;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminUserRepository extends JpaRepository<AdminUser, UUID> {

  Optional<AdminUser> findByEmail(String email);

  boolean existsByEmail(String email);
}
