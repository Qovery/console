import { FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { FlowVariableData, VariableData } from '@qovery/shared/interfaces'
import { Button, ButtonSize, ButtonStyle } from '@qovery/shared/ui'
import VariableRow from './variable-row/variable-row'

export interface FlowCreateVariableProps {
  onBack: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  onAdd: () => void
  onRemove: (index: number) => void
  variables: VariableData[]
}

export function FlowCreateVariable(props: FlowCreateVariableProps) {
  const { formState } = useFormContext<FlowVariableData>()

  return (
    <div>
      <div className="mb-10">
        <div className="flex justify-between mb-2 items-center">
          <h3 className="text-text-700 text-lg">Set environment variables</h3>
          <Button size={ButtonSize.TINY} className="btn--no-min-w" onClick={props.onAdd}>
            Add variable
          </Button>
        </div>

        <p className="text-xs text-text-500">
          Blabla Lorem ipsum dolor sit amet, consectetur adipisicing elit. Autem eveniet praesentium sunt veritatis.
          Aliquid aperiam commodi corporis doloremque eos molestiae omnis perspiciatis provident quia saepe tempora
          tenetur totam, voluptates! A.
        </p>
      </div>

      <form onSubmit={props.onSubmit}>
        <div className="mb-10">
          {props.variables?.map((variable, index) => (
            <VariableRow onDelete={props.onRemove} key={index} index={index} />
          ))}
        </div>

        <div className="flex justify-between">
          <Button
            onClick={props.onBack}
            className="btn--no-min-w"
            type="button"
            size={ButtonSize.XLARGE}
            style={ButtonStyle.STROKED}
          >
            Back
          </Button>
          <Button
            dataTestId="button-submit"
            type="submit"
            disabled={!formState.isValid}
            size={ButtonSize.XLARGE}
            style={ButtonStyle.BASIC}
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

export default FlowCreateVariable
