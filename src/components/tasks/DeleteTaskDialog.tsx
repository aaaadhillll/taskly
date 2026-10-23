import { goBack, links, useRoute } from "@/hooks/useRoute"
import { useTasks } from "@/hooks/useTasks"
import { useUi } from "@/hooks/useUi"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"

/** The one confirmation for deleting a task from a list menu. */
export function DeleteTaskDialog() {
  const { deleteRequest, requestDelete } = useUi()
  const { remove } = useTasks()
  const route = useRoute()
  return (
    <ConfirmDialog
      open={deleteRequest !== null}
      title="Delete this task?"
      message={deleteRequest ? `"${deleteRequest.title}" will be removed for good.` : ""}
      confirmLabel="Delete"
      onCancel={() => requestDelete(null)}
      onConfirm={() => {
        if (deleteRequest) remove(deleteRequest.id)
        requestDelete(null)
        // Deleting the task whose page you are on would leave a dead page: go back instead
        if (deleteRequest && route.name === "task" && route.id === deleteRequest.id) goBack(links.home)
      }}
    />
  )
}
