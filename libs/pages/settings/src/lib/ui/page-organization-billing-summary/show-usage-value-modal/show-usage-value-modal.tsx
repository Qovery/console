import { Button, Callout, CopyToClipboardButtonIcon, Icon, InputText } from '@qovery/shared/ui'

export interface ShowUsageValueModalProps {
  onClose: () => void
  url: string
  url_expires_in_hours: number
}

export function ShowUsageValueModal(props: ShowUsageValueModalProps) {
  return (
    <div className="p-6">
      <h2 className="h4 mb-6 max-w-sm truncate text-neutral-400">
        Your report is ready{' '}
        <span role="img" aria-label="congrats">
          🎊
        </span>
      </h2>

      <Callout.Root className="mb-5" color="yellow">
        <Callout.Icon>
          <Icon iconName="triangle-exclamation" iconStyle="regular" />
        </Callout.Icon>
        <Callout.Text>
          Please keep this URL safe! It is publicly accessible to anyone who use it. This link expires in{' '}
          {props.url_expires_in_hours} hours.
        </Callout.Text>
      </Callout.Root>
      <InputText
        name="report_url"
        label="Report URL"
        value={props.url}
        disabled
        className="mb-1"
        rightElement={<CopyToClipboardButtonIcon className="text-sm text-neutral-400" content={props.url} />}
      />
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="surface" color="neutral" size="lg" onClick={props.onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}

export default ShowUsageValueModal
