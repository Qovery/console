import * as Dialog from '@radix-ui/react-dialog'
import { Button, ExternalLink, useModal } from '@qovery/shared/ui'
import { BLUEPRINT_RELEASE_NOTES_URL } from './blueprint-update-utils'

export interface BlueprintUpdateNoInputConfirmationModalProps {
  onConfirm: () => void
  title: string
}

export function BlueprintUpdateNoInputConfirmationModal({
  onConfirm,
  title,
}: BlueprintUpdateNoInputConfirmationModalProps) {
  const { closeModal } = useModal()

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex flex-col gap-2 pr-12">
        <Dialog.Title asChild>
          <h2 className="text-xl font-medium leading-7 text-neutral">{title}</h2>
        </Dialog.Title>
      </div>
      <div className="flex items-center justify-between gap-3">
        <ExternalLink href={BLUEPRINT_RELEASE_NOTES_URL} color="brand" size="sm" underline>
          Release notes
        </ExternalLink>
        <div className="flex gap-3">
          <Button type="button" variant="outline" color="neutral" size="lg" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={() => {
              closeModal()
              onConfirm()
            }}
          >
            Preview changes
          </Button>
        </div>
      </div>
    </div>
  )
}
