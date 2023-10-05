import { OrganizationApiTokenScope } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PageOrganizationApi, type PageOrganizationApiProps } from './page-organization-api'

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
        role_name: 'Admin',
        updated_at: new Date().toDateString(),
      },
    ],
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationApi {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have an loader spinner', () => {
    props.loading = 'loading'

    renderWithProviders(<PageOrganizationApi {...props} apiTokens={[]} />)
    screen.getByTestId('loader')
  })

  it('should have an empty screen', () => {
    props.loading = 'loaded'
    renderWithProviders(<PageOrganizationApi {...props} apiTokens={[]} />)

    screen.getByTestId('empty-state')
  })

  it('should display a row', () => {
    props.loading = 'loaded'
    renderWithProviders(<PageOrganizationApi {...props} />)

    screen.getByText('test')
    screen.getByTestId('delete-token')
  })

  it('should call on delete token', async () => {
    props.loading = 'loaded'

    const { userEvent } = renderWithProviders(<PageOrganizationApi {...props} />)

    const deleteButton = screen.getByTestId('delete-token')
    await userEvent.click(deleteButton)

    expect(props.onDelete).toHaveBeenCalled()
  })

  it('should call addToken', async () => {
    props.loading = 'loaded'

    const { userEvent } = renderWithProviders(<PageOrganizationApi {...props} />)

    const btn = screen.getByRole('button', { name: 'Add new' })
    await userEvent.click(btn)

    expect(props.onAddToken).toHaveBeenCalled()
  })
})
