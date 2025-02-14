import { type Cluster, type ClusterStatus } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { ClusterCard } from '@qovery/domains/clusters/feature'
import { CLUSTERS_NEW_URL, CLUSTERS_URL } from '@qovery/shared/routes'
import { EmptyState, Heading, Icon, Link, LoaderSpinner, Section, TabsPrimitives as Tabs } from '@qovery/shared/ui'

export interface PageClustersGeneralProps {
  clusters: Cluster[]
  clusterStatuses: ClusterStatus[]
  loading: boolean
}

export function PageClustersGeneral({ loading, clusters, clusterStatuses }: PageClustersGeneralProps) {
  const { organizationId = '' } = useParams()

  const goToCreateCluster = CLUSTERS_URL(organizationId) + CLUSTERS_NEW_URL

  return (
    <div className="flex w-full flex-1 flex-col justify-between">
      <Section className="p-8">
        <div className="mb-8 flex justify-between">
          <div>
            <Heading className="mb-2">Manage your clusters</Heading>
            <p className="text-xs text-neutral-400">Manage your infrastructure across different Cloud providers.</p>
          </div>
          <Link as="button" to={goToCreateCluster} className="gap-2" size="md">
            Add Cluster
            <Icon iconName="circle-plus" iconStyle="regular" />
          </Link>
        </div>
        <div>
          {loading && clusters?.length === 0 ? (
            <div data-testid="clusters-loader" className="flex justify-center">
              <LoaderSpinner className="w-6" />
            </div>
          ) : clusters && clusters.length > 0 ? (
            <div>
              <Tabs.TabsRoot defaultValue="all">
                <Tabs.TabsList className="relative -mx-8 mb-8 border-b border-neutral-200 px-8">
                  <Tabs.TabsTrigger value="all" className="border-transparent">
                    All
                  </Tabs.TabsTrigger>
                  <Tabs.TabsTrigger value="production" className="border-transparent">
                    Production
                  </Tabs.TabsTrigger>
                  <Tabs.TabsTrigger value="demo" className="flex items-center gap-2 border-transparent">
                    <Icon iconName="laptop-code" />
                    Demo
                  </Tabs.TabsTrigger>
                </Tabs.TabsList>
                <div>
                  <Tabs.TabsContent value="all">
                    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                      {clusters.map((cluster) => (
                        <ClusterCard
                          key={cluster.id}
                          cluster={cluster}
                          clusterStatus={clusterStatuses.find((c) => c.cluster_id === cluster.id)}
                        />
                      ))}
                    </div>
                  </Tabs.TabsContent>

                  <Tabs.TabsContent value="production">
                    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                      {clusters
                        .filter((cluster) => cluster.production)
                        .map((cluster) => (
                          <ClusterCard
                            key={cluster.id}
                            cluster={cluster}
                            clusterStatus={clusterStatuses.find((c) => c.cluster_id === cluster.id)}
                          />
                        ))}
                    </div>
                  </Tabs.TabsContent>

                  <Tabs.TabsContent value="demo">
                    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                      {clusters
                        .filter((cluster) => cluster.is_demo)
                        .map((cluster) => (
                          <ClusterCard
                            key={cluster.id}
                            cluster={cluster}
                            clusterStatus={clusterStatuses.find((c) => c.cluster_id === cluster.id)}
                          />
                        ))}
                    </div>
                  </Tabs.TabsContent>
                </div>
              </Tabs.TabsRoot>
            </div>
          ) : (
            !loading &&
            clusters?.length === 0 && (
              <EmptyState
                title="No cluster set"
                description="A cluster is necessary to run your applications with Qovery"
              >
                <Link as="button" to={goToCreateCluster} className="mt-5" size="lg">
                  Add Cluster
                </Link>
              </EmptyState>
            )
          )}
        </div>
      </Section>
    </div>
  )
}

export default PageClustersGeneral
