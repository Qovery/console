import {
  BannerBox,
  BannerBoxEnum,
  ButtonLegacy,
  ButtonLegacySize,
  ButtonLegacyStyle,
  Icon,
  IconAwesomeEnum,
} from '@qovery/shared/ui'

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
      <h2 className="h4 text-neutral-400 max-w-sm truncate mb-6">Change repository</h2>
      <BannerBox
        className="mb-5"
        type={BannerBoxEnum.WARNING}
        title="Access to the current repository"
        message="If you do not have access to the current repository, you will not be able to select it again after modification."
        icon={IconAwesomeEnum.CIRCLE_INFO}
      />
      <div className="relative flex items-center w-full h-[52px] px-4 py-2 border rounded">
        <Icon name={currentProvider} className="mr-3 w-4 h-4" width="16px" height="16px" />
        <p className="text-sm text-neutral-400">{currentRepository}</p>
        <Icon name={IconAwesomeEnum.TRIANGLE_EXCLAMATION} className="absolute top-3 right-4 text-yellow-500" />
      </div>
      <div className="flex gap-3 justify-end mt-6">
        <ButtonLegacy
          dataTestId="cancel-button"
          className="btn--no-min-w"
          style={ButtonLegacyStyle.STROKED}
          size={ButtonLegacySize.XLARGE}
          onClick={() => onClose()}
        >
          Cancel
        </ButtonLegacy>
        <ButtonLegacy
          dataTestId="submit-button"
          size={ButtonLegacySize.XLARGE}
          onClick={() => {
            onSubmit && onSubmit()
            onClose()
          }}
        >
          I understand
        </ButtonLegacy>
      </div>
    </div>
  )
}

export default ConfirmationGitModal
