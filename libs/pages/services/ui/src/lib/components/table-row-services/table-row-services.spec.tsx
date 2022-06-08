import { applicationFactoryMock } from '@console/domains/application'
import { render } from '__tests__/utils/setup-jest'
import { ServicesEnum } from '../general/general'

import TableRowServices, { TableRowServicesProps } from './table-row-services'

let props: TableRowServicesProps

beforeEach(() => {
  props = {
    data: applicationFactoryMock(1)[0],
    type: ServicesEnum.APPLICATION,
    dataHead: [],
    link: '/',
  }
})

describe('TableRowServices', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TableRowServices {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
