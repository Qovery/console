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
    props.isFetched = false

    renderWithProviders(<PageOrganizationApi {...props} apiTokens={[]} />)
    screen.getByTestId('spinner')
  })

  it('should have an empty screen', () => {
    props.isFetched = true
    renderWithProviders(<PageOrganizationApi {...props} apiTokens={[]} />)

    screen.findByText('No Api Token found.')
  })

  it('should display a row', () => {
    props.isFetched = true
    renderWithProviders(<PageOrganizationApi {...props} />)

    screen.getByText('test')
    screen.getByTestId('delete-token')
  })

  it('should call on delete token', async () => {
    props.isFetched = true

    const { userEvent } = renderWithProviders(<PageOrganizationApi {...props} />)

    const deleteButton = screen.getByTestId('delete-token')
    await userEvent.click(deleteButton)

    expect(props.onDelete).toHaveBeenCalled()
  })

  it('should call addToken', async () => {
    props.isFetched = true

    const { userEvent } = renderWithProviders(<PageOrganizationApi {...props} />)

    const btn = screen.getByRole('button', { name: 'Add new' })
    await userEvent.click(btn)

    expect(props.onAddToken).toHaveBeenCalled()
  })
})
