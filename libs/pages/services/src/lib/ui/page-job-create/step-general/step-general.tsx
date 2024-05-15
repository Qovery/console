import { BuildModeEnum, type Organization } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { AnnotationSetting } from '@qovery/domains/organizations/feature'
import { AutoDeploySetting, BuildSettings, GeneralSetting } from '@qovery/domains/services/feature'
import { EntrypointCmdInputs, JobGeneralSettings } from '@qovery/shared/console-shared'
import { type JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import { type JobGeneralData } from '@qovery/shared/interfaces'
import { SERVICES_NEW_URL, SERVICES_URL } from '@qovery/shared/routes'
import { Button, Heading, Section } from '@qovery/shared/ui'
import { findTemplateData } from '../../../feature/page-job-create-feature/page-job-create-feature'
import { serviceTemplates } from '../../../feature/page-new-feature/service-templates'

export interface StepGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  organization?: Organization
  jobType: JobType
}

// const fetchDockerfile = async (url: string) => {
//   const response = await fetch(url)
//   const text = await response.text()
//   return text
// }

export function StepGeneral(props: StepGeneralProps) {
  const { organizationId = '', environmentId = '', projectId = '', slug, option } = useParams()
  const navigate = useNavigate()
  const { formState, watch } = useFormContext<JobGeneralData>()
  const watchServiceType = watch('serviceType')
  const watchBuildMode = watch('build_mode')

  // NOTE: Validation corner case where git settings can be in loading state
  const isGitSettingsValid = watchServiceType === 'APPLICATION' ? watch('branch') : true

  const isTemplate = slug !== undefined

  const dataTemplate = serviceTemplates.find((service) => service.slug === slug)
  const dataOptionTemplate = option !== 'current' ? findTemplateData(slug, option) : null

  // const [dockerFile, setDockerFile] = useState<string | null>(null)

  // useEffect(() => {
  //   const fetchDockerfileData = async () => {
  //     if (dataTemplate?.dockerfile) {
  //       const data = await fetchDockerfile(dataTemplate?.dockerfile)
  //       setDockerFile(data)
  //     }
  //   }
  //   if (isTemplate) fetchDockerfileData()
  // }, [dataTemplate?.dockerfile, isTemplate])

  return (
    <Section>
      {isTemplate ? (
        <div className="flex items-center gap-6 mb-10">
          <img src={dataTemplate?.icon as string} alt={slug} className="w-10 h-10" />
          <div>
            <Heading className="mb-2">
              {dataTemplate?.title} {dataOptionTemplate?.title ? `- ${dataOptionTemplate?.title}` : ''}
            </Heading>
            <p className="text-neutral-350 text-sm">
              General settings allow you to set up your lifecycle name with our git repository settings.
            </p>
          </div>
        </div>
      ) : (
        <>
          <Heading className="mb-2">
            {props.jobType === ServiceTypeEnum.CRON_JOB ? 'Cron' : 'Lifecycle'} job information
          </Heading>
          <p className="text-neutral-350 text-sm mb-10">
            General settings allow you to set up your application name, git repository or container settings.
          </p>
        </>
      )}

      <form className="space-y-10" onSubmit={props.onSubmit}>
        <Section className="gap-4">
          <Heading>General</Heading>
          <GeneralSetting label="Service name" />
        </Section>

        <Section className="gap-4">
          <Heading>Source</Heading>
          <JobGeneralSettings jobType={props.jobType} organization={props.organization} isEdition={false} />
        </Section>

        {watchServiceType && (
          <Section className="gap-4">
            <Heading>{watchServiceType === ServiceTypeEnum.APPLICATION ? 'Build and deploy' : 'Deploy'}</Heading>
            {/* {isTemplate && (
              <div className="flex flex-col gap-4">
                <div>
                  <div className="border border-neutral-250 bg-neutral-100 rounded overflow-hidden pt-4">
                    <p className="text-neutral-400 text-ssm font-medium px-5 mb-3">
                      Have you an Dockerfile configured?
                    </p>
                    <div className="flex gap-4 px-5 pb-5">
                      <Controller
                        name="dockerfile_mode"
                        control={control}
                        render={({ field }) => (
                          <InputRadio
                            label="Yes"
                            description="I have already Dockerfile in my git repository."
                            value="YES"
                            formValue={field.value}
                            name={field.name}
                            onChange={field.onChange}
                          />
                        )}
                      />
                      <Controller
                        name="dockerfile_mode"
                        control={control}
                        render={({ field }) => (
                          <InputRadio
                            label="No, I need an example"
                            description="I don't have Dockerfile in my git repository."
                            value="NO"
                            formValue={field.value}
                            name={field.name}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                    {watch('dockerfile_mode') === 'NO' && (
                      <div className="relative overflow-hidden border-t border-neutral-250">
                        <CodeEditor
                          readOnly
                          height="280px"
                          defaultValue={dockerFile ?? ''}
                          loading={!dockerFile}
                          language="dockerfile"
                        />
                        <Button type="button" className="absolute right-4 top-2" color="neutral" variant="surface">
                          <CopyToClipboardButtonIcon
                            className="flex items-center justify-center w-full h-full"
                            content={dockerFile ?? ''}
                          />
                        </Button>
                      </div>
                    )}
                  </div>
                  {watch('dockerfile_mode') === 'NO' && (
                    <p className="px-5 mt-0.5 font-normal text-xs text-neutral-350">
                      This example should be adapted to your needs. It must be push in your git repository by yourself.
                    </p>
                  )}
                </div>
                <Controller
                  data-testid="input-text-dockerfile-path"
                  name="dockerfile_path"
                  defaultValue="Dockerfile"
                  control={control}
                  rules={{
                    required: 'Value required',
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      dataTestId="input-text-dockerfile"
                      name={field.name}
                      onChange={field.onChange}
                      value={field.value ?? ''}
                      label="Dockerfile path"
                      error={error?.message}
                    />
                  )}
                />
                {watch('repository') && (
                  <div className="bg-neutral-150 rounded border border-neutral-200 px-3 py-2">
                    <p className="text-xs text-neutral-350 mb-1">Full path of your Dockerfile</p>
                    <p className="text-sm text-neutral-500">
                      {watch('root_path')}
                      {watch('dockerfile_path')}
                    </p>
                  </div>
                )}
              </div>
            )} */}
            {watchServiceType === ServiceTypeEnum.APPLICATION && <BuildSettings buildModeDisabled />}
            {props.jobType === ServiceTypeEnum.CRON_JOB && watchBuildMode === BuildModeEnum.DOCKER && (
              <EntrypointCmdInputs />
            )}
            <AutoDeploySetting source={watchServiceType === ServiceTypeEnum.CONTAINER ? 'CONTAINER_REGISTRY' : 'GIT'} />
          </Section>
        )}

        <Section className="gap-4">
          <Heading>Extra annotations</Heading>
          <AnnotationSetting />
        </Section>

        <div className="flex justify-between">
          <Button
            onClick={() =>
              navigate(SERVICES_URL(organizationId, projectId, environmentId) + isTemplate ? SERVICES_NEW_URL : '')
            }
            type="button"
            size="lg"
            variant="plain"
          >
            Cancel
          </Button>
          <Button
            data-testid="button-submit"
            type="submit"
            disabled={!(formState.isValid && isGitSettingsValid)}
            size="lg"
          >
            Continue
          </Button>
        </div>
      </form>
    </Section>
  )
}

export default StepGeneral
