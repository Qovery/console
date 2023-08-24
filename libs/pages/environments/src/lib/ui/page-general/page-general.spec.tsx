import { render } from '__tests__/utils/setup-jest'
import { ServiceDeploymentStatusEnum, StateEnum } from 'qovery-typescript-axios'
import { environmentFactoryMock } from '@qovery/shared/factories'
import { PageGeneral, type PageGeneralProps } from './page-general'

let props: PageGeneralProps

const environments = environmentFactoryMock(2)

beforeEach(() => {
  props = {
    environments: environments.map(({ id, ...rest }) => ({
      id,
      status: {
        state: StateEnum.STOPPED,
        id,
        service_deployment_status: ServiceDeploymentStatusEnum.UP_TO_DATE,
      },
      ...rest,
    })),
    buttonActions: [
      {
        name: 'redeploy',
        action: () => null,
      },
      {
        name: 'deploy',
        action: () => null,
      },
      {
        name: 'stop',
        action: () => null,
      },
      {
        name: 'cancel-deployment',
        action: () => null,
      },
      {
        name: 'delete',
        action: () => null,
      },
    ],
    listHelpfulLinks: [
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment',
        linkLabel: 'How to manage my environment',
        external: true,
      },
    ],
  }
})

describe('General', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageGeneral {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
