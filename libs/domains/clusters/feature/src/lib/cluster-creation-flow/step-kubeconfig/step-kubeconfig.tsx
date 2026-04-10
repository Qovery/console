import { useNavigate } from '@tanstack/react-router'
import { type FormEventHandler, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { FormProvider, useController, useForm, useFormContext } from 'react-hook-form'
import { type ClusterKubeconfigData } from '@qovery/shared/interfaces'
import { Button, Dropzone, FunnelFlowBody, Heading, Icon, Section } from '@qovery/shared/ui'
import { steps, useClusterContainerCreateContext } from '../cluster-creation-flow'

export interface StepKubeconfigProps {
  onSubmit: (data: ClusterKubeconfigData) => void
}

interface StepKubeconfigFormProps {
  onSubmit: FormEventHandler<HTMLFormElement>
}

function StepKubeconfigForm({ onSubmit }: StepKubeconfigFormProps) {
  const navigate = useNavigate()
  const { creationFlowUrl } = useClusterContainerCreateContext()
  const { control, formState } = useFormContext<ClusterKubeconfigData>()
  const { field: fileName } = useController<ClusterKubeconfigData>({
    name: 'file_name',
    control,
    rules: { required: true },
  })
  const { field: fileContent } = useController<ClusterKubeconfigData>({
    name: 'file_content',
    control,
    rules: { required: true },
  })
  const { field: fileSize } = useController<ClusterKubeconfigData>({
    name: 'file_size',
    control,
    rules: { required: true },
  })

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        const reader = new FileReader()

        reader.onabort = () => console.log('file reading was aborted')
        reader.onerror = () => console.log('file reading has failed')
        reader.onload = () => {
          const result = typeof reader.result === 'string' ? reader.result : ''
          fileSize.onChange(file.size / 1000)
          fileName.onChange(file.name)
          fileContent.onChange(result)
        }
        reader.readAsText(file)
      })
    },
    [fileContent, fileName, fileSize]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
  })

  const handleDelete = () => {
    fileName.onChange(undefined)
    fileContent.onChange(undefined)
    fileSize.onChange(undefined)
  }

  return (
    <Section>
      <div className="mb-10 flex flex-col gap-2">
        <Heading>Kubeconfig</Heading>
        <p className="text-sm text-neutral-subtle">Upload your Kubeconfig file here.</p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="mb-10">
          {fileName.value ? (
            <div className="flex items-center gap-2 rounded border border-neutral bg-surface-neutral-component p-3">
              <div className="p-2">
                <Icon iconName="file-lines" />
              </div>
              <div className="flex grow flex-col text-xs">
                <span className="font-medium text-neutral">{fileName.value}</span>
                <span className="text-neutral-subtle">{fileSize.value} Ko</span>
              </div>
              <Button type="button" variant="outline" iconOnly color="neutral" onClick={handleDelete}>
                <Icon iconName="trash" />
              </Button>
            </div>
          ) : (
            <div {...getRootProps({ className: 'dropzone' })}>
              <input data-testid="drop-input" {...getInputProps()} />
              <Dropzone isDragActive={isDragActive} typeFile="kubeconfig" />
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button
            size="lg"
            type="button"
            variant="plain"
            color="neutral"
            onClick={() => navigate({ to: `${creationFlowUrl}/general` })}
          >
            Back
          </Button>
          <Button size="lg" data-testid="button-submit" type="submit" disabled={!formState.isValid}>
            Continue
          </Button>
        </div>
      </form>
    </Section>
  )
}

export function StepKubeconfig({ onSubmit }: StepKubeconfigProps) {
  const { kubeconfigData, setKubeconfigData, setCurrentStep, generalData } = useClusterContainerCreateContext()

  useEffect(() => {
    const stepIndex = steps(generalData).findIndex((step) => step.key === 'kubeconfig') + 1
    setCurrentStep(stepIndex)
  }, [generalData, setCurrentStep])

  const methods = useForm<ClusterKubeconfigData>({
    defaultValues: kubeconfigData,
    mode: 'onChange',
  })

  const handleSubmit = methods.handleSubmit((data) => {
    setKubeconfigData(data)
    onSubmit(data)
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <StepKubeconfigForm onSubmit={handleSubmit} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepKubeconfig
