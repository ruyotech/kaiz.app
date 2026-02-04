package app.kaiz.admin.repository;

import app.kaiz.admin.domain.TestAttachment;
import app.kaiz.admin.domain.TestAttachment.AttachmentType;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestAttachmentRepository extends JpaRepository<TestAttachment, UUID> {

    List<TestAttachment> findByAttachmentType(AttachmentType type);

    List<TestAttachment> findByUseCase(String useCase);

    List<TestAttachment> findByActiveTrue();

    List<TestAttachment> findByActiveTrueOrderByDisplayOrderAsc();

    List<TestAttachment> findByAttachmentTypeAndActiveTrue(AttachmentType type);
}
