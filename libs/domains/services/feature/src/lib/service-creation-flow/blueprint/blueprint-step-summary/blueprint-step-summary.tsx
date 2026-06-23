import { useNavigate, useParams } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { useEffect, useState } from 'react'
import { Button, FunnelFlowBody, Heading, Icon, Section, SummaryValue } from '@qovery/shared/ui'
import { useCreateBlueprint } from '../../../hooks/use-create-blueprint/use-create-blueprint'
import { useBlueprintCreateContext } from '../blueprint-create-context/blueprint-create-context'
import {
  buildBlueprintVariables,
  formatFieldLabel,
  getSummaryFieldValue,
  isFieldValid,
} from '../blueprint-creation-utils/blueprint-creation-utils'

export function BlueprintStepSummary() {
  const navigate = useNavigate()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const {
    blueprint,
    creationFlowUrl,
    form,
    optionalBlueprintFields,
    overridableContextBlueprintFields,
    requiredBlueprintFields,
    serviceVersion,
    setCurrentStep,
  } = useBlueprintCreateContext()
  const [submitMode, setSubmitMode] = useState<'create' | 'create-and-deploy' | null>(null)
  const { mutateAsync: createBlueprint } = useCreateBlueprint()
  const { fields, serviceName } = form.watch()
  const variableFields = [...requiredBlueprintFields, ...optionalBlueprintFields]
  const overrideFields = [...optionalBlueprintFields, ...overridableContextBlueprintFields]
  const blueprintFields = [...variableFields, ...overridableContextBlueprintFields]
  const isBlueprintSetupValid = requiredBlueprintFields.every((field) => isFieldValid(field, fields[field.name]))

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  useEffect(() => {
    if (!serviceName.trim() || !isBlueprintSetupValid) {
      navigate({ to: creationFlowUrl })
      return
    }
  }, [creationFlowUrl, isBlueprintSetupValid, navigate, serviceName])

  const handleSubmit = async (withDeploy: boolean) => {
    setSubmitMode(withDeploy ? 'create-and-deploy' : 'create')
    const formValues = form.getValues()

    try {
      await createBlueprint({
        environmentId,
        deploy: withDeploy,
        payload: {
          name: formValues.serviceName,
          tag: blueprint.majorVersions[0]?.latestTag ?? '',
          icon: blueprint.icon,
          variables: buildBlueprintVariables(formValues.fields, blueprintFields),
          // TODO Remove that once the API will be fixed
          spec_overrides: {
            engine_version: '1.13.3',
          },
        },
      })

      posthog.capture('create-service', {
        selectedServiceType: 'blueprint',
        selectedServiceSubType: blueprint.serviceFamily ?? blueprint.provider,
      })

      navigate({
        to: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
        params: {
          organizationId,
          projectId,
          environmentId,
        },
      })
    } catch {
      // errors are surfaced by mutation notifications
    } finally {
      setSubmitMode(null)
    }
  }

  return (
    <FunnelFlowBody customContentWidth="max-w-[1024px]">
      <Section className="space-y-10">
        <div className="flex flex-col gap-2">
          <Heading className="mb-2">Ready to create your blueprint service</Heading>
          <p className="text-sm text-neutral-subtle">
            Review the configuration generated from the selected blueprint before creating the service.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <Section className="rounded-md border border-neutral bg-surface-neutral-subtle p-4">
            <div className="flex justify-between">
              <Heading>Service information</Heading>
              <Button
                aria-label="Edit service information"
                type="button"
                variant="outline"
                color="neutral"
                size="md"
                onClick={() => navigate({ to: creationFlowUrl })}
                iconOnly
              >
                <Icon className="text-base" iconName="gear-complex" />
              </Button>
            </div>
            <ul className="list-none space-y-2 text-sm text-neutral-subtle">
              <SummaryValue label="Name" value={serviceName} />
              <SummaryValue label="Blueprint" value={blueprint.name} />
              <SummaryValue label="Blueprint version" value={serviceVersion} />
            </ul>
          </Section>

          {requiredBlueprintFields.length > 0 && (
            <Section className="rounded-md border border-neutral bg-surface-neutral-subtle p-4">
              <div className="flex justify-between">
                <Heading>Blueprint setup</Heading>
                <Button
                  aria-label="Edit blueprint setup"
                  type="button"
                  variant="outline"
                  color="neutral"
                  size="md"
                  onClick={() => navigate({ to: creationFlowUrl })}
                  iconOnly
                >
                  <Icon className="text-base" iconName="gear-complex" />
                </Button>
              </div>
              <ul className="list-none space-y-2 text-sm text-neutral-subtle">
                {requiredBlueprintFields.map((field) => (
                  <SummaryValue
                    key={field.name}
                    label={formatFieldLabel(field.name)}
                    value={getSummaryFieldValue(field, fields[field.name])}
                  />
                ))}
              </ul>
            </Section>
          )}

          <Section className="rounded-md border border-neutral bg-surface-neutral-subtle p-4">
            <div className="flex justify-between">
              <Heading>Overrides</Heading>
              <Button
                aria-label="Edit overrides"
                type="button"
                variant="outline"
                color="neutral"
                size="md"
                onClick={() => navigate({ to: creationFlowUrl })}
                iconOnly
              >
                <Icon className="text-base" iconName="gear-complex" />
              </Button>
            </div>
            {overrideFields.length > 0 ? (
              <ul className="list-none space-y-2 text-sm text-neutral-subtle">
                {overrideFields.map((field) => (
                  <SummaryValue
                    key={field.name}
                    label={formatFieldLabel(field.name)}
                    value={getSummaryFieldValue(field, fields[field.name])}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-subtle">No overrides configured.</p>
            )}
          </Section>
        </div>

        <div className="flex justify-between">
          <Button onClick={() => navigate({ to: creationFlowUrl })} type="button" size="lg" variant="plain">
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              data-testid="button-create"
              loading={submitMode === 'create'}
              onClick={() => handleSubmit(false)}
              size="lg"
              type="button"
              variant="outline"
            >
              Create
            </Button>
            <Button
              data-testid="button-create-deploy"
              loading={submitMode === 'create-and-deploy'}
              onClick={() => handleSubmit(true)}
              type="button"
              size="lg"
            >
              Create and deploy
            </Button>
          </div>
        </div>
      </Section>
    </FunnelFlowBody>
  )
}
