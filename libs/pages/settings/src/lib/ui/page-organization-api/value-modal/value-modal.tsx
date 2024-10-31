import { Button, CopyToClipboardButtonIcon, InputText } from '@qovery/shared/ui'

export interface ValueModalProps {
  onClose: () => void
  token: string
}

export function ValueModal(props: ValueModalProps) {
  return (
    <div className="p-6">
      <h2 className="h4 mb-6 max-w-sm truncate text-neutral-400">Your API Token!</h2>

      <InputText
        name="token"
        label="Token"
        value={props.token}
        disabled
        className="mb-1"
        rightElement={<CopyToClipboardButtonIcon className="text-sm text-neutral-400" content={props.token} />}
      />
      <p className="ml-3 text-xs text-neutral-350">
        <strong className="text-neutral-400">Please keep this key safe</strong>, you will not be able to retrieve it
        after...
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <Button data-testid="submit-button" type="submit" onClick={props.onClose} size="lg">
          Close
        </Button>
      </div>
    </div>
  )
}

export default ValueModal
