import { render, screen } from '__tests__/utils/setup-jest'
import { ClusterLogsStepEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock } from '@qovery/domains/application'
import { environmentFactoryMock } from '@qovery/domains/environment'
import { clusterLogFactoryMock } from '@qovery/domains/organization'
import { LayoutLogsProps } from '@qovery/shared/ui'
import { LayoutLogs } from './layout-logs'

describe('LayoutLogs', () => {
  const props: LayoutLogsProps = {
    children: <div>children</div>,
    data: {
      loadingStatus: 'loaded',
      items: clusterLogFactoryMock(2, true),
    },
    tabInformation: <div>information</div>,
  }

  beforeEach(() => {
    window.HTMLElement.prototype.scroll = function () {}
  })

  it('should render successfully', () => {
    const { baseElement } = render(<LayoutLogs {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have loading screen', () => {
    props.data = {
      loadingStatus: 'not loaded',
      items: [],
    }

    render(<LayoutLogs {...props} />)

    const loadingScreen = screen.getByTestId('loading-screen')

    expect(loadingScreen.querySelector('p')?.textContent).toBe('Loading...')
  })

  it('should have screen when data is empty', () => {
    props.data = {
      loadingStatus: 'loaded',
      items: [],
    }

    render(<LayoutLogs {...props} />)

    const loadingScreen = screen.getByTestId('loading-screen')

    expect(loadingScreen.querySelector('p')?.textContent).toBe('Logs not available')
  })

  it('should have text with error line', () => {
    props.data = {
      loadingStatus: 'loaded',
      items: [
        {
          step: ClusterLogsStepEnum.UNKNOWN,
        },
      ],
    }
    props.errors = [
      {
        index: 2,
        timeAgo: 'hello',
        step: ClusterLogsStepEnum.CREATE_ERROR,
        error: {
          hint_message: 'my-message',
        },
      },
    ]

    render(<LayoutLogs {...props} />)

    const errorLine = screen.getByTestId('error-layout-line')

    expect(errorLine?.textContent).toBe('An error occured line 2')
  })

  it('should render an tabs logs', () => {
    props.data = {
      loadingStatus: 'loaded',
      items: [
        {
          step: ClusterLogsStepEnum.UNKNOWN,
        },
      ],
    }

    render(<LayoutLogs {...props} />)

    const tabsLogs = screen.getByTestId('tabs-logs')

    expect(tabsLogs).toBeInTheDocument()
  })

  it('should have navigation with application', () => {
    props.data = {
      loadingStatus: 'loaded',
      items: [
        {
          id: '1',
          created_at: '1667834316521',
          message: 'message',
          pod_name: 'app-z9d11ee4f-7d754477b6-k9sl7',
          version: '53deb16f853aef759b8be84fbeec96e9727',
        },
      ],
    }
    props.withLogsNavigation = true
    props.application = applicationFactoryMock(1)[0]

    render(<LayoutLogs {...props} />)

    const navApplication = screen.getByTestId('nav-application')

    expect(navApplication.textContent).toBe(props.application.name)
  })

  it('should have navigation with environment', () => {
    props.data = {
      loadingStatus: 'loaded',
      items: [
        {
          id: '1',
          created_at: '1667834316521',
          message: 'message',
          pod_name: 'app-z9d11ee4f-7d754477b6-k9sl7',
          version: '53deb16f853aef759b8be84fbeec96e9727',
        },
      ],
    }
    props.withLogsNavigation = true
    props.environment = environmentFactoryMock(1)[0]

    render(<LayoutLogs {...props} />)

    const navEnvironment = screen.getByTestId('nav-environment')
    expect(navEnvironment)
  })
})
