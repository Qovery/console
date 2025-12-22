import { Controller, FormProvider, useForm } from 'react-hook-form'
import { BlockContent, CodeEditor, ModalCrud } from '@qovery/shared/ui'

export interface DockerfileFragmentInlineModalProps {
  onSubmit: (value?: string) => void
  onClose: () => void
  content?: string
}

export function DockerfileFragmentInlineModal({ onClose, onSubmit, content }: DockerfileFragmentInlineModalProps) {
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
        title="Custom build commands"
        description="Add Dockerfile RUN commands to install tools in the Terraform execution environment (e.g., AWS CLI, kubectl, jq)."
        onSubmit={onSubmitValue}
        onClose={onClose}
        submitLabel="Save"
      >
        <BlockContent title="Commands" className="mb-0" classNameContent="p-0">
          <Controller
            name="content"
            control={methods.control}
            render={({ field }) => (
              <CodeEditor
                width="100%"
                height="calc(100vh - 278px)"
                language="dockerfile"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </BlockContent>
      </ModalCrud>
    </FormProvider>
  )
}

export default DockerfileFragmentInlineModal
