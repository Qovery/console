import { ServiceTypeEnum } from '@qovery/shared/enums'
import {
  Button,
  ButtonIcon,
  ButtonIconStyle,
  ButtonSize,
  ButtonStyle,
  Icon,
  IconAwesomeEnum,
  Link,
} from '@qovery/shared/ui'
import {
  GeneralData,
  PortData,
  ResourcesData,
} from '../../../feature/page-application-create-feature/application-creation-flow.interface'

export interface PageApplicationInstallProps {
  onSubmit: () => void
  onPrevious: () => void
  generalData: GeneralData
  resourcesData: ResourcesData
  portsData: PortData
  gotoGlobalInformation: () => void
  gotoResources: () => void
  gotoPorts: () => void
}

export function PageApplicationInstall(props: PageApplicationInstallProps) {
  return (
    <div>
      <div className="mb-10">
        <div className="flex justify-between mb-2 items-center">
          <h3 className="text-text-700 text-lg">Ready to install your Application</h3>
        </div>
        <p className="text-xs text-text-500 mb-2">
          The basic application setup is done, you can now deploy your application or move forward with some advanced
          setup.
        </p>
        <Link link="#" linkLabel="link" external={true} />
      </div>

      <div className="mb-10">
        <div className="flex p-4 w-full border rounded border-element-light-lighter-500 bg-element-light-lighter-200 mb-2">
          <Icon name={IconAwesomeEnum.CHECK} className="text-green-500 mr-2" />
          <div className="mr-auto flex-grow mr-2">
            <div className="text-sm text-text-600 font-bold mb-2">General informations</div>
            <ul className="text-text-400 text-sm list-none">
              <li>{props.generalData.name}</li>
              <li>{props.generalData.serviceType === ServiceTypeEnum.APPLICATION ? 'Application' : 'Container'}</li>
            </ul>
          </div>

          <ButtonIcon
            onClick={props.gotoGlobalInformation}
            icon={IconAwesomeEnum.WHEEL}
            style={ButtonIconStyle.FLAT}
            iconClassName="text-element-light-lighter-700"
          />
        </div>

        <div className="flex p-4 w-full border rounded border-element-light-lighter-500 bg-element-light-lighter-200 mb-2">
          <Icon name={IconAwesomeEnum.CHECK} className="text-green-500 mr-2" />
          <div className="mr-auto flex-grow mr-2">
            <div className="text-sm text-text-600 font-bold mb-2">Resources</div>
            <ul className="text-text-400 text-sm list-none">
              <li>Cpu: {props.resourcesData.cpu[0]}</li>
              <li>Memory: {props.resourcesData.memory}</li>
              <li>
                Instances: {props.resourcesData.instances[0]} - {props.resourcesData.instances[1]}
              </li>
            </ul>
          </div>

          <ButtonIcon
            onClick={props.gotoResources}
            icon={IconAwesomeEnum.WHEEL}
            style={ButtonIconStyle.FLAT}
            iconClassName="text-element-light-lighter-700"
          />
        </div>

        <div className="flex p-4 w-full border rounded border-element-light-lighter-500 bg-element-light-lighter-200 mb-2">
          <Icon name={IconAwesomeEnum.CHECK} className="text-green-500 mr-2" />
          <div className="mr-auto flex-grow mr-2">
            <div className="text-sm text-text-600 font-bold mb-2">Ports</div>
            <p className="text-text-400 text-sm">Hello</p>
          </div>

          <ButtonIcon
            onClick={props.gotoPorts}
            icon={IconAwesomeEnum.WHEEL}
            style={ButtonIconStyle.FLAT}
            iconClassName="text-element-light-lighter-700"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button onClick={props.onPrevious} type="button" size={ButtonSize.XLARGE} style={ButtonStyle.STROKED}>
          Back
        </Button>
        <Button dataTestId="button-submit" type="submit" size={ButtonSize.XLARGE} style={ButtonStyle.BASIC}>
          Continue
        </Button>
      </div>
    </div>
  )
}

export default PageApplicationInstall
