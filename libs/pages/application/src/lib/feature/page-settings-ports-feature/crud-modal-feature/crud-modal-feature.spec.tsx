import { render } from '__tests__/utils/setup-jest'
import { PortProtocolEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock } from '@qovery/shared/factories'
import CrudModalFeature, { CrudModalFeatureProps, handleSubmit } from './crud-modal-feature'

const application = applicationFactoryMock(1)[0]

const props: CrudModalFeatureProps = {
  port: application.ports?.[0],
  application: application,
  projectId: '0',
  onClose: jest.fn(),
}

describe('CrudModalFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CrudModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should submit a new port', () => {
    const app = handleSubmit(
      {
        internal_port: '520',
        external_port: '340',
        publicly_accessible: false,
        name: 'p520',
        protocol: PortProtocolEnum.HTTP,
      },
      application
    )
    expect(app.ports).toHaveLength(2)
  })

  it('should submit a edit port', () => {
    const app = handleSubmit(
      {
        internal_port: '52',
        external_port: '340',
        publicly_accessible: false,
        name: 'p520',
        protocol: PortProtocolEnum.HTTP,
      },
      application,
      application.ports?.[0]
    )
    expect(app.ports).toHaveLength(1)
  })
})
