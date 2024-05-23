import { type Cluster } from 'qovery-typescript-axios'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { KUBECONFIG } from '@qovery/shared/routes'
import { Button, Icon, Link, Section } from '@qovery/shared/ui'

export interface PageSettingsKubeconfigProps {
  cluster: Cluster
  onSubmit: (cluster: Cluster, kubeconfig: string) => void
}

export function PageSettingsKubeconfig({ cluster, onSubmit }: PageSettingsKubeconfigProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
        onSubmit(cluster, reader.result as string)
      }
      reader.readAsText(file)
    })
  }, [])
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 1,
  })

  const searchParams = new URLSearchParams({
    organizationId: cluster.organization.id,
    clusterId: cluster.id,
  })

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <SettingsHeading title="Kubeconfig" description="Upload your Kubeconfig file here." />
        <div className="flex items-center gap-2 rounded border border-neutral-200 p-3">
          <div className="p-2">
            <Icon iconName="file-lines" />
          </div>
          <div className="flex grow flex-col text-xs">
            <span className="font-medium text-neutral-400">Kubeconfig</span>
            <Link
              className="text-xs"
              to={{
                pathname: KUBECONFIG,
                search: searchParams.toString(),
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              View <Icon iconName="eye" />
            </Link>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" {...getRootProps()} color="neutral">
              <input {...getInputProps()} />
              <Icon iconName="arrows-rotate" />
            </Button>
          </div>
        </div>
      </Section>
    </div>
  )
}

export default PageSettingsKubeconfig
