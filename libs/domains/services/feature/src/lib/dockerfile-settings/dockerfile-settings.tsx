import { type PropsWithChildren, useState } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import {
  BlockContent,
  Button,
  CodeEditor,
  ExternalLink,
  Heading,
  Icon,
  InputSelect,
  InputText,
  Section,
  useModal,
} from '@qovery/shared/ui'
import { DockerfileRawModal } from '../dockerfile-raw-modal/dockerfile-raw-modal'

export interface DockerfileSettingsData {
  dockerfile_path?: string | null
  dockerfile_raw?: string | null
}

export interface DockerfileSettingsProps extends PropsWithChildren {
  methods: UseFormReturn<DockerfileSettingsData>
  onSubmit: () => void
}

type FileSource = 'GIT_REPOSITORY' | 'DOCKERFILE_RAW'

export function DockerfileSettings({ children, methods, onSubmit }: DockerfileSettingsProps) {
  const { openModal, closeModal } = useModal()
  const { setValue, control, watch } = methods

  const [fileSource, setFileSource] = useState<FileSource>(
    watch('dockerfile_raw') ? 'DOCKERFILE_RAW' : 'GIT_REPOSITORY'
  )
  const availableFileSources: { label: string; value: FileSource }[] = [
    { label: 'Git repository', value: 'GIT_REPOSITORY' },
    { label: 'Raw Dockerfile', value: 'DOCKERFILE_RAW' },
  ]

  const watchDockerfileRaw = watch('dockerfile_raw')

  const openModalDockerfileRaw = () => {
    openModal({
      content: (
        <DockerfileRawModal
          content={watchDockerfileRaw ?? ''}
          onClose={closeModal}
          onSubmit={(dockerfile_raw) => {
            setValue('dockerfile_raw', dockerfile_raw)
          }}
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
        if (fileSource === 'GIT_REPOSITORY') {
          setValue('dockerfile_raw', null)
        } else {
          setValue('dockerfile_path', null)
        }
        onSubmit()
      }}
    >
      <InputSelect
        label="File source"
        options={availableFileSources}
        value={fileSource}
        onChange={(value) => {
          setFileSource(value as FileSource)
        }}
      />
      <Section className="gap-6">
        {fileSource === 'DOCKERFILE_RAW' ? (
          <>
            <div>
              <Heading className="mb-2">Dockerfile as raw file</Heading>
              <p className="text-sm text-neutral-350">
                You can customize here the dockerfile to be used for this service and it will be stored on the Qovery
                control plane.
              </p>
            </div>

            <BlockContent
              title="Raw Dockerfile"
              classNameContent="p-0"
              headRight={
                watchDockerfileRaw && (
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={openModalDockerfileRaw}
                    className="hover:text-neutral-400"
                  >
                    <Icon iconName="pen" />
                  </Button>
                )
              }
            >
              {watchDockerfileRaw ? (
                <CodeEditor value={watchDockerfileRaw} readOnly height="300px" />
              ) : (
                <div className="my-4 px-10 py-5 text-center">
                  <Icon iconName="wave-pulse" className="text-neutral-350" />
                  <p className="mb-3 mt-1 text-xs font-medium text-neutral-350">No Dockerfile defined</p>
                  <Button type="button" size="md" onClick={openModalDockerfileRaw}>
                    Create Dockerfile <Icon iconName="pen" className="ml-2" />
                  </Button>
                </div>
              )}
            </BlockContent>
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
                      <ExternalLink>Create one with Docker init</ExternalLink>
                    </>
                  }
                />
              )}
            />
          </>
        )}
      </Section>
      {children}
    </form>
  )
}

export default DockerfileSettings
