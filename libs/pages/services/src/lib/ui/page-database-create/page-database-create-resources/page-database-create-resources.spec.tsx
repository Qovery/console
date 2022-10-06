import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import PageDatabaseCreateResources, { PageDatabaseCreateResourcesProps } from './page-database-create-resources'

const props: PageDatabaseCreateResourcesProps = {
  onSubmit: jest.fn(),
  onBack: jest.fn(),
}

describe('PageDatabaseCreateResources', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<PageDatabaseCreateResources {...props} />))
    expect(baseElement).toBeTruthy()
  })
})
