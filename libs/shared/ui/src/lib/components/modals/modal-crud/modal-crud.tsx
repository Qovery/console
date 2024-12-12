import { type FormEventHandler, type ReactNode, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import Button from '../../button/button'
import Icon from '../../icon/icon'
import { Popover } from '../../popover/popover'
import Truncate from '../../truncate/truncate'

export interface ModalCrudProps {
  children: ReactNode
  title: string
  onClose: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  isEdit?: boolean
  loading?: boolean
  description?: ReactNode
  submitLabel?: string
  forServiceName?: string
  onDelete?: () => void
  deleteButtonLabel?: string
  howItWorks?: ReactNode
}

export function ModalCrud(props: ModalCrudProps) {
  const {
    onSubmit,
    onClose,
    loading,
    children,
    title,
    isEdit,
    description,
    forServiceName,
    onDelete,
    submitLabel,
    deleteButtonLabel,
    howItWorks = null,
  } = props
  const { formState, trigger } = useFormContext()

  useEffect(() => {
    if (isEdit) trigger().then()
  }, [trigger, isEdit])

  return (
    <div className="p-5">
      <h2 className="h4 max-w-sm truncate text-neutral-400 dark:text-neutral-50">{title}</h2>
      {description && <p className="mt-2 text-sm text-neutral-350 dark:text-neutral-50">{description}</p>}
      {forServiceName && (
        <div className="mt-4 flex items-center justify-between text-sm text-neutral-400 dark:text-neutral-50">
          <p>
            For{' '}
            <strong className="font-medium text-neutral-400 dark:text-neutral-50">
              <Truncate truncateLimit={60} text={forServiceName} />
            </strong>
          </p>
        </div>
      )}
      {howItWorks && (
        <Popover.Root>
          <Popover.Trigger>
            <span className="mt-2 cursor-pointer text-sm font-medium text-brand-500 transition hover:text-brand-600">
              Show how it works <Icon className="text-xs" iconStyle="regular" iconName="circle-question" />
            </span>
          </Popover.Trigger>
          <Popover.Content side="left" className="relative text-sm text-neutral-350" style={{ width: 440 }}>
            <h6 className="mb-2 font-medium text-neutral-400">How it works</h6>
            {howItWorks}
            <Popover.Close className="absolute right-4 top-4">
              <button type="button">
                <Icon name="icon-solid-xmark text-lg leading-4 font-thin text-neutral-400" />
              </button>
            </Popover.Close>
          </Popover.Content>
        </Popover.Root>
      )}
      <form className="mt-6" onSubmit={onSubmit}>
        {children}
        <div className="mt-6 flex justify-end gap-3">
          {isEdit && onDelete ? (
            <Button data-testid="delete-button" color="red" size="lg" onClick={() => onDelete()}>
              {deleteButtonLabel || 'Delete'}
            </Button>
          ) : (
            <Button
              data-testid="cancel-button"
              type="button"
              variant="plain"
              color="neutral"
              size="lg"
              onClick={() => onClose()}
            >
              Cancel
            </Button>
          )}
          <Button
            data-testid="submit-button"
            type="submit"
            color="brand"
            size="lg"
            disabled={!formState.isValid}
            loading={loading}
          >
            {submitLabel || (isEdit ? 'Confirm' : 'Create')}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ModalCrud
