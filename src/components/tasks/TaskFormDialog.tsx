import { CalendarDays, ChevronRight, Clock, Flag, Layers, Plus, Repeat as RepeatIcon, Tag, X } from "lucide-react"
import { useRef, useState, type FormEvent, type ReactNode } from "react"
import { categoryInfo } from "@/data/categories"
import { useCategories } from "@/hooks/useCategories"
import { links, navigate, useRoute } from "@/hooks/useRoute"
import { useTasks } from "@/hooks/useTasks"
import { useUi, type FormRequest } from "@/hooks/useUi"
import type { CategoryId, Priority, Repeat, Subtask } from "@/types/task"
import { cn } from "@/utils/cn"
import { formatDate, formatTime, todayKey } from "@/utils/date"
import { newId } from "@/utils/id"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"

const PRIORITIES: { value: Priority; label: string; dot: string }[] = [
  { value: "low", label: "Low", dot: "bg-[#9a9d96]" },
  { value: "medium", label: "Medium", dot: "bg-[#ffb547]" },
  { value: "high", label: "High", dot: "bg-[#ff5b5b]" },
]
const REPEATS: { value: Repeat; label: string }[] = [
  { value: "none", label: "Never" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
]

/** The create / edit form: a full-screen page on phones, a panel from md up. */
export function TaskFormDialog() {
  const { form, closeForm } = useUi()
  return (
    <Modal open={form !== null} onClose={closeForm} labelledBy="task-form-title">
      {form && <TaskForm request={form} onClose={closeForm} />}
    </Modal>
  )
}

const focusRing = "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-[-2px] has-[:focus-visible]:outline-ring"

/**
 * A row like "Date  Sat, Sep 27 >". The real control (a native date, time or select) is laid
 * invisibly over the whole row, so a tap anywhere opens the platform's own picker and keyboard and
 * screen-reader users get an ordinary, labelled control.
 */
function PickerRow({ icon: Icon, label, value, children }: { icon: typeof Tag; label: string; value: ReactNode; children: ReactNode }) {
  return (
    <div className={cn("relative flex min-h-14 items-center gap-3 border-t border-line first:border-t-0", focusRing)}>
      <Icon aria-hidden className="size-5 shrink-0 text-muted" />
      <span className="text-[15px] font-medium text-muted">{label}</span>
      <span aria-hidden className="ml-auto flex items-center gap-2 text-[15px] font-bold">
        {value}
        <ChevronRight className="size-4 text-muted" />
      </span>
      {children}
    </div>
  )
}

const overlay = "absolute inset-0 size-full cursor-pointer opacity-0"

function TaskForm({ request, onClose }: { request: FormRequest; onClose: () => void }) {
  const editing = request.task
  const { add, update } = useTasks()
  const ui = useUi()
  const route = useRoute()
  const { allCategories } = useCategories()

  const [title, setTitle] = useState(editing?.title ?? "")
  const [description, setDescription] = useState(editing?.description ?? "")
  const [dueDate, setDueDate] = useState(editing?.dueDate ?? request.dueDate ?? todayKey())
  const [dueTime, setDueTime] = useState(editing?.dueTime ?? "")
  const [category, setCategory] = useState<CategoryId>(editing?.category ?? request.category ?? "personal")
  const [priority, setPriority] = useState<Priority>(editing?.priority ?? "medium")
  const [repeat, setRepeat] = useState<Repeat>(editing?.repeat ?? "none")
  const [tags, setTags] = useState<string[]>(editing?.tags ?? [])
  const [tagDraft, setTagDraft] = useState("")
  const [steps, setSteps] = useState<Subtask[]>(editing?.subtasks ?? [])
  const [stepDraft, setStepDraft] = useState("")
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string }>({})
  const titleRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const stepRef = useRef<HTMLInputElement>(null)

  /** Adds a tag from `raw` (the field's text, minus a trailing comma) and clears the field. */
  const addTag = (raw = tagDraft) => {
    const text = raw.replace(/,+$/, "").trim()
    if (text && !tags.some((t) => t.toLowerCase() === text.toLowerCase())) setTags((prev) => [...prev, text])
    setTagDraft("")
  }

  function addStep() {
    const text = stepDraft.trim()
    if (!text) return
    setSteps((prev) => [...prev, { id: newId(), title: text, done: false }])
    setStepDraft("")
    stepRef.current?.focus()
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const next = { title: title.trim() ? undefined : "Give the task a title", dueDate: dueDate ? undefined : "Pick a day" }
    setErrors(next)
    if (next.title) return titleRef.current?.focus()
    if (next.dueDate) return dateRef.current?.focus()

    // A tag or step typed but not confirmed still counts
    const pendingTag = tagDraft.trim().replace(/,+$/, "").trim()
    const pendingStep = stepDraft.trim()
    const draft = {
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      repeat,
      dueDate,
      dueTime,
      tags: pendingTag && !tags.some((t) => t.toLowerCase() === pendingTag.toLowerCase()) ? [...tags, pendingTag] : tags,
      subtasks: pendingStep ? [...steps, { id: newId(), title: pendingStep, done: false }] : steps,
    }

    if (editing) {
      update(editing.id, draft)
    } else {
      add(draft)
      // Show the new task: jump to its day and clear anything that would hide it
      ui.setSelectedDate(dueDate)
      ui.setTab("today")
      ui.setCategory("all")
      ui.setPriority("all")
      ui.setQuery("")
      if (route.name !== "home" && route.name !== "tasks" && route.name !== "calendar" && route.name !== "category") navigate(links.home)
    }
    onClose()
  }

  const pick = (el: HTMLInputElement) => {
    try {
      el.showPicker()
    } catch {
      // Not supported here: the input is still focusable and typeable
    }
  }
  const priorityInfo = PRIORITIES.find((p) => p.value === priority)!

  return (
    <form onSubmit={submit} noValidate className="flex min-h-full flex-col px-5 pb-8 pt-3 md:p-8">
      <header className="relative flex min-h-11 items-center justify-center pb-3">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute left-0 grid size-11 place-items-center rounded-full text-text transition-colors duration-150 hover:bg-text/10"
        >
          <X aria-hidden className="size-6" />
        </button>
        <h2 id="task-form-title" className="text-base font-bold md:text-lg">
          {editing ? "Edit Task" : "Add New Task"}
        </h2>
      </header>

      <div>
        <div className="space-y-2.5">
          <label className={cn("block rounded-2xl bg-surface px-4 py-3 md:bg-elevated", focusRing)}>
            <span className="block text-xs font-semibold text-muted">Task title</span>
            <input
              ref={titleRef}
              data-autofocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              autoComplete="off"
              placeholder="What needs doing?"
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={errors.title ? "task-title-error" : undefined}
              className="mt-0.5 w-full bg-transparent text-[15px] font-bold text-text outline-none placeholder:font-medium placeholder:text-muted"
            />
          </label>
          {errors.title && (
            <p id="task-title-error" role="alert" className="px-1 text-sm font-semibold text-danger-text">
              {errors.title}
            </p>
          )}
          <label className={cn("block rounded-2xl bg-surface px-4 py-3 md:bg-elevated", focusRing)}>
            <span className="block text-xs font-semibold text-muted">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Optional details"
              className="mt-0.5 w-full resize-none bg-transparent text-[15px] font-medium text-text outline-none placeholder:text-muted"
            />
          </label>
        </div>

        <div className="mt-2">
          <PickerRow icon={CalendarDays} label="Date" value={dueDate ? formatDate(dueDate, { weekday: "short", month: "short", day: "numeric" }) : "Pick a day"}>
            <input
              ref={dateRef}
              type="date"
              aria-label="Date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              onClick={(e) => pick(e.currentTarget)}
              aria-invalid={errors.dueDate ? true : undefined}
              className={overlay}
            />
          </PickerRow>
          {errors.dueDate && (
            <p role="alert" className="px-1 pb-2 text-sm font-semibold text-danger-text">
              {errors.dueDate}
            </p>
          )}
          <PickerRow icon={Clock} label="Time" value={dueTime ? formatTime(dueTime) : "Any time"}>
            <input type="time" aria-label="Time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} onClick={(e) => pick(e.currentTarget)} className={overlay} />
          </PickerRow>
          <PickerRow
            icon={Layers}
            label="Category"
            value={
              <>
                <span aria-hidden className={cn("size-2.5 rounded-full", categoryInfo(category).dot)} />
                {categoryInfo(category).label}
              </>
            }
          >
            <select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value as CategoryId)} className={overlay}>
              {allCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </PickerRow>
          <PickerRow
            icon={Flag}
            label="Priority"
            value={
              <>
                <span aria-hidden className={cn("size-2.5 rounded-full", priorityInfo.dot)} />
                {priorityInfo.label}
              </>
            }
          >
            <select aria-label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={overlay}>
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </PickerRow>
          <PickerRow icon={RepeatIcon} label="Repeat" value={REPEATS.find((r) => r.value === repeat)?.label}>
            <select aria-label="Repeat" value={repeat} onChange={(e) => setRepeat(e.target.value as Repeat)} className={overlay}>
              {REPEATS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </PickerRow>

          <div className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-2 border-t border-line py-2">
            <Tag aria-hidden className="size-5 shrink-0 text-muted" />
            <span className="text-[15px] font-medium text-muted">Tags</span>
            <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-1.5">
              {tags.map((tag, i) => (
                <span key={tag} className={cn("inline-flex items-center gap-1 rounded-full py-1 pl-3 pr-1 text-[13px] font-bold", allCategories[i % allCategories.length]!.tint)}>
                  {tag}
                  <button type="button" aria-label={`Remove tag ${tag}`} onClick={() => setTags((prev) => prev.filter((t) => t !== tag))} className="grid size-6 place-items-center rounded-full hover:bg-text/10">
                    <X aria-hidden className="size-3.5" />
                  </button>
                </span>
              ))}
              <input
                aria-label="Add a tag"
                value={tagDraft}
                onChange={(e) => (e.target.value.endsWith(",") ? addTag(e.target.value) : setTagDraft(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return
                  e.preventDefault() // Enter here adds a tag; it must not submit the whole task
                  addTag()
                }}
                onBlur={() => addTag()}
                maxLength={20}
                autoComplete="off"
                placeholder="Add tag"
                className="h-11 w-24 rounded-full bg-transparent px-2 text-[13px] font-semibold text-text outline-none placeholder:font-medium placeholder:text-muted focus-visible:bg-surface md:focus-visible:bg-elevated"
              />
            </div>
          </div>
        </div>

        <div className="mt-2 border-t border-line pt-3">
          <div className="flex items-center justify-between">
            <label htmlFor="task-step" className="text-base font-extrabold">
              Subtasks
            </label>
            <button
              type="button"
              aria-label="Add subtask"
              onClick={() => (stepDraft.trim() ? addStep() : stepRef.current?.focus())}
              className="grid size-11 place-items-center rounded-full text-text transition-colors duration-150 hover:bg-text/10"
            >
              <Plus aria-hidden className="size-5" strokeWidth={2.75} />
            </button>
          </div>
          <ul>
            {steps.map((step) => (
              <li key={step.id} className="flex items-center gap-1">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={step.done}
                  aria-label={`Mark "${step.title}" as ${step.done ? "not done" : "done"}`}
                  onClick={() => setSteps((prev) => prev.map((s) => (s.id === step.id ? { ...s, done: !s.done } : s)))}
                  className="group grid size-11 shrink-0 place-items-center"
                >
                  <span aria-hidden className={cn("grid size-[1.625rem] place-items-center rounded-full border-2", step.done ? "border-check bg-check text-on-check" : "border-muted")}>
                    {step.done && <span className="size-2 rounded-full bg-current" />}
                  </span>
                </button>
                <span className={cn("min-w-0 flex-1 break-words text-[15px] font-semibold", step.done && "text-muted line-through")}>{step.title}</span>
                <button
                  type="button"
                  aria-label={`Remove step "${step.title}"`}
                  onClick={() => setSteps((prev) => prev.filter((s) => s.id !== step.id))}
                  className="grid size-11 place-items-center rounded-full text-muted transition-colors duration-150 hover:bg-text/10 hover:text-text"
                >
                  <X aria-hidden className="size-4" />
                </button>
              </li>
            ))}
            <li className="flex items-center gap-1">
              <span aria-hidden className="grid size-11 shrink-0 place-items-center">
                <span className="size-[1.625rem] rounded-full border-2 border-dashed border-muted" />
              </span>
              <input
                id="task-step"
                ref={stepRef}
                value={stepDraft}
                onChange={(e) => setStepDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return
                  e.preventDefault() // Enter here adds a step; it must not submit the whole task
                  addStep()
                }}
                maxLength={80}
                autoComplete="off"
                placeholder="Add subtask"
                className="h-11 min-w-0 flex-1 rounded-xl bg-transparent px-1 text-[15px] font-semibold text-text outline-none placeholder:font-medium placeholder:text-muted focus-visible:bg-surface md:focus-visible:bg-elevated"
              />
            </li>
          </ul>
        </div>

        <Button type="submit" size="lg" className="mt-4 w-full">
          {editing ? "Save Changes" : "Create Task"}
        </Button>
      </div>
    </form>
  )
}
