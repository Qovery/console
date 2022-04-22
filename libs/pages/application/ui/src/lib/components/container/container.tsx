import { IconEnum } from '@console/shared/enums'
import { ButtonIcon, ButtonIconStyle, StatusMenu, StatusMenuState, Icon, Header } from '@console/shared/ui'
import { Application } from 'qovery-typescript-axios'
import { useNavigate } from 'react-router'

export interface ContainerProps {
  application: Application
}

export function Container(props: ContainerProps) {
  const { application } = props
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
        title={application.name ? application.name : 'Application'}
        icon={IconEnum.APPLICATION}
        buttons={headerButtons}
        copyTitle
        actions={headerActions}
      />

      <button className="mb-2" onClick={() => navigate(-1)}>
        Back
      </button>
      <h1>{application.name}</h1>
    </div>
  )
}

export default Container
