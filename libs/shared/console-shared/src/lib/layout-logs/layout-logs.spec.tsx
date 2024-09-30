import { ClusterLogsStepEnum } from 'qovery-typescript-axios'
import { clusterLogFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { LayoutLogs, type LayoutLogsProps } from './layout-logs'

describe('LayoutLogs', () => {
  const props: LayoutLogsProps = {
    type: 'infra',
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
})
