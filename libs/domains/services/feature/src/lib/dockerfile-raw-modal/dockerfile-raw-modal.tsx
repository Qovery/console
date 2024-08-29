import { Controller, FormProvider, useForm } from 'react-hook-form'
import { CodeEditorVariable } from '@qovery/domains/variables/feature'
import { BlockContent, CodeEditor, CopyToClipboardButtonIcon, ModalCrud } from '@qovery/shared/ui'

export interface DockerfileRawModalProps {
  environmentId: string
  onSubmit: (value?: string) => void
  onClose: () => void
  content?: string
  description?: string
  defaultContent?: string
}

export function DockerfileRawModal({
  environmentId,
  onClose,
  onSubmit,
  content,
  description,
  defaultContent = `FROM alpine:latest

# copy the entire repository in the container image
ADD . .

# Set the default command to run when the container starts
ENTRYPOINT [ "/bin/sh" ]`,
}: DockerfileRawModalProps) {
  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      content,
    },
  })

  const onSubmitValue = methods.handleSubmit(({ content }) => {
    onSubmit(content)
    onClose()
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Dockerfile"
        onSubmit={onSubmitValue}
        onClose={onClose}
        submitLabel="Save"
        description={description}
      >
        <div className="flex h-full">
          <BlockContent title="Override" className="mb-0 rounded-r-none border-r-0" classNameContent="p-0">
            <Controller
              name="content"
              control={methods.control}
              render={({ field }) => (
                <CodeEditorVariable
                  environmentId={environmentId}
                  width="100%"
                  height="calc(100vh  - 254px)"
                  value={field.value}
                  onChange={field.onChange}
                  language="dockerfile"
                />
              )}
            />
          </BlockContent>
          <BlockContent
            title="Example"
            className="mb-0 rounded-l-none"
            classNameContent="p-0"
            headRight={
              <CopyToClipboardButtonIcon className="text-xs hover:text-neutral-400" content={defaultContent} />
            }
          >
            <CodeEditor
              width="100%"
              height="calc(100vh  - 254px)"
              defaultValue={defaultContent}
              readOnly
              language="dockerfile"
            />
          </BlockContent>
        </div>
      </ModalCrud>
    </FormProvider>
  )
}

export default DockerfileRawModal
