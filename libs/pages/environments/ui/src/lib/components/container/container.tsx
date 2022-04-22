import { Environment } from 'qovery-typescript-axios'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
import { APPLICATIONS_URL } from '@console/shared/utils'
import { ButtonIcon, ButtonIconStyle, Header, Table } from '@console/shared/ui'
import { IconEnum } from '@console/shared/enums'

export interface ContainerProps {
  environments: Environment[]
}

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
      <ul className="mt-8">
        {environments &&
          environments.map((environment: Environment) => (
            <li key={environment.id}>
              <Link className="link text-accent2-500" to={APPLICATIONS_URL(organizationId, projectId, environment.id)}>
                {environment.name}
              </Link>
            </li>
          ))}
      </ul>
      <Table data={environments} />
    </div>
  )
}

export default Container
