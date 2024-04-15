import { render } from '__tests__/utils/setup-jest'
import { ServiceDeploymentStatusEnum, StateEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { PageGeneral, type PageGeneralProps } from './page-general'

let props: PageGeneralProps

const applications = applicationFactoryMock(2)

beforeEach(() => {
  props = {
    environmentMode: '',
    services: applications.map(({ id, ...rest }) => ({
      id,
      ...rest,
      status: {
        state: StateEnum.STOPPED,
        id,
        service_deployment_status: ServiceDeploymentStatusEnum.UP_TO_DATE,
      },
    })),
    buttonActions: [
      {
        name: 'stop',
        action: jest.fn(),
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
