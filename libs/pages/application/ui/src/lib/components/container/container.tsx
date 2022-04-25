import { IconEnum } from '@console/shared/enums'
import {
  ButtonIcon,
  ButtonIconStyle,
  StatusMenu,
  StatusMenuState,
  Icon,
  Header,
  Tag,
  Button,
  ButtonStyle,
  ButtonSize,
} from '@console/shared/ui'
import { ClickEvent } from '@szhsin/react-menu'
import { Application } from 'qovery-typescript-axios'
import { useParams } from 'react-router'

export interface ContainerProps {
  application: Application
}

export function Container(props: ContainerProps) {
  const { application } = props
  const { organizationId, projectId, environmentId, applicationId } = useParams()

  const clickAction = (e: ClickEvent, action: string) => {
    console.log(e)
  }

  const copyContent = `Organization ID: ${organizationId}\nProject ID: ${projectId}\nEnvironment ID: ${environmentId}\nService ID: ${applicationId}`

  const actionsMenu = [
    {
      items: [
        {
          name: 'Deploy',
          onClick: (e: ClickEvent) => clickAction(e, 'Deploy'),
          contentLeft: <Icon name="icon-solid-play" className="text-sm text-brand-400" />,
        },
        {
          name: 'Stop',
          onClick: (e: ClickEvent) => clickAction(e, 'Stop'),
          contentLeft: <Icon name="icon-solid-circle-stop" className="text-sm text-brand-400" />,
        },
      ],
    },
    {
      items: [
        {
          name: 'Redeploy',
          onClick: (e: ClickEvent) => clickAction(e, 'Redeploy'),
          contentLeft: <Icon name="icon-solid-rotate-right" className="text-sm text-brand-400" />,
        },
        {
          name: 'Update applications',
          onClick: (e: ClickEvent) => clickAction(e, 'Update'),
          contentLeft: <Icon name="icon-solid-rotate" className="text-sm text-brand-400" />,
        },
        {
          name: 'Rollback',
          onClick: (e: ClickEvent) => clickAction(e, 'Rollblack'),
          contentLeft: <Icon name="icon-solid-clock-rotate-left" className="text-sm text-brand-400" />,
        },
      ],
    },
  ]

  const headerButtons = (
    <>
      <ButtonIcon icon="icon-solid-terminal" style={ButtonIconStyle.STROKED} />
      <ButtonIcon icon="icon-solid-scroll" style={ButtonIconStyle.STROKED} />
      <ButtonIcon icon="icon-solid-clock-rotate-left" style={ButtonIconStyle.STROKED} />
      <Button iconRight="icon-solid-link" style={ButtonStyle.STROKED} size={ButtonSize.SMALL}>
        Open links
      </Button>
    </>
  )

  const headerActions = (
    <>
      <StatusMenu menus={actionsMenu} status={StatusMenuState.RUNNING} />
      <Tag className="bg-brand-50 text-brand-500">PROD</Tag>
      <div className="border border-element-light-lighter-400 bg-white h-6 px-2 rounded text-xs items-center inline-flex font-medium gap-2">
        <Icon name={IconEnum.AWS} width="16" />
        <p className="max-w-[54px] truncate">community-test</p>
      </div>
      <Tag className="bg-element-light-lighter-300 gap-2">
        <span className="w-2 h-2 rounded-lg bg-progressing-300"></span>
        <span className="w-2 h-2 rounded-lg bg-accent3-500"></span>
      </Tag>
    </>
  )

  return (
    <div>
      <Header
        title={application.name ? application.name : 'Application'}
        icon={IconEnum.APPLICATION}
        buttons={headerButtons}
        copyTitle
        copyContent={copyContent}
        actions={headerActions}
      />
    </div>
  )
}

export default Container
