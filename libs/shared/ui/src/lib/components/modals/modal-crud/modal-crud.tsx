import { type FormEventHandler, type ReactNode, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import Button from '../../button/button'
import Icon from '../../icon/icon'
import { LoaderSpinner } from '../../loader-spinner/loader-spinner'
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
  customLoader?: ReactNode
  forwardRef?: React.RefObject<HTMLDivElement>
  bottomButtons?: ReactNode
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
    customLoader = null,
    forwardRef,
    bottomButtons,
  } = props
  const { formState, trigger } = useFormContext()

  useEffect(() => {
    if (isEdit) trigger().then()
  }, [trigger, isEdit])

  return (
    <div className="p-5" ref={forwardRef}>
      <h2 className="h4 max-w-sm truncate text-neutral">{title}</h2>
      {description && <p className="mt-2 text-sm text-neutral-subtle">{description}</p>}
      {forServiceName && (
        <div className="mt-4 flex items-center justify-between text-sm text-neutral-subtle">
          <p>
            For{' '}
            <strong className="font-medium">
              <Truncate truncateLimit={60} text={forServiceName} />
            </strong>
          </p>
        </div>
      )}
      {howItWorks && (
        <Popover.Root>
          <Popover.Trigger>
            <button
              type="button"
              className="hover:text-brandHover mt-2 cursor-pointer text-sm font-medium text-brand transition"
            >
              Show how it works <Icon className="text-xs" iconStyle="regular" iconName="circle-question" />
            </button>
          </Popover.Trigger>
          <Popover.Content side="left" className="relative z-50 text-sm text-neutral-subtle" style={{ width: 440 }}>
            <h6 className="mb-2 font-medium text-neutral">How it works</h6>
            {howItWorks}
            <Popover.Close className="absolute right-4 top-4">
              <button type="button">
                <Icon iconName="xmark" className="text-sm" />
              </button>
            </Popover.Close>
          </Popover.Content>
        </Popover.Root>
      )}
      <form className="mt-6" onSubmit={onSubmit}>
        {children}
        <div className="mt-6 flex justify-end gap-3">
          {bottomButtons}
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
          {isEdit && onDelete && (
            <Button
              data-testid="delete-button"
              type="button"
              variant="outline"
              color="red"
              size="lg"
              onClick={() => onDelete()}
            >
              {deleteButtonLabel || 'Delete'}
            </Button>
          )}
          <Button
            data-testid="submit-button"
            type="submit"
            color="brand"
            size="lg"
            disabled={!formState.isValid || (!!customLoader && loading)}
            loading={loading && !customLoader}
          >
            {customLoader && loading ? (
              <div className="flex items-center gap-2">
                <LoaderSpinner className="m-auto" /> {customLoader}
              </div>
            ) : (
              submitLabel || (isEdit ? 'Confirm' : 'Create')
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ModalCrud
