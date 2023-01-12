import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CreateCloneEnvironmentModalFeature } from '@qovery/shared/console-shared'
import { EnvironmentEntity } from '@qovery/shared/interfaces'
import { SERVICES_GENERAL_URL, SERVICES_URL } from '@qovery/shared/routes'
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
  environments: EnvironmentEntity[]
  listHelpfulLinks: BaseLink[]
  isLoading?: boolean
  clusterAvailable?: boolean
}

function PageGeneralMemo(props: PageGeneralProps) {
  const { environments, listHelpfulLinks, clusterAvailable } = props
  const { organizationId = '', projectId = '' } = useParams()

  const { openModal, closeModal } = useModal()
  const [data, setData] = useState(environments)
  const [filter, setFilter] = useState<TableFilterProps>({})

  useEffect(() => {
    setData(environments)
  }, [environments])

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
        >
          <>
            {data.map((currentData) => (
              <TableRowEnvironments
                key={currentData.id}
                data={currentData}
                filter={filter}
                dataHead={tableHead}
                link={`${SERVICES_URL(organizationId, projectId, currentData.id)}${SERVICES_GENERAL_URL}`}
                columnsWidth={columnWidth}
              />
            ))}
          </>
        </Table>
      ) : (
        !props.isLoading && (
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
              onClick={() => {
                clusterAvailable
                  ? openModal({
                      content: (
                        <CreateCloneEnvironmentModalFeature
                          onClose={closeModal}
                          projectId={projectId}
                          organizationId={organizationId}
                        />
                      ),
                    })
                  : window.open(
                      `https://console.qovery.com/platform/organization/${organizationId}/settings/clusters`,
                      '_blank'
                    )
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

export const PageGeneral = React.memo(PageGeneralMemo, (prevProps, nextProps) => {
  // Stringify is necessary to avoid Redux selector behavior
  if (nextProps.environments.length > 0) {
    const isEqual =
      JSON.stringify(
        prevProps.environments.map((environment) => ({
          status: environment.status?.state,
          running_status: environment.running_status?.state,
        }))
      ) ===
      JSON.stringify(
        nextProps.environments.map((environment) => ({
          status: environment.status?.state,
          running_status: environment.running_status?.state,
        }))
      )
    return isEqual
  }

  return false
})
