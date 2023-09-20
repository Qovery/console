import { ClusterLogsStepEnum } from 'qovery-typescript-axios'
import { clusterLogFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { LayoutLogs, type LayoutLogsProps } from './layout-logs'

describe('LayoutLogs', () => {
  const props: LayoutLogsProps = {
    type: 'deployment',
    data: {
      loadingStatus: 'loaded',
      items: clusterLogFactoryMock(2, true),
    },
    tabInformation: <div>information</div>,
  }

  beforeEach(() => {
    window.HTMLElement.prototype.scroll = jest.fn()
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<LayoutLogs {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have loading screen', () => {
    props.data = {
      loadingStatus: 'not loaded',
      items: [],
    }

    renderWithProviders(<LayoutLogs {...props} />)

    screen.getByTestId('placeholder-screen')
  })

  it('should have screen when data is empty', () => {
    props.data = {
      loadingStatus: 'loaded',
      hideLogs: true,
      items: [],
    }

    renderWithProviders(<LayoutLogs {...props} />)

    screen.getByTestId('placeholder-screen')
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

    renderWithProviders(<LayoutLogs {...props} />)

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

    renderWithProviders(<LayoutLogs {...props} />)

    const tabsLogs = screen.getByTestId('tabs-logs')

    expect(tabsLogs).toBeInTheDocument()
  })

  it('should have a navigation', () => {
    props.data = {
      loadingStatus: 'loaded',
      items: [
        {
          created_at: 1667834316521,
          message: 'message',
          pod_name: 'app-z9d11ee4f-7d754477b6-k9sl7',
          version: '53deb16f853aef759b8be84fbeec96e9727',
        },
      ],
    }
    props.withLogsNavigation = true

    const { getByText } = renderWithProviders(<LayoutLogs {...props} />)

    getByText('Deployment logs')
    getByText('Live logs')
  })

  it('should have debug checkbox when debug is true', () => {
    props.data = {
      loadingStatus: 'loaded',
      items: [
        {
          created_at: 1667834316521,
          message: 'message',
          pod_name: 'app-z9d11ee4f-7d754477b6-k9sl7',
          version: '53deb16f853aef759b8be84fbeec96e9727',
        },
        {
          created_at: 1667834316521,
          message: 'message',
          pod_name: ' NGINX',
          version: '53deb16f853aef759b8be84fbeec96e9722',
        },
      ],
    }
    props.enabledNginx = true
    props.setEnabledNginx = jest.fn()

    renderWithProviders(<LayoutLogs {...props} />)

    const checkboxDebug = screen.getByTestId('checkbox-debug')
    expect(checkboxDebug)
  })

  it('should have progressing bar', () => {
    renderWithProviders(<LayoutLogs isProgressing={true} {...props} />)
    screen.getByRole('progressbar')
  })
})
