import { ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { ApplicationEntity } from '@console/shared/interfaces'
import { Button, ButtonSize, ButtonStyle, IconAwesomeEnum } from '@console/shared/ui'

export interface NeedRedeployFlagProps {
  application: ApplicationEntity
  onClickCTA?: () => void
}

export function NeedRedeployFlag(props: NeedRedeployFlagProps) {
  return (
    <div className="bg-warning-500 text-warning-900">
      <div className="flex gap-2 h-10 items-center justify-center">
        <p className="font-medium text-sm">
          This application needs to be{' '}
          {props.application.status?.service_deployment_status === ServiceDeploymentStatusEnum.OUT_OF_DATE
            ? 'redeployed'
            : 'deployed'}{' '}
        </p>
        <Button
          style={ButtonStyle.FLAT}
          iconRight={IconAwesomeEnum.ROTATE_RIGHT}
          size={ButtonSize.TINY}
          onClick={props.onClickCTA}
          className="!text-warning-900"
        >
          {props.application.status?.service_deployment_status === ServiceDeploymentStatusEnum.OUT_OF_DATE
            ? 'Redeploy'
            : 'Deploy'}{' '}
          now
        </Button>
      </div>
    </div>
  )
}

export default NeedRedeployFlag

/*
<qovery-announce icon="info" *ngIf="serviceDeploymentStatus === ServiceDeploymentStatus.OUT_OF_DATE">
  <p>The {{ serviceType }} needs to be restarted to apply the setting update.</p>
  <span class="q-link" (click)="redeploy.emit()">Redeploy</span>
</qovery-announce>

<qovery-announce icon="info" *ngIf="serviceDeploymentStatus === ServiceDeploymentStatus.NEVER_DEPLOYED">
  <p>This service has been created but not yet deployed. Deploy it to access it.</p>
  <span class="q-link" (click)="redeploy.emit()">Deploy</span>
</qovery-announce>
*/
