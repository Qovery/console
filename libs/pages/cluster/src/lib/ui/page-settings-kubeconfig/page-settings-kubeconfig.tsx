import { type Cluster } from 'qovery-typescript-axios'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { KUBECONFIG } from '@qovery/shared/routes'
import { Button, Heading, HelpSection, Icon, IconAwesomeEnum, Link, Section } from '@qovery/shared/ui'

interface PageSettingsKubeconfigProps {
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
    <div className="flex flex-col justify-between w-full">
      <Section className="p-8 max-w-content-with-navigation-left">
        <Heading className="mb-2">Kubeconfig</Heading>
        <div className="flex justify-between mb-4">
          <p className="text-sm text-neutral-400 max-w-content-with-navigation-left">
            Upload your Kubeconfig file here.
          </p>
        </div>
        <div className="flex border border-neutral-200 p-3 gap-2 rounded items-center">
          <div className="p-2">
            <Icon name={IconAwesomeEnum.FILE_LINES} />
          </div>
          <div className="flex flex-col text-xs grow">
            <span className="text-neutral-400 font-medium">Kubeconfig</span>
            <Link
              className="text-xs"
              to={{
                pathname: KUBECONFIG,
                search: searchParams.toString(),
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              View <Icon name={IconAwesomeEnum.EYE} />
            </Link>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" {...getRootProps()} color="neutral">
              <input {...getInputProps()} />
              <Icon name={IconAwesomeEnum.ARROWS_ROTATE} />
            </Button>
          </div>
        </div>
      </Section>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/#what-is-a-cluster',
            linkLabel: 'How to configure my cluster',
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsKubeconfig
