import { type FormEventHandler, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { type ClusterKubeconfigData } from '@qovery/shared/interfaces'
import { CLUSTERS_URL } from '@qovery/shared/routes'
import { Button, Dropzone, Icon, IconAwesomeEnum } from '@qovery/shared/ui'

export interface StepKubeconfigProps {
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function StepKubeconfig({ onSubmit }: StepKubeconfigProps) {
  const navigate = useNavigate()
  const { organizationId = '' } = useParams()
  const { setValue, watch, reset } = useFormContext<ClusterKubeconfigData>()

  const fileName = watch('file_name')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
        setValue('file_name', file.name)
        setValue('file_content', reader.result as string)
      }
      reader.readAsText(file)
    })
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'text/plain': ['.yml', '.yaml'],
    },
  })

  const handleDelete = () => {
    reset()
  }

  return (
    <div>
      <div className="mb-10">
        <h3 className="text-neutral-400 text-lg mb-2">Kubeconfig</h3>
        <p className="text-neutral-350">Upload your Kubeconfig file here.</p>
      </div>
      <form onSubmit={onSubmit}>
        <div className="mb-10">
          {fileName ? (
            <div className="flex border border-neutral-200 p-3 gap-2 rounded items-center">
              <div className="p-2">
                <Icon name={IconAwesomeEnum.FILE_LINES} />
              </div>
              <div className="flex flex-col text-xs grow">
                <span className="text-neutral-400 font-medium">{fileName}</span>
                <span className="text-neutral-350"></span>
              </div>
              <div>
                <Button type="button" variant="outline" color="neutral" onClick={handleDelete}>
                  <Icon name={IconAwesomeEnum.TRASH} />
                </Button>
              </div>
            </div>
          ) : (
            <div {...getRootProps({ className: 'dropzone' })}>
              <input data-testid="drop-input" {...getInputProps} />
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
            onClick={() => navigate(CLUSTERS_URL(organizationId))}
          >
            Cancel
          </Button>
          <Button size="lg" data-testid="button-submit" type="submit" disabled={!fileName}>
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StepKubeconfig
