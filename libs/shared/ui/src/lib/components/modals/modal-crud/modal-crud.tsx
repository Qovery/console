import { type FormEventHandler, type ReactNode, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { type ApplicationEntity } from '@qovery/shared/interfaces'
import { Button, ButtonSize, ButtonStyle } from '../../buttons/button/button'
import Icon from '../../icon/icon'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'
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
  forService?: ApplicationEntity
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
    forService,
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
    <div className="p-6">
      <h2 className="h4 text-neutral-400 max-w-sm truncate">{title}</h2>
      {description && <p className="mt-1 text-neutral-350 text-sm">{description}</p>}
      {forService && (
        <div className="text-neutral-400 text-sm flex justify-between items-center mt-4">
          <p>
            For{' '}
            <strong className="text-neutral-400 font-medium">
              <Truncate truncateLimit={60} text={forService.name || ''} />
            </strong>
          </p>
        </div>
      )}
      {howItWorks && (
        <Popover.Root>
          <Popover.Trigger>
            <span className="text-sm cursor-pointer text-brand-500 hover:text-brand-600 transition font-medium">
              Show how it works <Icon name={IconAwesomeEnum.CIRCLE_QUESTION} />
            </span>
          </Popover.Trigger>
          <Popover.Content side="left" className="z-50 text-neutral-350 text-sm relative" style={{ width: 440 }}>
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
            <Button
              dataTestId="delete-button"
              className="btn--no-min-w"
              style={ButtonStyle.ERROR}
              size={ButtonSize.XLARGE}
              onClick={() => onDelete()}
            >
              {deleteButtonLabel || 'Delete'}
            </Button>
          ) : (
            <Button
              dataTestId="cancel-button"
              className="btn--no-min-w"
              style={ButtonStyle.STROKED}
              size={ButtonSize.XLARGE}
              onClick={() => onClose()}
            >
              Cancel
            </Button>
          )}
          <Button
            dataTestId="submit-button"
            className="btn--no-min-w"
            type="submit"
            size={ButtonSize.XLARGE}
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
