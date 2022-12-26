import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { FlowVariableData, VariableData } from '@qovery/shared/interfaces'
import { Button, ButtonSize, ButtonStyle } from '@qovery/shared/ui'
import VariableRow from '../variable-row/variable-row'

export interface FlowCreateVariableProps {
  onBack: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  onAdd: () => void
  onRemove: (index: number) => void
  variables: VariableData[]
  availableScopes: APIVariableScopeEnum[]
}

export function FlowCreateVariable(props: FlowCreateVariableProps) {
  const { formState } = useFormContext<FlowVariableData>()
  const gridTemplateColumns = '6fr 6fr 204px 2fr 1fr'

  return (
    <div>
      <div className="mb-10">
        <div className="flex justify-between mb-2 items-center">
          <h3 className="text-text-700 text-lg">Set environment variables</h3>
          <Button size={ButtonSize.TINY} className="btn--no-min-w" onClick={props.onAdd}>
            Add variable
          </Button>
        </div>

        <p className="text-xs text-text-500">Define here the variables required by your job</p>
      </div>

      <form onSubmit={props.onSubmit}>
        {props.variables?.length > 0 && (
          <div className="grid mb-3" style={{ gridTemplateColumns }}>
            <span className="text-sm text-text-600 font-medium">Variable</span>
            <span className="text-sm text-text-600 font-medium">Value</span>
            <span className="text-sm text-text-600 font-medium">Scope</span>
            <span className="text-sm text-text-600 font-medium pl-1.5">Secret</span>
            <span></span>
          </div>
        )}

        <div className="mb-10">
          {props.variables?.map((_, index) => (
            <VariableRow
              gridTemplateColumns={gridTemplateColumns}
              availableScopes={props.availableScopes}
              onDelete={props.onRemove}
              key={index}
              index={index}
            />
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
