import { type APIVariableScopeEnum } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { type FlowVariableData, type VariableData } from '@qovery/shared/interfaces'
import { ButtonLegacy, ButtonLegacySize, ButtonLegacyStyle, Heading, Section } from '@qovery/shared/ui'
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
    <Section>
      <div className="mb-10">
        <div className="flex justify-between mb-2 items-center">
          <Heading>Set environment variables</Heading>
          <ButtonLegacy size={ButtonLegacySize.TINY} className="btn--no-min-w" onClick={props.onAdd}>
            Add variable
          </ButtonLegacy>
        </div>

        <p className="text-xs text-neutral-400">Define here the variables required by your job</p>
      </div>

      <form onSubmit={props.onSubmit}>
        {props.variables?.length > 0 && (
          <div className="grid mb-3" style={{ gridTemplateColumns }}>
            <span className="text-sm text-neutral-400 font-medium">Variable</span>
            <span className="text-sm text-neutral-400 font-medium">Value</span>
            <span className="text-sm text-neutral-400 font-medium">Scope</span>
            <span className="text-sm text-neutral-400 font-medium pl-1.5">Secret</span>
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
          <ButtonLegacy
            onClick={props.onBack}
            className="btn--no-min-w"
            type="button"
            size={ButtonLegacySize.XLARGE}
            style={ButtonLegacyStyle.STROKED}
          >
            Back
          </ButtonLegacy>
          <ButtonLegacy
            dataTestId="button-submit"
            type="submit"
            disabled={!formState.isValid}
            size={ButtonLegacySize.XLARGE}
            style={ButtonLegacyStyle.BASIC}
          >
            Continue
          </ButtonLegacy>
        </div>
      </form>
    </Section>
  )
}

export default FlowCreateVariable
