import { type HelmRequestAllOfSource } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import {
  BlockContent,
  CodeEditor,
  CopyToClipboard,
  Icon,
  IconAwesomeEnum,
  LoaderSpinner,
  ModalCrud,
} from '@qovery/shared/ui'
import useCreateHelmDefaultValues from '../hooks/use-create-helm-default-values/use-create-helm-default-values'

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
    mutateAsync: createHelmDefaultValues,
    isLoading: isLoadingHelmDefaultValues,
    isError: isErrorHelmDefaultValues,
  } = useCreateHelmDefaultValues()

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      content,
    },
  })

  useEffect(() => {
    async function fetchHelmDefaultValues() {
      try {
        await createHelmDefaultValues({
          environmentId,
          helmDefaultValuesRequest: {
            source,
          },
        })
      } catch (error) {
        console.log(error)
      }
    }

    fetchHelmDefaultValues()
  }, [environmentId, source, createHelmDefaultValues])

  const onSubmitValue = methods.handleSubmit(async ({ content }) => {
    onSubmit(content)
    onClose()
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud title="Raw YAML" onSubmit={onSubmitValue} onClose={onClose} submitLabel="Save">
        <div className="flex h-full">
          <BlockContent title="Override" className="mb-0 rounded-r-none border-r-0" classNameContent="p-0">
            <Controller
              name="content"
              control={methods.control}
              render={({ field }) => (
                <CodeEditor
                  width="100%"
                  height="calc(100vh  - 254px)"
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
            headRight={<CopyToClipboard className="text-xs hover:text-neutral-400" content={helmDefaultValues!} />}
          >
            {isErrorHelmDefaultValues && (
              <div className="text-center py-14 px-5">
                <Icon name={IconAwesomeEnum.WAVE_PULSE} className="text-neutral-350" />
                <p className="text-neutral-350 font-medium text-xs mt-1 mb-3">No default values.yaml available</p>
              </div>
            )}
            {isLoadingHelmDefaultValues && (
              <div className="flex justify-center py-14 px-5">
                <LoaderSpinner />
              </div>
            )}
            {!isErrorHelmDefaultValues && !isLoadingHelmDefaultValues && (
              <CodeEditor
                width="100%"
                height="calc(100vh  - 254px)"
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
