import * as Collapsible from '@radix-ui/react-collapsible'
import { useParams, useSearch } from '@tanstack/react-router'
import { type DatabaseConfiguration, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'
import { type FormEventHandler, type ReactNode, useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider } from 'react-hook-form'
import { Button, FunnelFlowBody, Heading, Icon, InputSelect, Link, Section, SegmentedControl } from '@qovery/shared/ui'
import { GeneralSetting } from '../../../general-setting/general-setting'
import {
  type DatabaseCreateGeneralData,
  findDatabaseTemplateMatch,
  generateDatabaseTypeAndVersionOptions,
} from '../database-create-utils/database-create-utils'
import { useDatabaseCreateContext } from '../database-creation-flow'

export interface DatabaseStepGeneralProps {
  onSubmit: (data: DatabaseCreateGeneralData) => void
  labelSetting: ReactNode
  annotationSetting: ReactNode
  databaseConfigurations?: DatabaseConfiguration[]
}

export function DatabaseStepGeneral({
  onSubmit,
  labelSetting,
  annotationSetting,
  databaseConfigurations,
}: DatabaseStepGeneralProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const { template, option } = useSearch({ strict: false })
  const { generalForm, setCurrentStep } = useDatabaseCreateContext()
  const [openExtraAttributes, setOpenExtraAttributes] = useState(false)

  const methods = generalForm
  const watchType = methods.watch('type')
  const watchAccessibility = methods.watch('accessibility')

  const databaseOptions = useMemo(
    () => generateDatabaseTypeAndVersionOptions(databaseConfigurations),
    [databaseConfigurations]
  )

  const templateMatch = findDatabaseTemplateMatch(template, option)
  const headerTitle = templateMatch.templateTitle
    ? `${templateMatch.templateTitle}${templateMatch.optionTitle ? ` - ${templateMatch.optionTitle}` : ''}`
    : 'General information'

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const handleSubmit: FormEventHandler<HTMLFormElement> = methods.handleSubmit((data) => {
    methods.reset(data)
    onSubmit(data)
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <Section>
          <Heading className="mb-2">{headerTitle}</Heading>
          <p className="mb-10 text-sm text-neutral-subtle">
            These general settings allow you to set up the database name, type and version.
          </p>

          <form className="space-y-10" onSubmit={handleSubmit}>
            <Section className="gap-4">
              <Heading>General</Heading>
              <GeneralSetting
                label="Service name"
                service={{
                  id: '',
                  name: '',
                  created_at: '',
                  version: '',
                  icon_uri: methods.watch('icon_uri') ?? 'app://qovery-console/database',
                  type: watchType ?? DatabaseTypeEnum.POSTGRESQL,
                  mode: DatabaseModeEnum.CONTAINER,
                  service_type: 'DATABASE',
                  serviceType: 'DATABASE',
                  environment: { id: '' },
                }}
              />
            </Section>

            <Section className="gap-4">
              <Heading>Database configuration</Heading>
              <Controller
                name="type"
                control={methods.control}
                rules={{ required: 'Please select a database type' }}
                render={({ field, fieldState: { error } }) => (
                  <InputSelect
                    label="Database type"
                    options={databaseOptions.databaseTypeOptions}
                    onChange={(value) => {
                      field.onChange(value)
                      methods.resetField('version')
                    }}
                    value={field.value}
                    error={error?.message}
                  />
                )}
              />

              <Controller
                name="version"
                control={methods.control}
                rules={{ required: 'Please select a database version' }}
                render={({ field, fieldState: { error } }) => (
                  <InputSelect
                    className={watchType ? '' : 'hidden'}
                    label="Version"
                    options={databaseOptions.databaseVersionOptions[`${watchType}-${DatabaseModeEnum.CONTAINER}`] ?? []}
                    onChange={field.onChange}
                    value={field.value}
                    error={error?.message}
                  />
                )}
              />

              <Controller
                name="accessibility"
                control={methods.control}
                rules={{ required: 'Please select an accessibility' }}
                render={({ field }) => (
                  <div>
                    <SegmentedControl.Root
                      defaultValue="PRIVATE"
                      value={field.value}
                      onValueChange={field.onChange}
                      className="w-60 text-sm"
                    >
                      <SegmentedControl.Item value="PRIVATE">Private access</SegmentedControl.Item>
                      <SegmentedControl.Item value="PUBLIC">Public access</SegmentedControl.Item>
                    </SegmentedControl.Root>
                    <p className="mt-2 text-sm text-neutral-subtle">
                      {watchAccessibility === 'PUBLIC' ? (
                        <>
                          <strong>Public access to your database is enabled</strong>, making it accessible to authorized
                          users from anywhere, both inside and outside your cluster, allowing for broad access,
                          collaboration, or testing purposes.
                        </>
                      ) : (
                        <>
                          <strong>Private access to your database is ensured</strong>, as it is only accessible from
                          within your cluster or via our port-forward feature. This setup is recommended for security
                          reasons.
                        </>
                      )}
                    </p>
                  </div>
                )}
              />
            </Section>

            <Collapsible.Root open={openExtraAttributes} onOpenChange={setOpenExtraAttributes} asChild>
              <Section className="gap-4">
                <div className="flex justify-between">
                  <Heading>Extra labels/annotations</Heading>
                  <Collapsible.Trigger className="flex items-center gap-2 text-sm font-medium text-neutral">
                    {openExtraAttributes ? (
                      <>
                        Hide <Icon iconName="chevron-up" />
                      </>
                    ) : (
                      <>
                        Show <Icon iconName="chevron-down" />
                      </>
                    )}
                  </Collapsible.Trigger>
                </div>
                <Collapsible.Content className="flex flex-col gap-4">
                  {labelSetting}
                  {annotationSetting}
                </Collapsible.Content>
              </Section>
            </Collapsible.Root>

            <div className="flex justify-between">
              <Link
                as="button"
                size="lg"
                type="button"
                variant="plain"
                color="neutral"
                to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/new"
                params={{ organizationId, projectId, environmentId }}
              >
                Cancel
              </Link>
              <Button data-testid="button-submit" type="submit" disabled={!methods.formState.isValid} size="lg">
                Continue
              </Button>
            </div>
          </form>
        </Section>
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default DatabaseStepGeneral
