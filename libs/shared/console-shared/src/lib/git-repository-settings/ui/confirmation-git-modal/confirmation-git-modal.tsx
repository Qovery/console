import { Button, Callout, Icon } from '@qovery/shared/ui'

export interface ConfirmationGitModalProps {
  currentProvider: string
  currentRepository: string
  onSubmit: () => void
  onClose: () => void
}

export function ConfirmationGitModal({
  currentRepository,
  currentProvider,
  onSubmit,
  onClose,
}: ConfirmationGitModalProps) {
  return (
    <div className="p-6">
      <h2 className="h4 mb-6 max-w-sm truncate text-neutral-400">Change repository</h2>
      <Callout.Root className="mb-5" color="yellow">
        <Callout.Icon>
          <Icon iconName="circle-info" iconStyle="regular" />
        </Callout.Icon>
        <Callout.Text>
          <Callout.TextHeading>Access to the current repository</Callout.TextHeading>
          <Callout.TextDescription>
            If you do not have access to the current repository, you will not be able to select it again after
            modification.
          </Callout.TextDescription>
        </Callout.Text>
      </Callout.Root>
      <div className="relative flex h-[52px] w-full items-center rounded border px-4 py-2">
        <Icon name={currentProvider} className="mr-3 h-4 w-4" width="16px" height="16px" />
        <p className="text-sm text-neutral-400">{currentRepository}</p>
        <Icon iconName="triangle-exclamation" className="absolute right-4 top-4 text-yellow-500" />
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button
          data-testid="cancel-button"
          type="button"
          color="neutral"
          variant="plain"
          size="lg"
          onClick={() => onClose()}
        >
          Cancel
        </Button>
        <Button
          data-testid="submit-button"
          size="lg"
          type="button"
          onClick={() => {
            onSubmit()
            onClose()
          }}
        >
          I understand
        </Button>
      </div>
    </div>
  )
}

export default ConfirmationGitModal
