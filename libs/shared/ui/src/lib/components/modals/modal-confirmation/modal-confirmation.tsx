import { Controller, useForm } from 'react-hook-form'
import BannerBox, { BannerBoxEnum } from '../../banner-box/banner-box'
import ButtonLegacy, { ButtonLegacyStyle } from '../../buttons/button-legacy/button-legacy'
import { Icon } from '../../icon/icon'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'
import InputTextSmall from '../../inputs/input-text-small/input-text-small'
import useModal from '../../modal/use-modal/use-modal'
import { Tooltip } from '../../tooltip/tooltip'

export interface ModalConfirmationProps {
  title: string
  description?: string
  name?: string
  callback: () => void
  warning?: string
  placeholder?: string
  ctaButton?: string
  isDelete?: boolean
  content?: React.ReactNode
}

export function ModalConfirmation({
  title,
  description,
  name,
  callback,
  warning,
  isDelete = false,
  placeholder = isDelete ? 'Enter "delete"' : 'Enter the current name',
  ctaButton = 'Confirm',
  content,
}: ModalConfirmationProps) {
  const { handleSubmit, control } = useForm()
  const { closeModal } = useModal()

  const onSubmit = handleSubmit((data) => {
    if (data) {
      closeModal()
      callback()
    }
  })

  const copyToClipboard = () => {
    name && navigator.clipboard.writeText(name)
  }

  return (
    <div className="p-6">
      <h2 className="h4 text-neutral-400 mb-2 max-w-sm">{title}</h2>
      {warning && (
        <BannerBox
          className="mb-2"
          type={BannerBoxEnum.WARNING}
          message={warning}
          icon={IconAwesomeEnum.TRIANGLE_EXCLAMATION}
        />
      )}
      <div className="text-neutral-350 text-sm mb-6">
        {isDelete ? (
          description ? (
            description
          ) : (
            <>
              To confirm the deletion of <strong>{name}</strong>, please type "delete"
            </>
          )
        ) : (
          <>
            {description}
            <Tooltip content="Copy">
              <span
                data-testid="copy-cta"
                onClick={copyToClipboard}
                className="link inline cursor-pointer text-sky-500 text-sm ml-1 truncate max-w-[250px]"
              >
                {name} <Icon name="icon-solid-copy" />
              </span>
            </Tooltip>
          </>
        )}
      </div>
      <form onSubmit={onSubmit}>
        <Controller
          name="name"
          control={control}
          rules={{
            required: isDelete ? 'Please enter "delete".' : 'Please enter a name.',
            validate: (value) =>
              (isDelete ? value === 'delete' : value === name) ||
              (isDelete ? 'Please confirm by entering "delete".' : 'Please enter the right name.'),
          }}
          defaultValue=""
          render={({ field, fieldState: { error } }) => (
            <InputTextSmall
              className="mb-5"
              placeholder={placeholder}
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        {content}
        <div className="flex gap-3 justify-end">
          <ButtonLegacy className="btn--no-min-w" style={ButtonLegacyStyle.STROKED} onClick={() => closeModal()}>
            Cancel
          </ButtonLegacy>
          <ButtonLegacy
            className="btn--no-min-w"
            style={isDelete ? ButtonLegacyStyle.ERROR : ButtonLegacyStyle.BASIC}
            type="submit"
          >
            {ctaButton}
          </ButtonLegacy>
        </div>
      </form>
    </div>
  )
}

export default ModalConfirmation
