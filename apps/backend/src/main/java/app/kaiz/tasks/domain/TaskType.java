package app.kaiz.tasks.domain;

/** Discriminator for the kind of item stored in the tasks table. */
public enum TaskType {
  TASK,
  EVENT,
  BIRTHDAY
}
