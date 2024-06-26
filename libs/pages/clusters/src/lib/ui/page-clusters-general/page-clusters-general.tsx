import { type Cluster } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { CLUSTERS_CREATION_GENERAL_URL, CLUSTERS_CREATION_URL, CLUSTERS_URL } from '@qovery/shared/routes'
import { EmptyState, Heading, Icon, Link, LoaderSpinner, Section } from '@qovery/shared/ui'
import CardCluster from '../card-cluster/card-cluster'

export interface PageClustersGeneralProps {
  clusters: Cluster[]
  loading: boolean
}

export function PageClustersGeneral(props: PageClustersGeneralProps) {
  const { loading, clusters } = props
  const { organizationId = '' } = useParams()

  const goToCreateCluster = CLUSTERS_URL(organizationId) + CLUSTERS_CREATION_URL + CLUSTERS_CREATION_GENERAL_URL

  return (
    <div className="flex w-full flex-1 flex-col justify-between">
      <Section className="p-8">
        <div className="mb-8 flex justify-between">
          <div>
            <Heading className="mb-2">Manage your clusters</Heading>
            <p className="text-xs text-neutral-400">Manage your infrastructure across different Cloud providers.</p>
          </div>
          <Link as="button" to={goToCreateCluster} className="gap-2" size="lg">
            Add Cluster
            <Icon iconName="circle-plus" />
          </Link>
        </div>
        {loading && clusters?.length === 0 ? (
          <div data-testid="clusters-loader" className="flex justify-center">
            <LoaderSpinner className="w-6" />
          </div>
        ) : clusters && clusters.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {clusters.map((cluster) => (
              <CardCluster key={cluster.id} cluster={cluster} organizationId={organizationId} />
            ))}
          </div>
        ) : (
          !loading &&
          clusters?.length === 0 && (
            <EmptyState
              title="No cluster set"
              description="A cluster is necessary to run your applications with Qovery"
            >
              <Link as="button" to={goToCreateCluster} className="mt-5" size="md">
                Add Cluster
              </Link>
            </EmptyState>
          )
        )}
      </Section>
    </div>
  )
}

export default PageClustersGeneral
