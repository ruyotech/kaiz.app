package app.kaiz.community.application;

import app.kaiz.community.application.dto.AnswerResponse;
import app.kaiz.community.application.dto.CommunityMemberResponse;
import app.kaiz.community.application.dto.CreateAnswerRequest;
import app.kaiz.community.application.dto.CreateQuestionRequest;
import app.kaiz.community.application.dto.QuestionResponse;
import app.kaiz.community.domain.ActivityType;
import app.kaiz.community.domain.Answer;
import app.kaiz.community.domain.CommunityMember;
import app.kaiz.community.domain.Question;
import app.kaiz.community.domain.QuestionStatus;
import app.kaiz.community.infrastructure.AnswerRepository;
import app.kaiz.community.infrastructure.CommunityMemberRepository;
import app.kaiz.community.infrastructure.QuestionRepository;
import app.kaiz.shared.exception.BadRequestException;
import app.kaiz.shared.exception.ResourceNotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Handles community Q&amp;A: questions, answers, upvotes, and acceptance. */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class QAService {

  private final QuestionRepository questionRepository;
  private final AnswerRepository answerRepository;
  private final CommunityMemberRepository memberRepository;
  private final CommunityActivityService activityService;

  @Transactional(readOnly = true)
  public Page<QuestionResponse> getQuestions(
      QuestionStatus status, String tag, int page, int size) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    Page<Question> questions;

    if (status != null && tag != null) {
      questions = questionRepository.findByStatusAndTagsContaining(status, tag, pageable);
    } else if (status != null) {
      questions = questionRepository.findByStatus(status, pageable);
    } else if (tag != null) {
      questions = questionRepository.findByTagsContaining(tag, pageable);
    } else {
      questions = questionRepository.findAll(pageable);
    }

    return questions.map(this::toQuestionResponse);
  }

  @Transactional(readOnly = true)
  public QuestionResponse getQuestion(UUID questionId) {
    Question question =
        questionRepository
            .findById(questionId)
            .orElseThrow(() -> new ResourceNotFoundException("Question not found: " + questionId));
    question.incrementViewCount();
    questionRepository.save(question);
    return toQuestionResponse(question);
  }

  public QuestionResponse createQuestion(UUID authorId, CreateQuestionRequest request) {
    CommunityMember author =
        memberRepository
            .findById(authorId)
            .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + authorId));

    Question question =
        Question.builder()
            .author(author)
            .title(request.title())
            .body(request.body())
            .tags(request.tags() != null ? new ArrayList<>(request.tags()) : new ArrayList<>())
            .status(QuestionStatus.OPEN)
            .build();

    question = questionRepository.save(question);
    return toQuestionResponse(question);
  }

  public AnswerResponse answerQuestion(
      UUID questionId, UUID authorId, CreateAnswerRequest request) {
    Question question =
        questionRepository
            .findById(questionId)
            .orElseThrow(() -> new ResourceNotFoundException("Question not found: " + questionId));
    CommunityMember author =
        memberRepository
            .findById(authorId)
            .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + authorId));

    Answer answer = Answer.builder().question(question).author(author).body(request.body()).build();

    answer = answerRepository.save(answer);
    question.setAnswerCount(question.getAnswerCount() + 1);
    questionRepository.save(question);

    author.setHelpfulAnswers(author.getHelpfulAnswers() + 1);
    memberRepository.save(author);

    activityService.recordActivity(
        author, ActivityType.QUESTION_ANSWERED, "Answered: " + question.getTitle());

    return toAnswerResponse(answer);
  }

  public void upvoteQuestion(UUID questionId, UUID memberId) {
    Question question =
        questionRepository
            .findById(questionId)
            .orElseThrow(() -> new ResourceNotFoundException("Question not found: " + questionId));
    question.toggleUpvote(memberId);
    questionRepository.save(question);
  }

  public void upvoteAnswer(UUID answerId, UUID memberId) {
    Answer answer =
        answerRepository
            .findById(answerId)
            .orElseThrow(() -> new ResourceNotFoundException("Answer not found: " + answerId));
    answer.toggleUpvote(memberId);
    answerRepository.save(answer);
  }

  public void acceptAnswer(UUID questionId, UUID answerId, UUID memberId) {
    Question question =
        questionRepository
            .findById(questionId)
            .orElseThrow(() -> new ResourceNotFoundException("Question not found: " + questionId));

    if (!question.getAuthor().getId().equals(memberId)) {
      throw new BadRequestException("Only question author can accept an answer");
    }

    Answer answer =
        answerRepository
            .findById(answerId)
            .orElseThrow(() -> new ResourceNotFoundException("Answer not found: " + answerId));

    question.setAcceptedAnswerId(answerId);
    question.setStatus(QuestionStatus.ANSWERED);
    answer.setIsAccepted(true);

    questionRepository.save(question);
    answerRepository.save(answer);
  }

  QuestionResponse toQuestionResponse(Question question) {
    List<AnswerResponse> answerResponses =
        question.getAnswers().stream().map(this::toAnswerResponse).collect(Collectors.toList());

    CommunityMemberResponse authorResponse =
        CommunityMemberMapper.toMemberResponse(question.getAuthor());

    return new QuestionResponse(
        question.getId(),
        question.getTitle(),
        question.getBody(),
        authorResponse,
        question.getTags(),
        question.getStatus().name(),
        question.getViewCount(),
        question.getUpvoteCount(),
        question.getAnswerCount(),
        question.getAcceptedAnswerId(),
        answerResponses,
        question.getCreatedAt());
  }

  AnswerResponse toAnswerResponse(Answer answer) {
    CommunityMemberResponse authorResponse =
        CommunityMemberMapper.toMemberResponse(answer.getAuthor());

    return new AnswerResponse(
        answer.getId(),
        answer.getBody(),
        authorResponse,
        answer.getUpvoteCount(),
        answer.getIsVerified(),
        answer.getIsAccepted(),
        answer.getCreatedAt());
  }
}
