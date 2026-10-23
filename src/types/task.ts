export type Priority = "low" | "medium" | "high"
export type CategoryId = string
export type Repeat = "none" | "daily" | "weekly" | "monthly"

export interface Subtask {
  id: string
  title: string
  done: boolean
}

export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  priority: Priority
  category: CategoryId
  tags: string[]
  /** Local calendar day, YYYY-MM-DD */
  dueDate: string
  /** 24-hour HH:mm, or "" for "any time that day" */
  dueTime: string
  repeat: Repeat
  subtasks: Subtask[]
  /** ISO timestamps */
  createdAt: string
  updatedAt: string
  /** Set while completed. Stats and the streak count from this, not from updatedAt. */
  completedAt: string | null
}

/** What the create/edit form produces */
export type TaskDraft = Pick<
  Task,
  "title" | "description" | "priority" | "category" | "tags" | "dueDate" | "dueTime" | "repeat" | "subtasks"
>

export type StatusTab = "today" | "upcoming" | "completed"
export type SortKey = "smart" | "priority" | "newest" | "title"
export type PriorityFilter = "all" | Priority
export type StatsRange = "week" | "month" | "year"
