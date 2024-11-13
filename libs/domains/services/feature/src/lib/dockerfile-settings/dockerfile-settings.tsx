import { type JobLifecycleTypeEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { Controller, type ControllerRenderProps, type UseFormReturn } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import {
  BlockContent,
  Button,
  Callout,
  CodeEditor,
  ExternalLink,
  Heading,
  Icon,
  InputSelect,
  InputText,
  Section,
  useModal,
} from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { DockerfileRawModal } from '../dockerfile-raw-modal/dockerfile-raw-modal'

type FileSource = 'GIT_REPOSITORY' | 'DOCKERFILE_RAW'

export interface DockerfileSettingsData {
  dockerfile_source: FileSource
  dockerfile_path?: string | null
  dockerfile_raw?: string | null
}

export interface DockerfileSettingsProps extends PropsWithChildren {
  methods: UseFormReturn<DockerfileSettingsData>
  onSubmit: () => void
  directSubmit?: boolean
  defaultContent?: string
  templateType?: JobLifecycleTypeEnum
}

export function DockerfileSettings({
  children,
  methods,
  onSubmit,
  directSubmit = false,
  defaultContent,
  templateType,
}: DockerfileSettingsProps) {
  const { environmentId = '' } = useParams()
  const { openModal, closeModal } = useModal()
  const { setValue, control, watch } = methods

  const availableFileSources: { label: string; value: FileSource }[] = [
    { label: 'Git repository', value: 'GIT_REPOSITORY' },
    { label: 'Raw Dockerfile', value: 'DOCKERFILE_RAW' },
  ]

  const watchDockerfileRaw = watch('dockerfile_raw')
  const watchDockerfileSource = watch('dockerfile_source')

  const handleSubmit = () => {
    if (watchDockerfileSource === 'GIT_REPOSITORY') {
      setValue('dockerfile_raw', null)
    } else {
      setValue('dockerfile_path', null)
    }
    onSubmit()
  }

  const openModalDockerfileRaw = (field: ControllerRenderProps<DockerfileSettingsData, 'dockerfile_raw'>) => {
    openModal({
      content: (
        <DockerfileRawModal
          environmentId={environmentId}
          content={field.value ?? ''}
          description={match(templateType)
            .with(
              'CLOUDFORMATION',
              'TERRAFORM',
              (templateType) =>
                `Qovery provides you with a default Dockerfile to deploy your ${upperCaseFirstLetter(templateType)}.`
            )
            .with('GENERIC', undefined, () => undefined)
            .exhaustive()}
          onClose={closeModal}
          onSubmit={(dockerfile_raw) => {
            field.onChange(dockerfile_raw)
            if (directSubmit) {
              handleSubmit()
            }
          }}
          defaultContent={defaultContent}
        />
      ),
      options: {
        fullScreen: true,
      },
    })
  }

  return (
    <form
      className="w-full space-y-10"
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <Controller
        name="dockerfile_source"
        control={methods.control}
        defaultValue="GIT_REPOSITORY"
        render={({ field }) => (
          <InputSelect
            label="File source"
            value={field.value}
            onChange={field.onChange}
            options={availableFileSources}
          />
        )}
      />

      <Section className="gap-6">
        {watchDockerfileSource === 'DOCKERFILE_RAW' ? (
          <>
            <div>
              <Heading className="mb-2">Dockerfile as raw file</Heading>
              <p className="text-sm text-neutral-350">
                {match(templateType)
                  .with(
                    'CLOUDFORMATION',
                    'TERRAFORM',
                    (templateType) =>
                      `Customize here the dockerfile used to package your ${upperCaseFirstLetter(templateType)} and store it in the Qovery control plane.`
                  )
                  .with(
                    'GENERIC',
                    undefined,
                    () =>
                      'You can customize here the dockerfile to be used for this service and it will be stored on the Qovery control plane.'
                  )
                  .exhaustive()}
              </p>
            </div>

            {match(templateType)
              .with('CLOUDFORMATION', () => (
                <Callout.Root color="sky">
                  <Callout.Icon>
                    <Icon iconName="circle-info" iconStyle="regular" />
                  </Callout.Icon>
                  <Callout.Text>
                    Qovery provides a default Dockerfile and job parameters to deploy your template. These can be
                    customize based on your needs (additional arguments in the CLI commands etc..).
                  </Callout.Text>
                </Callout.Root>
              ))
              .with('TERRAFORM', () => (
                <Callout.Root color="sky">
                  <Callout.Icon>
                    <Icon iconName="circle-info" iconStyle="regular" />
                  </Callout.Icon>
                  <Callout.Text>
                    Qovery provides a default Dockerfile and job parameters to deploy your manifest. These can be
                    customize based on your needs (additional arguments in the CLI commands etc..).
                  </Callout.Text>
                </Callout.Root>
              ))
              .with('GENERIC', undefined, () => undefined)
              .exhaustive()}

            <Controller
              name="dockerfile_raw"
              control={control}
              rules={{
                required: 'Value required',
              }}
              render={({ field }) => (
                <BlockContent
                  title="Raw Dockerfile"
                  classNameContent="p-0"
                  headRight={
                    watchDockerfileRaw && (
                      <Button
                        aria-label="Edit"
                        type="button"
                        size="xs"
                        variant="surface"
                        onClick={() => openModalDockerfileRaw(field)}
                        className="hover:text-neutral-400"
                      >
                        <Icon iconName="pen" />
                      </Button>
                    )
                  }
                >
                  {watchDockerfileRaw ? (
                    <CodeEditor value={watchDockerfileRaw} language="dockerfile" readOnly height="300px" />
                  ) : (
                    <div className="my-4 px-10 py-5 text-center">
                      <Icon iconName="wave-pulse" className="text-neutral-350" />
                      <p className="mb-3 mt-1 text-xs font-medium text-neutral-350">No Dockerfile defined</p>
                      <Button type="button" size="md" onClick={() => openModalDockerfileRaw(field)}>
                        Create Dockerfile <Icon iconName="pen" className="ml-2" />
                      </Button>
                    </div>
                  )}
                </BlockContent>
              )}
            />
          </>
        ) : (
          <>
            <div>
              <Heading className="mb-2">Dockerfile from git repository</Heading>
              <p className="text-sm text-neutral-350">
                Specify the path containing the Dockerfile to be used to package your application.
              </p>
            </div>

            <Controller
              data-testid="input-text-dockerfile-path"
              key="dockerfile_path"
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
                  hint={
                    <>
                      <span>Specify the location of your dockerfile. Expected format: myapp/Dockerfile</span>
                      <br />
                      <ExternalLink size="xs">Create one with Docker init</ExternalLink>
                    </>
                  }
                />
              )}
            />
          </>
        )}
      </Section>
      {directSubmit && watchDockerfileSource === 'DOCKERFILE_RAW' ? null : children}
    </form>
  )
}

export default DockerfileSettings
