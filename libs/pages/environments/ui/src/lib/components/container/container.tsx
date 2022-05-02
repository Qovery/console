import { Environment } from 'qovery-typescript-axios'
import { useParams } from 'react-router'
import { APPLICATIONS_URL } from '@console/shared/utils'
import { ButtonIcon, ButtonIconStyle, Header, Table } from '@console/shared/ui'
import { IconEnum } from '@console/shared/enums'
import TableRowEnvironments from '../table-row-environments/table-row-environments'

export interface ContainerProps {
  environments: Environment[]
}

const tableHead = [
  {
    title: 'Environment',
    className: 'px-4 py-2',
  },
  {
    title: 'Update',
    className: 'px-4',
  },
  {
    title: 'Running Schedule',
    className: 'px-4 py-2 border-b-element-light-lighter-400 border-l',
  },
  {
    title: 'Type',
  },
  {
    title: 'Tags',
  },
]

export function Container(props: ContainerProps) {
  const { environments } = props
  const { organizationId, projectId } = useParams()

  const headerButtons = (
    <>
      <ButtonIcon icon="icon-solid-terminal" style={ButtonIconStyle.STROKED} />
      <ButtonIcon icon="icon-solid-scroll" style={ButtonIconStyle.STROKED} />
      <ButtonIcon icon="icon-solid-clock-rotate-left" style={ButtonIconStyle.STROKED} />
    </>
  )

  return (
    <div>
      <Header title="Environments" icon={IconEnum.ENVIRONMENT} buttons={headerButtons} />
      <Table className="mt-2 bg-white rounded-sm" dataHead={tableHead} columnsWidth="30% 15% 25% 10% 20%">
        <>
          {environments.map((currentData, index) => (
            <TableRowEnvironments
              key={index}
              data={currentData}
              dataHead={tableHead}
              link={APPLICATIONS_URL(organizationId, projectId, currentData.id)}
              columnsWidth="25% 20% 25% 10% 15%"
            />
          ))}
        </>
      </Table>
    </div>
  )
}

export default Container
