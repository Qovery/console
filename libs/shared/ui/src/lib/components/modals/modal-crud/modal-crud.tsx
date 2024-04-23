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
  description?: string
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
      <h2 className="h4 text-neutral-400 max-w-sm truncate">{title}</h2>
      {description && <p className="mt-2 text-neutral-350 text-sm">{description}</p>}
      {forServiceName && (
        <div className="text-neutral-400 text-sm flex justify-between items-center mt-4">
          <p>
            For{' '}
            <strong className="text-neutral-400 font-medium">
              <Truncate truncateLimit={60} text={forServiceName} />
            </strong>
          </p>
        </div>
      )}
      {howItWorks && (
        <Popover.Root>
          <Popover.Trigger>
            <span className="text-sm cursor-pointer text-brand-500 hover:text-brand-600 transition font-medium mt-2">
              Show how it works <Icon className="text-xs" iconStyle="regular" iconName="circle-question" />
            </span>
          </Popover.Trigger>
          <Popover.Content side="left" className="text-neutral-350 text-sm relative" style={{ width: 440 }}>
            <h6 className="text-neutral-400 font-medium mb-2">How it works</h6>
            {howItWorks}
            <Popover.Close className="absolute top-4 right-4">
              <button type="button">
                <Icon name="icon-solid-xmark text-lg leading-4 font-thin text-neutral-400" />
              </button>
            </Popover.Close>
          </Popover.Content>
        </Popover.Root>
      )}
      <form className="mt-6" onSubmit={onSubmit}>
        {children}
        <div className="flex gap-3 justify-end mt-6">
          {isEdit && onDelete ? (
            <Button color="red" size="lg" onClick={() => onDelete()}>
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
