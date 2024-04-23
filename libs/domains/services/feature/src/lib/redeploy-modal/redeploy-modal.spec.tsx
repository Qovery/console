import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useDeployService from '../hooks/use-deploy-service/use-deploy-service'
import * as useRestartService from '../hooks/use-restart-service/use-restart-service'
import { RedeployModal, type RedeployModalProps } from './redeploy-modal'

jest.mock('../hooks/use-deploy-service/use-deploy-service', () => {
  const mutateDeployService = jest.fn()
  return {
    ...jest.requireActual('../hooks/use-deploy-service/use-deploy-service'),
    useDeployService: () => ({
      mutateAsync: mutateDeployService,
      isLoading: false,
      error: {},
    }),
  }
})

jest.mock('../hooks/use-restart-service/use-restart-service', () => {
  const mutateRestartService = jest.fn()
  return {
    ...jest.requireActual('../hooks/use-restart-service/use-restart-service'),
    useRestartService: () => ({
      mutateAsync: mutateRestartService,
      isLoading: false,
      error: {},
    }),
  }
})

const useDeployServiceSpy = jest.spyOn(useDeployService, 'useDeployService') as jest.Mock
const useRestartServiceSpy = jest.spyOn(useRestartService, 'useRestartService') as jest.Mock

const mutateDeployService = jest.fn()
const mutateRestartService = jest.fn()

describe('RedeployModal', () => {
  const props: RedeployModalProps = {
    service: {
      environment: {
        id: '0',
      },
      serviceType: 'APPLICATION',
    },
  }

  beforeEach(() => {
    useDeployServiceSpy.mockReturnValue({
      mutateAsync: mutateDeployService,
      isLoading: false,
    })
    useRestartServiceSpy.mockReturnValue({
      mutateAsync: mutateRestartService,
      isLoading: false,
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<RedeployModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(<RedeployModal {...props} />)
    expect(baseElement).toMatchSnapshot()
  })

  it('should call deployService when action is redeploy', async () => {
    const { userEvent } = renderWithProviders(<RedeployModal {...props} />)

    const button = screen.getByRole('button', { name: /confirm/i })
    await userEvent.click(button)

    expect(mutateDeployService).toHaveBeenCalled()
  })

  it('should call restartService when action is restart', async () => {
    const { userEvent } = renderWithProviders(<RedeployModal {...props} />)

    const radio = screen.getByLabelText(/restart service/i)
    await userEvent.click(radio)

    const button = screen.getByRole('button', { name: /confirm/i })
    await userEvent.click(button)

    expect(mutateRestartService).toHaveBeenCalled()
  })
})
