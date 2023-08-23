import { BannerBox, BannerBoxEnum, Button, ButtonSize, ButtonStyle, IconAwesomeEnum } from '@qovery/shared/ui'

export interface DisconnectionConfirmModalProps {
  onSubmit: (force: boolean) => void
  onClose: () => void
}

export function DisconnectionConfirmModal(props: DisconnectionConfirmModalProps) {
  return (
    <div className="p-6">
      <h2 className="h4 text-neutral-400 max-w-sm truncate mb-6">Disconnect the Qovery Github App</h2>
      <BannerBox
        className="mb-5"
        type={BannerBoxEnum.WARNING}
        title="This action might affect your future deployment"
        message="Removing the Qovery Github App will reset the permission access to your repositories. After the removal, Qovery will use your Github account to access them. Make sure that your Github account has the access permissions to all the repositories shown in the “Authorised Repositories” section."
        icon={IconAwesomeEnum.CIRCLE_INFO}
      />
      <div className="flex gap-3 justify-end mt-6">
        <Button
          dataTestId="cancel-button"
          className="btn--no-min-w"
          style={ButtonStyle.STROKED}
          size={ButtonSize.XLARGE}
          onClick={() => props.onClose()}
        >
          Cancel
        </Button>
        <Button
          dataTestId="submit-button"
          size={ButtonSize.XLARGE}
          style={ButtonStyle.ERROR}
          onClick={() => {
            props.onSubmit && props.onSubmit(true)
            props.onClose()
          }}
        >
          Disconnect
        </Button>
      </div>
    </div>
  )
}

export default DisconnectionConfirmModal
