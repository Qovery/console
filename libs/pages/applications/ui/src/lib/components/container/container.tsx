import { Application } from 'qovery-typescript-axios'
import { useNavigate, useParams } from 'react-router'
import { Link } from 'react-router-dom'
import { APPLICATION_URL } from '@console/shared/utils'
import { ButtonIcon, ButtonIconStyle, Header, Icon, StatusMenu, StatusMenuState } from '@console/shared/ui'
import { IconEnum } from '@console/shared/enums'

export interface ContainerProps {
  applications: Application[]
}

export function Container(props: ContainerProps) {
  const { applications } = props
  const { organizationId, projectId, environmentId } = useParams()
  const navigate = useNavigate()

  const headerButtons = (
    <>
      <ButtonIcon icon="icon-solid-terminal" style={ButtonIconStyle.STROKED} />
      <ButtonIcon icon="icon-solid-scroll" style={ButtonIconStyle.STROKED} />
      <ButtonIcon icon="icon-solid-clock-rotate-left" style={ButtonIconStyle.STROKED} />
    </>
  )

  const headerActions = (
    <>
      <StatusMenu status={StatusMenuState.RUNNING} />
      <div className="h-6 px-2 rounded bg-brand-50 text-brand-500 text-xs font-bold items-center inline-flex">PROD</div>
      <div className="h-6 px-2 rounded bg-white text-text-500 text-xs font-medium items-center inline-flex gap-2 border border-element-light-lighter-400">
        <Icon name={IconEnum.AWS} width="16" />
        <p className="max-w-[54px] truncate">community-test</p>
      </div>
      <div className="h-6 px-2 rounded bg-element-light-lighter-300 items-center inline-flex gap-2">
        <span className="w-2 h-2 rounded-lg bg-progressing-300"></span>
        <span className="w-2 h-2 rounded-lg bg-accent3-500"></span>
      </div>
    </>
  )

  return (
    <div>
      <Header
        title="Applications"
        icon={IconEnum.APPLICATIONS}
        buttons={headerButtons}
        copyTitle
        actions={headerActions}
      />

      <button className="mb-2" onClick={() => navigate(-1)}>
        Back
      </button>
      <h1>Welcome to Applications!</h1>
      <ul className="mt-8">
        {applications &&
          applications.map((application: Application) => (
            <li key={application.id}>
              <Link
                className="link text-accent2-500"
                to={APPLICATION_URL(organizationId, projectId, environmentId, application.id)}
              >
                {application.name}
              </Link>
            </li>
          ))}
      </ul>
    </div>
  )
}

export default Container
