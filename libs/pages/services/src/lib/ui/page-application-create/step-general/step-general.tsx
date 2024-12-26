import * as Collapsible from '@radix-ui/react-collapsible'
import { type Organization } from 'qovery-typescript-axios'
import { type FormEventHandler, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { AnnotationSetting, LabelSetting } from '@qovery/domains/organizations/feature'
import { AutoDeploySetting, BuildSettings, GeneralSetting } from '@qovery/domains/services/feature'
import { EntrypointCmdInputs, GeneralContainerSettings, GitRepositorySettings } from '@qovery/shared/console-shared'
import { IconEnum, ServiceTypeEnum } from '@qovery/shared/enums'
import { type ApplicationGeneralData } from '@qovery/shared/interfaces'
import { SERVICES_URL } from '@qovery/shared/routes'
import { Button, Heading, Icon, InputSelect, Section } from '@qovery/shared/ui'
import { findTemplateData } from '../../../feature/page-job-create-feature/page-job-create-feature'
import { serviceTemplates } from '../../../feature/page-new-feature/service-templates'

export interface StepGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  loadingCheckDockerfile?: boolean
  organization?: Organization
}

export function StepGeneral(props: StepGeneralProps) {
  const { control, watch, formState } = useFormContext<ApplicationGeneralData>()
  const { organizationId = '', environmentId = '', projectId = '', slug, option } = useParams()
  const navigate = useNavigate()
  const [openExtraAttributes, setOpenExtraAttributes] = useState(false)

  const watchServiceType = watch('serviceType')
  const watchIsPublicRepository = watch('is_public_repository')

  // NOTE: Validation corner case where git settings can be in loading state
  const isGitSettingsValid = watchServiceType === 'APPLICATION' ? watch('branch') : true

  const isTemplate = slug !== undefined
  const dataTemplate = serviceTemplates.find((service) => service.slug === slug)
  const dataOptionTemplate = option !== 'current' ? findTemplateData(slug, option) : null

  return (
    <Section>
      {isTemplate ? (
        <div className="mb-10">
          <Heading className="mb-2">
            {dataTemplate?.title} {dataOptionTemplate?.title ? `- ${dataOptionTemplate?.title}` : ''}
          </Heading>
          <p className="text-sm text-neutral-350">
            These general settings allow you to set up the service name, its source and deployment parameters.
          </p>
        </div>
      ) : (
        <>
          <Heading className="mb-2">General information</Heading>
          <p className="mb-10 text-sm text-neutral-350">
            These general settings allow you to set up the service name, its source and deployment parameters.
          </p>
        </>
      )}

      <form className="space-y-10" onSubmit={props.onSubmit}>
        <Section className="gap-4">
          <Heading>General</Heading>
          <GeneralSetting
            label="Service name"
            service={{
              id: '',
              name: '',
              environment: {
                id: '',
              },
              service_type: 'APPLICATION',
              serviceType: 'APPLICATION',
              created_at: '',
              healthchecks: {},
              icon_uri: 'app://qovery-console/application',
            }}
          />
        </Section>

        <Section className="gap-4">
          <Heading>Source</Heading>
          <Controller
            name="serviceType"
            control={control}
            rules={{
              required: 'Please select a source.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputSelect
                dataTestId="input-select-source"
                onChange={field.onChange}
                value={field.value}
                options={[
                  {
                    value: ServiceTypeEnum.APPLICATION,
                    label: 'Git provider',
                    icon: <Icon name={IconEnum.GIT} className="w-4" />,
                  },
                  {
                    value: ServiceTypeEnum.CONTAINER,
                    label: 'Container Registry',
                    icon: <Icon name={IconEnum.CONTAINER} className="w-4" />,
                  },
                ]}
                label="Application source"
                error={error?.message}
              />
            )}
          />

          {watchServiceType === 'APPLICATION' && <GitRepositorySettings gitDisabled={false} />}
          {watchServiceType === 'CONTAINER' && <GeneralContainerSettings organization={props.organization} />}
        </Section>

        {watchServiceType && (
          <>
            <Section className="gap-4">
              <Heading>{watchServiceType === ServiceTypeEnum.APPLICATION ? 'Build and deploy' : 'Deploy'}</Heading>
              {watchServiceType === ServiceTypeEnum.APPLICATION && <BuildSettings />}
              <EntrypointCmdInputs />
              {!watchIsPublicRepository && (
                <AutoDeploySetting
                  source={watchServiceType === ServiceTypeEnum.CONTAINER ? 'CONTAINER_REGISTRY' : 'GIT'}
                />
              )}
            </Section>
            <Collapsible.Root open={openExtraAttributes} onOpenChange={setOpenExtraAttributes} asChild>
              <Section className="gap-4">
                <div className="flex justify-between">
                  <Heading>Extra labels/annotations</Heading>
                  <Collapsible.Trigger className="flex items-center gap-2 text-sm font-medium">
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
                  <LabelSetting />
                  <AnnotationSetting />
                </Collapsible.Content>
              </Section>
            </Collapsible.Root>
          </>
        )}

        <div className="flex justify-between">
          <Button
            onClick={() => navigate(SERVICES_URL(organizationId, projectId, environmentId))}
            type="button"
            variant="plain"
            size="lg"
          >
            Cancel
          </Button>
          <Button
            data-testid="button-submit"
            type="submit"
            disabled={!(formState.isValid && isGitSettingsValid)}
            size="lg"
            loading={props.loadingCheckDockerfile}
          >
            Continue
          </Button>
        </div>
      </form>
    </Section>
  )
}

export default StepGeneral
