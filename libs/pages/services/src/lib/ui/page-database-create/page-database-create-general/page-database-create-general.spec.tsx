import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import PageDatabaseCreateGeneral, { PageDatabaseCreateGeneralProps } from './page-database-create-general'

const props: PageDatabaseCreateGeneralProps = {
  onSubmit: jest.fn(),
  databaseVersionOptions: {},
  databaseTypeOptions: [],
}

describe('PageDatabaseCreateGeneral', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<PageDatabaseCreateGeneral {...props} />))
    expect(baseElement).toBeTruthy()
  })
})
