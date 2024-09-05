import { type HelmRequestAllOfSource } from 'qovery-typescript-axios'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { CodeEditorVariable } from '@qovery/domains/variables/feature'
import { BlockContent, CodeEditor, CopyToClipboardButtonIcon, Icon, LoaderSpinner, ModalCrud } from '@qovery/shared/ui'
import useHelmDefaultValues from '../hooks/use-helm-default-values/use-helm-default-values'

export interface ValuesOverrideYamlModalProps {
  environmentId: string
  source: HelmRequestAllOfSource
  onSubmit: (value?: string) => void
  onClose: () => void
  content?: string
}

export function ValuesOverrideYamlModal({
  source,
  environmentId,
  onClose,
  onSubmit,
  content,
}: ValuesOverrideYamlModalProps) {
  const {
    data: helmDefaultValues,
    isLoading: isLoadingHelmDefaultValues,
    isError: isErrorHelmDefaultValues,
  } = useHelmDefaultValues({
    environmentId,
    helmDefaultValuesRequest: {
      source,
    },
  })

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
        title="Raw YAML"
        description="Define here the values override for your chart. You can use Qovery any environment variable via the macro qovery.env.<ENV_VAR_NAME>"
        onSubmit={onSubmitValue}
        onClose={onClose}
        submitLabel="Save"
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
                  height="calc(100vh - 278px)"
                  language="yaml"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </BlockContent>
          <BlockContent
            title="Default values.yaml"
            className="mb-0 rounded-l-none"
            classNameContent="p-0"
            headRight={
              <CopyToClipboardButtonIcon className="text-xs hover:text-neutral-400" content={helmDefaultValues!} />
            }
          >
            {isErrorHelmDefaultValues && (
              <div className="px-5 py-14 text-center">
                <Icon iconName="wave-pulse" className="text-neutral-350" />
                <p className="mb-3 mt-1 text-xs font-medium text-neutral-350">No default values.yaml available</p>
              </div>
            )}
            {isLoadingHelmDefaultValues && (
              <div className="flex justify-center px-5 py-14">
                <LoaderSpinner />
              </div>
            )}
            {!isErrorHelmDefaultValues && !isLoadingHelmDefaultValues && (
              <CodeEditor
                width="100%"
                height="calc(100vh - 278px)"
                language="yaml"
                defaultValue={helmDefaultValues}
                readOnly
              />
            )}
          </BlockContent>
        </div>
      </ModalCrud>
    </FormProvider>
  )
}

export default ValuesOverrideYamlModal
