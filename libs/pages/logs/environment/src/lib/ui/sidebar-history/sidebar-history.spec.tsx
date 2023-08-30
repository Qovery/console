import { render, screen } from '__tests__/utils/setup-jest'
import { ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { dateFullFormat } from '@qovery/shared/util-dates'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { trimId } from '@qovery/shared/utils'
import SidebarHistory, { type SidebarHistoryProps } from './sidebar-history'

const currentDate = new Date().toString()
const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

describe('SidebarHistory', () => {
  const props: SidebarHistoryProps = {
    data: [
      {
        id: '1',
        created_at: currentDate,
        applications: [
          {
            id: '4',
            created_at: currentDate,
            name: 'my-app',
          },
        ],
      },
      {
        id: '2',
        created_at: currentDate,
        applications: [
          {
            id: '4',
            created_at: currentDate,
            name: 'my-app',
          },
        ],
      },
    ],
    pathLogs: ENVIRONMENT_LOGS_URL('1', '2', '3'),
    serviceId: '4',
    versionId: '5',
  }

  it('should render successfully', () => {
    const { baseElement } = render(<SidebarHistory {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should display the current deployment with date', () => {
    render(<SidebarHistory {...props} />)

    screen.getByText(`Deployment - ${dateFullFormat(currentDate)}`)
  })

  it('should open the menu and navigate to the logs page', async () => {
    const { userEvent } = renderWithProviders(<SidebarHistory {...props} />)

    const btn = screen.getByRole('button')
    await userEvent.click(btn)

    const item = screen.getByText(trimId(props.data[1].id))
    await userEvent.click(item)

    expect(mockNavigate).toHaveBeenCalledWith('/organization/1/project/2/environment/3/logs/4/deployment-logs/2')
  })
})
