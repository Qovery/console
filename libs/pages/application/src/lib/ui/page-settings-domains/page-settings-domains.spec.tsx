import { act, findByText, getByDisplayValue, getByRole, getByTestId, queryByTestId } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { CustomDomainStatusEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { PageSettingsDomains, PageSettingsDomainsProps } from './page-settings-domains'

let props: PageSettingsDomainsProps

describe('PagesSettingsDomains', () => {
  beforeEach(() => {
    props = {
      application: applicationFactoryMock(1)[0],
      onAddDomain: jest.fn(),
      onDelete: jest.fn(),
      onEdit: jest.fn(),
      domains: [],
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsDomains {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render the placeholder if no domains found', () => {
    const { baseElement } = render(<PageSettingsDomains {...props} />)
    findByText(baseElement, 'No domains are set')
  })

  it('should render an add button and handle its click', async () => {
    const spy = jest.fn()
    props.onAddDomain = spy
    const { baseElement } = render(<PageSettingsDomains {...props} />)
    const button = getByRole(baseElement, 'button', { name: 'Add Domain' })

    await act(() => {
      button.click()
    })
    expect(spy).toHaveBeenCalled()
  })

  it('should render a list of domain', async () => {
    props.domains = [
      {
        id: '1',
        domain: 'example.com',
        status: CustomDomainStatusEnum.VALIDATION_PENDING,
        validation_domain: 'example.com',
        updated_at: '2020-01-01T00:00:00Z',
        created_at: '2020-01-01T00:00:00Z',
      },
      {
        id: '2',
        domain: 'example2.com',
        status: CustomDomainStatusEnum.VALIDATION_PENDING,
        validation_domain: 'example.com',
        updated_at: '2020-01-01T00:00:00Z',
        created_at: '2020-01-01T00:00:00Z',
      },
    ]
    const { baseElement } = render(<PageSettingsDomains {...props} />)

    getByDisplayValue(baseElement, 'example.com')
    getByDisplayValue(baseElement, 'example2.com')
  })

  it('should render a form row with one edit and one delete button', async () => {
    const customDomain = {
      id: '1',
      domain: 'example.com',
      status: CustomDomainStatusEnum.VALIDATION_PENDING,
      validation_domain: 'example.com',
      updated_at: '2020-01-01T00:00:00Z',
      created_at: '2020-01-01T00:00:00Z',
    }

    props.domains = [customDomain]
    const spyEdit = jest.fn()
    props.onEdit = spyEdit

    const spyDelete = jest.fn()
    props.onDelete = spyDelete

    const { baseElement } = render(<PageSettingsDomains {...props} />)

    const editButton = getByTestId(baseElement, 'edit-button')
    const deleteButton = getByTestId(baseElement, 'delete-button')

    await act((): void => {
      editButton.click()
      deleteButton.click()
    })

    expect(spyEdit).toHaveBeenCalledWith(customDomain)
    expect(spyDelete).toHaveBeenCalledWith(customDomain)
  })

  it('should show a loader', async () => {
    props.domains = []
    props.loading = 'not loaded'

    const { baseElement } = render(<PageSettingsDomains {...props} />)

    getByTestId(baseElement, 'spinner')
  })

  it('should not show a loader', async () => {
    props.domains = []
    props.loading = 'loaded'

    const { baseElement } = render(<PageSettingsDomains {...props} />)

    expect(queryByTestId(baseElement, 'spinner')).toBeNull()
  })
})
