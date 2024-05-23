import { type FormEventHandler, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useController, useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { type ClusterKubeconfigData } from '@qovery/shared/interfaces'
import { CLUSTERS_CREATION_GENERAL_URL, CLUSTERS_CREATION_URL, CLUSTERS_URL } from '@qovery/shared/routes'
import { Button, Dropzone, Heading, Icon, Section } from '@qovery/shared/ui'

export interface StepKubeconfigProps {
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function StepKubeconfig({ onSubmit }: StepKubeconfigProps) {
  const navigate = useNavigate()
  const { organizationId = '' } = useParams()
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
        fileSize.onChange(file.size / 1000)
        fileName.onChange(file.name)
        fileContent.onChange(reader.result)
      }
      reader.readAsText(file)
    })
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
  })

  const handleDelete = () => {
    fileName.onChange(null)
    fileContent.onChange(null)
  }

  return (
    <Section>
      <div className="mb-10">
        <Heading className="mb-2">Kubeconfig</Heading>
        <p className="text-neutral-350">Upload your Kubeconfig file here.</p>
      </div>
      <form onSubmit={onSubmit}>
        <div className="mb-10">
          {fileName.value ? (
            <div className="flex items-center gap-2 rounded border border-neutral-200 p-3">
              <div className="p-2">
                <Icon iconName="file-lines" />
              </div>
              <div className="flex grow flex-col text-xs">
                <span className="font-medium text-neutral-400">{fileName.value}</span>
                <span className="text-neutral-350">{fileSize.value} Ko</span>
              </div>
              <div>
                <Button type="button" variant="outline" color="neutral" onClick={handleDelete}>
                  <Icon iconName="trash" />
                </Button>
              </div>
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
            variant="surface"
            color="neutral"
            onClick={() =>
              navigate(`${CLUSTERS_URL(organizationId)}${CLUSTERS_CREATION_URL}${CLUSTERS_CREATION_GENERAL_URL}`)
            }
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

export default StepKubeconfig
