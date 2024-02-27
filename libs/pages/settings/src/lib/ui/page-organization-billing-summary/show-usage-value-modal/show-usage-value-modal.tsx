import {
  ButtonLegacy,
  ButtonLegacySize,
  Callout,
  CopyToClipboardButtonIcon,
  Icon,
  IconAwesomeEnum,
  InputText,
} from '@qovery/shared/ui'

export interface ShowUsageValueModalProps {
  onClose: () => void
  url: string
  url_expires_in_hours: number
}

export function ShowUsageValueModal(props: ShowUsageValueModalProps) {
  return (
    <div className="p-6">
      <h2 className="h4 text-neutral-400 max-w-sm truncate mb-6">Your report is ready 🎊</h2>

      <Callout.Root className="mb-5" color="yellow">
        <Callout.Icon>
          <Icon name={IconAwesomeEnum.TRIANGLE_EXCLAMATION} />
        </Callout.Icon>
        <Callout.Text className="text-xs">
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
        rightElement={<CopyToClipboardButtonIcon className="text-neutral-400 text-sm" content={props.url} />}
      />
      <div className="flex gap-3 justify-end mt-6">
        <ButtonLegacy
          dataTestId="submit-button"
          className="btn--no-min-w"
          onClick={props.onClose}
          size={ButtonLegacySize.XLARGE}
        >
          Close
        </ButtonLegacy>
      </div>
    </div>
  )
}

export default ShowUsageValueModal
