import { Controller, useForm } from 'react-hook-form'
import Button, { ButtonStyle } from '../../buttons/button/button'
import InputTextSmall from '../../inputs/input-text-small/input-text-small'
import { Icon } from '../../icon/icon'

export interface ModalConfirmationProps {
  title: string
  description: string
  name: string
  callback: () => void
  setOpen?: (open: boolean) => void
  placeholder?: string
  ctaButton?: string
}

export function ModalConfirmation(props: ModalConfirmationProps) {
  const {
    title,
    description,
    name,
    callback,
    setOpen,
    placeholder = 'Enter the current name',
    ctaButton = 'Confirm',
  } = props

  const { handleSubmit, control } = useForm()

  const onSubmit = handleSubmit((data) => {
    if (data) {
      setOpen && setOpen(false)
      callback()
    }
  })

  const copyToClipboard = () => {
    navigator.clipboard.writeText(name)
  }

  return (
    <div className="p-6">
      <h2 className="h4 text-text-600 mb-2 max-w-sm">{title}</h2>
      <p className="flex items-center text-text-400 text-sm mb-6">
        {description}
        <span
          data-testid="copy-cta"
          onClick={copyToClipboard}
          className="link cursor-pointer text-accent2-500 text-sm ml-1"
        >
          {name} <Icon name="icon-solid-copy" />
        </span>
      </p>
      <form onSubmit={onSubmit}>
        <Controller
          name="name"
          control={control}
          rules={{
            required: 'Please enter a name.',
            validate: (value) => value === name || 'Please enter the right name.',
          }}
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
          <Button className="btn--no-min-w" style={ButtonStyle.STROKED} onClick={() => setOpen && setOpen(false)}>
            Cancel
          </Button>
          <Button className="btn--no-min-w" type="submit">
            {ctaButton}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ModalConfirmation
