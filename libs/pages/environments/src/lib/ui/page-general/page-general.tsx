import { Environment, Status } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getEnvironmentStatusById } from '@qovery/domains/environment'
import { CreateCloneEnvironmentModalFeature } from '@qovery/shared/console-shared'
import {
  CLUSTERS_CREATION_GENERAL_URL,
  CLUSTERS_CREATION_URL,
  CLUSTERS_URL,
  SERVICES_GENERAL_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import {
  BaseLink,
  Button,
  ButtonSize,
  EmptyState,
  HelpSection,
  IconAwesomeEnum,
  Table,
  TableFilterProps,
  useModal,
} from '@qovery/shared/ui'
import TableRowEnvironments from '../table-row-environments/table-row-environments'

export interface PageGeneralProps {
  environments: Environment[]
  environmentsStatus?: Status[]
  listHelpfulLinks: BaseLink[]
  isLoading?: boolean
  clusterAvailable?: boolean
}

export function PageGeneral(props: PageGeneralProps) {
  const { environments, environmentsStatus, listHelpfulLinks, clusterAvailable, isLoading } = props
  const { organizationId = '', projectId = '' } = useParams()

  const { openModal, closeModal } = useModal()
  const [data, setData] = useState<Environment[]>([])
  const [filter, setFilter] = useState<TableFilterProps>({})
  const [loading, setLoading] = useState(isLoading)

  useEffect(() => {
    setData(environments)
    setLoading(isLoading)
  }, [environments, isLoading])

  const tableHead = [
    {
      title: `Environment${data.length > 1 ? 's' : ''}`,
      className: 'px-4 py-2',
      filter: [
        {
          search: true,
          title: 'Filter by status',
          key: 'status.state',
        },
        {
          title: 'Filter by provider',
          key: 'cloud_provider.provider',
        },
      ],
    },
    {
      title: 'Update',
      className: 'px-4 text-right',
      sort: {
        key: 'updated_at',
      },
    },
    {
      title: 'Type',
      className: 'px-4 py-2 border-b-element-light-lighter-400 border-l h-full',
      filter: [
        {
          search: true,
          title: 'Filter by environment type',
          key: 'mode',
        },
      ],
    },
  ]

  const columnWidth = '30% 25% 40%'

  return (
    <>
      {environments.length ? (
        <Table
          dataHead={tableHead}
          data={environments}
          setFilter={setFilter}
          setDataSort={setData}
          className="mt-2 bg-white rounded-sm flex-grow overflow-y-auto min-h-0"
          columnsWidth={columnWidth}
          defaultSortingKey="name"
        >
          <>
            {data.map((currentData) => (
              <TableRowEnvironments
                key={currentData.id}
                data={currentData}
                status={getEnvironmentStatusById(currentData.id, environmentsStatus)}
                filter={filter}
                dataHead={tableHead}
                link={`${SERVICES_URL(organizationId, projectId, currentData.id)}${SERVICES_GENERAL_URL}`}
                columnsWidth={columnWidth}
                isLoading={loading}
              />
            ))}
          </>
        </Table>
      ) : (
        !isLoading && (
          <EmptyState
            className="bg-white rounded-t-sm mt-2 pt-10"
            title={`${clusterAvailable ? 'Create your first environment 💫' : 'Create your Cluster first 💫'}`}
            description={`${
              clusterAvailable
                ? 'Please create your environment to start using Qovery and create your first service'
                : 'Deploying a cluster is necessary to start using Qovery and create your first environment'
            }`}
            imageWidth="w-[160px]"
          >
            <Button
              className="mt-5"
              size={ButtonSize.LARGE}
              iconRight={IconAwesomeEnum.CIRCLE_PLUS}
              link={
                !clusterAvailable
                  ? CLUSTERS_URL(organizationId) + CLUSTERS_CREATION_URL + CLUSTERS_CREATION_GENERAL_URL
                  : undefined
              }
              onClick={() => {
                clusterAvailable &&
                  openModal({
                    content: (
                      <CreateCloneEnvironmentModalFeature
                        onClose={closeModal}
                        projectId={projectId}
                        organizationId={organizationId}
                      />
                    ),
                  })
              }}
            >
              {clusterAvailable ? 'New environment' : 'Create a Cluster'}
            </Button>
          </EmptyState>
        )
      )}

      <div className="bg-white rounded-b flex flex-col justify-end">
        <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks} />
      </div>
    </>
  )
}

export default PageGeneral
