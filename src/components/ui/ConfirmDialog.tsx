import { Button } from "./Button"
import { Modal } from "./Modal"

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

/** Asks before anything destructive. Cancel takes the initial focus, so Enter can't delete by accident. */
export function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} labelledBy="confirm-title" size="small">
      <div className="p-7">
        <h2 id="confirm-title" className="text-2xl font-extrabold tracking-tight">
          {title}
        </h2>
        <p className="mt-3 text-[17px] font-medium text-muted">{message}</p>
        <div className="mt-8 grid grid-cols-2 gap-3">
          <Button variant="secondary" data-autofocus onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
