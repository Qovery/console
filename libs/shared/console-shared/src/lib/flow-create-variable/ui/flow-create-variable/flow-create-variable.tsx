import { type APIVariableScopeEnum, type JobLifecycleTypeEnum } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { type FlowVariableData, type VariableData } from '@qovery/shared/interfaces'
import { Button, Heading, Icon, Section } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import VariableRow from '../variable-row/variable-row'

export interface FlowCreateVariableProps {
  onBack: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  onAdd: () => void
  onRemove: (index: number) => void
  variables: VariableData[]
  availableScopes: APIVariableScopeEnum[]
  templateType: JobLifecycleTypeEnum | undefined
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
          <Icon iconName="plus-circle" />
        </Button>
      </div>

      <form className="space-y-10" onSubmit={props.onSubmit}>
        <p className="mr-36 text-sm text-neutral-350">
          {match(props.templateType)
            .with(
              'CLOUDFORMATION',
              'TERRAFORM',
              (templateType) =>
                `Fill the parameters required to execute the ${upperCaseFirstLetter(templateType)} commands. These will be stored as environment variables, you can reuse in the field “Value” any existing variable via the macro {{VARIABLE_NAME}}`
            )
            .with('GENERIC', undefined, () => 'Define here the variables required by your service.')
            .exhaustive()}
        </p>
        <div>
          {props.variables?.length > 0 && (
            <div className="mb-3 grid" style={{ gridTemplateColumns }}>
              <span className="text-sm font-medium text-neutral-400">Variable</span>
              <span className="text-sm font-medium text-neutral-400">Value</span>
              <span className="text-sm font-medium text-neutral-400">Scope</span>
              <span className="pl-1.5 text-sm font-medium text-neutral-400">Secret</span>
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
