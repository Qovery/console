import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type HelmPortRequestPortsInner, ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { renderHook } from '@qovery/shared/util-tests'
import type { KubernetesService } from './types'
import { usePortValidation } from './use-port-validation'

// Mock the external hooks
const mockUseDeploymentStatus = jest.fn()
const mockUseRunningStatus = jest.fn()
const mockUseKubernetesServices = jest.fn()

jest.mock('@qovery/domains/services/feature', () => ({
  useDeploymentStatus: (props: { environmentId?: string; serviceId?: string }) => mockUseDeploymentStatus(props),
  useRunningStatus: (props: { environmentId?: string; serviceId?: string }) => mockUseRunningStatus(props),
}))

jest.mock('../use-kubernetes-services/use-kubernetes-services', () => ({
  useKubernetesServices: (props: { helmId: string }) => mockUseKubernetesServices(props),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: PropsWithChildren) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

const createPort = (overrides: Partial<HelmPortRequestPortsInner> = {}): HelmPortRequestPortsInner => ({
  name: 'test-port',
  service_name: 'nginx',
  internal_port: 80,
  external_port: 443,
  protocol: 'HTTP',
  ...overrides,
})

const createK8sService = (
  name: string,
  namespace: string,
  ports: Array<{ port: number; name?: string }>
): KubernetesService => ({
  metadata: { name, namespace },
  service_spec: { ports },
})

describe('usePortValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseDeploymentStatus.mockReturnValue({
      data: { service_deployment_status: ServiceDeploymentStatusEnum.UP_TO_DATE },
      isLoading: false,
    })
    mockUseRunningStatus.mockReturnValue({
      data: { state: 'RUNNING' },
      isLoading: false,
    })
    mockUseKubernetesServices.mockReturnValue({
      data: [createK8sService('nginx', 'default', [{ port: 80 }])],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    })
  })

  describe('when service is deployed and running', () => {
    it('should return canValidate as true', () => {
      const { result } = renderHook(
        () =>
          usePortValidation({
            helmId: 'helm-123',
            environmentId: 'env-456',
            ports: [createPort()],
          }),
        { wrapper: createWrapper() }
      )

      expect(result.current.canValidate).toBe(true)
      expect(result.current.validationReason).toBeNull()
    })

    it('should validate ports against K8s services', () => {
      const ports = [
        createPort({ name: 'port-1', service_name: 'nginx', internal_port: 80 }),
        createPort({ name: 'port-2', service_name: 'missing', internal_port: 8080 }),
      ]

      const { result } = renderHook(
        () =>
          usePortValidation({
            helmId: 'helm-123',
            environmentId: 'env-456',
            ports,
          }),
        { wrapper: createWrapper() }
      )

      expect(result.current.results).toHaveLength(2)
      expect(result.current.results[0].status).toBe('valid')
      expect(result.current.results[1].status).toBe('invalid')
      expect(result.current.results[1].errorMessage).toBe("Service 'missing' not found")
    })

    it('should return empty results when no ports are configured', () => {
      const { result } = renderHook(
        () =>
          usePortValidation({
            helmId: 'helm-123',
            environmentId: 'env-456',
            ports: [],
          }),
        { wrapper: createWrapper() }
      )

      expect(result.current.results).toHaveLength(0)
    })
  })

  describe('when service has never been deployed', () => {
    beforeEach(() => {
      mockUseDeploymentStatus.mockReturnValue({
        data: { service_deployment_status: ServiceDeploymentStatusEnum.NEVER_DEPLOYED },
        isLoading: false,
      })
    })

    it('should return canValidate as false with SERVICE_NOT_DEPLOYED reason', () => {
      const { result } = renderHook(
        () =>
          usePortValidation({
            helmId: 'helm-123',
            environmentId: 'env-456',
            ports: [createPort()],
          }),
        { wrapper: createWrapper() }
      )

      expect(result.current.canValidate).toBe(false)
      expect(result.current.validationReason).toBe('SERVICE_NOT_DEPLOYED')
    })

    it('should return unknown status for all ports', () => {
      const { result } = renderHook(
        () =>
          usePortValidation({
            helmId: 'helm-123',
            environmentId: 'env-456',
            ports: [createPort()],
          }),
        { wrapper: createWrapper() }
      )

      expect(result.current.results[0].status).toBe('unknown')
    })
  })

  describe('when service is stopped', () => {
    beforeEach(() => {
      mockUseRunningStatus.mockReturnValue({
        data: { state: 'STOPPED' },
        isLoading: false,
      })
    })

    it('should return canValidate as false with SERVICE_STOPPED reason', () => {
      const { result } = renderHook(
        () =>
          usePortValidation({
            helmId: 'helm-123',
            environmentId: 'env-456',
            ports: [createPort()],
          }),
        { wrapper: createWrapper() }
      )

      expect(result.current.canValidate).toBe(false)
      expect(result.current.validationReason).toBe('SERVICE_STOPPED')
    })
  })

  describe('when K8s services API fails', () => {
    beforeEach(() => {
      mockUseKubernetesServices.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: jest.fn(),
      })
    })

    it('should return canValidate as false with API_ERROR reason', () => {
      const { result } = renderHook(
        () =>
          usePortValidation({
            helmId: 'helm-123',
            environmentId: 'env-456',
            ports: [createPort()],
          }),
        { wrapper: createWrapper() }
      )

      expect(result.current.canValidate).toBe(false)
      expect(result.current.validationReason).toBe('API_ERROR')
    })

    it('should provide retry function', () => {
      const mockRefetch = jest.fn()
      mockUseKubernetesServices.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
      })

      const { result } = renderHook(
        () =>
          usePortValidation({
            helmId: 'helm-123',
            environmentId: 'env-456',
            ports: [createPort()],
          }),
        { wrapper: createWrapper() }
      )

      result.current.retry()
      expect(mockRefetch).toHaveBeenCalled()
    })
  })

  describe('loading states', () => {
    it('should return isLoading true when deployment status is loading', () => {
      mockUseDeploymentStatus.mockReturnValue({
        data: undefined,
        isLoading: true,
      })

      const { result } = renderHook(
        () =>
          usePortValidation({
            helmId: 'helm-123',
            environmentId: 'env-456',
            ports: [createPort()],
          }),
        { wrapper: createWrapper() }
      )

      expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading true when K8s services are loading', () => {
      mockUseKubernetesServices.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        refetch: jest.fn(),
      })

      const { result } = renderHook(
        () =>
          usePortValidation({
            helmId: 'helm-123',
            environmentId: 'env-456',
            ports: [createPort()],
          }),
        { wrapper: createWrapper() }
      )

      expect(result.current.isLoading).toBe(true)
    })

    it('should return loading status for all ports when loading', () => {
      mockUseKubernetesServices.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        refetch: jest.fn(),
      })

      const { result } = renderHook(
        () =>
          usePortValidation({
            helmId: 'helm-123',
            environmentId: 'env-456',
            ports: [createPort()],
          }),
        { wrapper: createWrapper() }
      )

      expect(result.current.results[0].status).toBe('loading')
    })
  })

  describe('hook parameters', () => {
    it('should pass helmId to useKubernetesServices', () => {
      renderHook(
        () =>
          usePortValidation({
            helmId: 'helm-123',
            environmentId: 'env-456',
            ports: [],
          }),
        { wrapper: createWrapper() }
      )

      expect(mockUseKubernetesServices).toHaveBeenCalledWith({ helmId: 'helm-123' })
    })

    it('should pass environmentId and serviceId to useDeploymentStatus', () => {
      renderHook(
        () =>
          usePortValidation({
            helmId: 'helm-123',
            environmentId: 'env-456',
            ports: [],
          }),
        { wrapper: createWrapper() }
      )

      expect(mockUseDeploymentStatus).toHaveBeenCalledWith({
        environmentId: 'env-456',
        serviceId: 'helm-123',
      })
    })
  })
})
