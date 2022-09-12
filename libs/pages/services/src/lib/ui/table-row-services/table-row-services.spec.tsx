import { render } from '__tests__/utils/setup-jest'
import { applicationFactoryMock } from '@console/domains/application'
import { ServiceTypeEnum } from '@console/shared/enums'
import TableRowServices, { TableRowServicesProps } from './table-row-services'

let props: TableRowServicesProps

beforeEach(() => {
  props = {
    data: applicationFactoryMock(1)[0],
    type: ServiceTypeEnum.APPLICATION,
    dataHead: [],
    link: '/',
    buttonActions: [
      {
        name: 'action',
        action: jest.fn(),
      },
    ],
    environmentMode: '',
  }
})

describe('TableRowServices', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TableRowServices {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
