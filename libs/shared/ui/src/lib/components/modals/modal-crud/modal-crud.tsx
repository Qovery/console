import { FormEventHandler, ReactNode, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { Button, ButtonSize, ButtonStyle } from '../../buttons/button/button'

export interface ModalCrudProps {
  children: ReactNode
  title: string
  onClose: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  isEdit?: boolean
  loading?: boolean
}

export function ModalCrud(props: ModalCrudProps) {
  const { children, title, isEdit } = props
  const { formState, trigger } = useFormContext()

  useEffect(() => {
    if (props.isEdit) trigger().then()
  }, [trigger, props.isEdit])

  return (
    <div className="p-6">
      <h2 className="h4 text-text-600 mb-6 max-w-sm">{title}</h2>

      <form onSubmit={props.onSubmit}>
        {children}
        <div className="flex gap-3 justify-end mt-6">
          <Button
            className="btn--no-min-w"
            style={ButtonStyle.STROKED}
            size={ButtonSize.XLARGE}
            onClick={() => props.onClose()}
          >
            Cancel
          </Button>
          <Button
            dataTestId="submit-button"
            className="btn--no-min-w"
            type="submit"
            size={ButtonSize.XLARGE}
            disabled={!formState.isValid}
            loading={props.loading}
          >
            {isEdit ? 'Edit' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ModalCrud
