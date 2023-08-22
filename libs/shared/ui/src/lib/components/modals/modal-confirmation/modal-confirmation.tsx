import { Controller, useForm } from 'react-hook-form'
import BannerBox, { BannerBoxEnum } from '../../banner-box/banner-box'
import Button, { ButtonStyle } from '../../buttons/button/button'
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
}

export function ModalConfirmation(props: ModalConfirmationProps) {
  const {
    title,
    description,
    name,
    callback,
    warning,
    isDelete = false,
    placeholder = isDelete ? 'Enter "delete"' : 'Enter the current name',
    ctaButton = 'Confirm',
  } = props

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
      <h2 className="h4 text-zinc-400 mb-2 max-w-sm">{title}</h2>
      {warning && (
        <BannerBox
          className="mb-2"
          type={BannerBoxEnum.WARNING}
          message={warning}
          icon={IconAwesomeEnum.TRIANGLE_EXCLAMATION}
        />
      )}
      <div className="text-zinc-350 text-sm mb-6">
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
              className="mb-6"
              placeholder={placeholder}
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        <div className="flex gap-3 justify-end">
          <Button className="btn--no-min-w" style={ButtonStyle.STROKED} onClick={() => closeModal()}>
            Cancel
          </Button>
          <Button className="btn--no-min-w" style={isDelete ? ButtonStyle.ERROR : ButtonStyle.BASIC} type="submit">
            {ctaButton}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ModalConfirmation
