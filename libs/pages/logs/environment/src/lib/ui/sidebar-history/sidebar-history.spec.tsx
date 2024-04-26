import { StateEnum } from 'qovery-typescript-axios'
import { ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { trimId } from '@qovery/shared/util-js'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
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
            name: 'my-app-1',
          },
        ],
      },
      {
        id: '3',
        created_at: currentDate,
        applications: [
          {
            id: '1',
            created_at: currentDate,
            name: 'my-app-3',
          },
        ],
      },
    ],
    pathLogs: ENVIRONMENT_LOGS_URL('1', '2', '3'),
    serviceId: '4',
    versionId: '5',
    environmentState: StateEnum.BUILDING,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<SidebarHistory {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should button to back logs home', async () => {
    renderWithProviders(<SidebarHistory {...props} />)

    const btn = screen.getByTestId('btn-back-logs')
    expect(btn.getAttribute('href')).toBe('/organization/1/project/2/environment/3/logs')
  })

  it('should open the menu and navigate to the logs page', async () => {
    const { userEvent } = renderWithProviders(<SidebarHistory {...props} />)

    const btn = screen.getByRole('button', { name: 'Deployment log history' })
    await userEvent.click(btn)

    const item = screen.getByText(trimId(props.data[1].id))
    await userEvent.click(item)

    expect(mockNavigate).toHaveBeenCalledWith('/organization/1/project/2/environment/3/logs/4/deployment-logs/2')
  })

  it('should have latest label if the environmentState is not new', async () => {
    props.environmentState = StateEnum.DEPLOYED
    renderWithProviders(<SidebarHistory {...props} />)

    screen.getByText('Latest')
  })

  it('should have new label if deployment is in progress', async () => {
    props.environmentState = StateEnum.CANCELING
    props.versionId = '3'
    props.serviceId = '1'

    renderWithProviders(<SidebarHistory {...props} />)
    screen.getByText('New')
  })

  it('should have a button with numbers of deployment before the latest', async () => {
    props.environmentState = StateEnum.DEPLOYED
    props.versionId = '3'
    props.serviceId = '1'
    renderWithProviders(<SidebarHistory {...props} />)

    screen.getByText('2')
  })
})
