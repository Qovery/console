import { Button, CopyToClipboardButtonIcon, InputText } from '@qovery/shared/ui'

export interface ValueModalProps {
  onClose: () => void
  token: string
}

export function ValueModal(props: ValueModalProps) {
  return (
    <div className="p-6">
      <h2 className="h4 text-neutral-400 max-w-sm truncate mb-6">Your API Token!</h2>

      <InputText
        name="token"
        label="Token"
        value={props.token}
        disabled
        className="mb-1"
        rightElement={<CopyToClipboardButtonIcon className="text-neutral-400 text-sm" content={props.token} />}
      />
      <p className="ml-4 text-xs text-neutral-350">
        <strong className="text-neutral-400">Please keep this key safe</strong>, you will not be able to retrieve it
        after...
      </p>

      <div className="flex gap-3 justify-end mt-6">
        <Button data-testid="submit-button" type="submit" onClick={props.onClose} size="lg">
          Close
        </Button>
      </div>
    </div>
  )
}

export default ValueModal
