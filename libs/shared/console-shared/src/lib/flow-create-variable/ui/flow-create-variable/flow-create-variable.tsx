import { type APIVariableScopeEnum } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { type FlowVariableData, type VariableData } from '@qovery/shared/interfaces'
import { Button, Heading, Icon, Section } from '@qovery/shared/ui'
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
      <div className="flex justify-between">
        <Heading className="mb-2">Environment variables</Heading>
        <Button className="gap-2" size="lg" onClick={props.onAdd}>
          Add variable
          <Icon iconName="plus-circle" iconStyle="regular" />
        </Button>
      </div>

      <form className="space-y-10" onSubmit={props.onSubmit}>
        <p className="text-neutral-350 text-sm">Define here the variables required by your service.</p>
        <div>
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
        </div>

        <div className="flex justify-between">
          <Button onClick={props.onBack} type="button" size="lg" variant="plain">
            Back
          </Button>
          <Button data-testid="button-submit" type="submit" disabled={!formState.isValid} size="lg">
            Continue
          </Button>
        </div>
      </form>
    </Section>
  )
}

export default FlowCreateVariable
