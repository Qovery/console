import { act, getByRole, getByTestId, getByText, render } from '__tests__/utils/setup-jest'
import { OrganizationApiTokenScope } from 'qovery-typescript-axios'
import { PageOrganizationApi, PageOrganizationApiProps } from './page-organization-api'

describe('PageOrganizationApi', () => {
  const props: PageOrganizationApiProps = {
    loading: 'loaded',
    onDelete: jest.fn(),
    onAddToken: jest.fn(),
    apiTokens: [
      {
        name: 'test',
        id: 'id',
        description: 'description',
        created_at: new Date().toDateString(),
        scope: OrganizationApiTokenScope.ADMIN,
        updated_at: new Date().toDateString(),
      },
    ],
  }

  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationApi {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have an loader spinner', () => {
    props.loading = 'loading'

    const { getByTestId } = render(<PageOrganizationApi {...props} apiTokens={[]} />)
    getByTestId('loader')
  })

  it('should have an empty screen', () => {
    props.loading = 'loaded'

    const { getByTestId } = render(<PageOrganizationApi {...props} apiTokens={[]} />)

    getByTestId('empty-state')
  })

  it('should display a row', () => {
    props.loading = 'loaded'

    const { baseElement } = render(<PageOrganizationApi {...props} />)

    getByText(baseElement, 'test')
    getByTestId(baseElement, 'delete-token')
  })

  it('should call on delete token', async () => {
    props.loading = 'loaded'

    const { baseElement } = render(<PageOrganizationApi {...props} />)

    const deleteButton = getByTestId(baseElement, 'delete-token')
    await act(() => {
      deleteButton.click()
    })

    expect(props.onDelete).toHaveBeenCalled()
  })

  it('should call addToken', async () => {
    props.loading = 'loaded'

    const { baseElement } = render(<PageOrganizationApi {...props} />)

    await act(() => {
      getByRole(baseElement, 'button', { name: 'Add new' }).click()
    })

    expect(props.onAddToken).toHaveBeenCalled()
  })
})
