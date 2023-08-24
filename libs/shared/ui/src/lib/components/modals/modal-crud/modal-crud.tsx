import { type FormEventHandler, type ReactNode, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { type ApplicationEntity } from '@qovery/shared/interfaces'
import { Button, ButtonSize, ButtonStyle } from '../../buttons/button/button'
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
  } = props
  const { formState, trigger } = useFormContext()

  useEffect(() => {
    if (isEdit) trigger().then()
  }, [trigger, isEdit])

  return (
    <div className="p-6">
      <h2 className={`h4 text-neutral-400 max-w-sm truncate ${description ? 'mb-1' : 'mb-6'}`}>{title}</h2>
      {description && <p className="mb-6 text-neutral-350 text-sm">{description}</p>}
      {forService && (
        <div className={`text-neutral-400 text-sm mb-6 flex justify-between items-center -mt-2`}>
          <p>
            For{' '}
            <strong className="text-neutral-400 font-medium">
              <Truncate truncateLimit={60} text={forService.name || ''} />
            </strong>
          </p>
        </div>
      )}
      <form onSubmit={onSubmit}>
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
