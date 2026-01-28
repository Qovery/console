import { VALID_FILTER_KEYS, buildQueryParams, buildValueOptions } from './search-service-logs'

describe('SearchServiceLogs helpers', () => {
  describe('VALID_FILTER_KEYS', () => {
    it('should include nginx in valid filter keys', () => {
      expect(VALID_FILTER_KEYS).toContain('nginx')
    })

    it('should include envoy in valid filter keys', () => {
      expect(VALID_FILTER_KEYS).toContain('envoy')
    })

    it('should include all expected filter keys', () => {
      expect(VALID_FILTER_KEYS).toEqual(
        expect.arrayContaining(['level', 'instance', 'message', 'nginx', 'envoy', 'search', 'deploymentId'])
      )
    })
  })

  describe('buildValueOptions', () => {
    it('should create nginx filter option', () => {
      const result = buildValueOptions({ nginx: true } as any)

      expect(result).toEqual([{ value: 'nginx:true', label: 'nginx:true' }])
    })

    it('should create envoy filter option', () => {
      const result = buildValueOptions({ envoy: true } as any)

      expect(result).toEqual([{ value: 'envoy:true', label: 'envoy:true' }])
    })

    it('should create level filter option', () => {
      const result = buildValueOptions({ level: 'error' } as any)

      expect(result).toEqual([{ value: 'level:error', label: 'level:error' }])
    })

    it('should create instance filter option', () => {
      const result = buildValueOptions({ instance: 'pod-123' } as any)

      expect(result).toEqual([{ value: 'instance:pod-123', label: 'instance:pod-123' }])
    })

    it('should create message filter option', () => {
      const result = buildValueOptions({ message: 'error occurred' } as any)

      expect(result).toEqual([{ value: 'message:error occurred', label: 'message:error occurred' }])
    })

    it('should create search option', () => {
      const result = buildValueOptions({ search: 'error text' } as any)

      expect(result).toEqual([{ value: 'error text', label: 'error text' }])
    })

    it('should handle multiple filter options', () => {
      const result = buildValueOptions({ level: 'error', nginx: true, instance: 'pod-123' } as any)

      expect(result).toHaveLength(3)
      expect(result).toContainEqual({ value: 'level:error', label: 'level:error' })
      expect(result).toContainEqual({ value: 'instance:pod-123', label: 'instance:pod-123' })
      expect(result).toContainEqual({ value: 'nginx:true', label: 'nginx:true' })
    })

    it('should handle both nginx and envoy params', () => {
      const result = buildValueOptions({ nginx: true, envoy: true } as any)

      expect(result).toHaveLength(2)
      expect(result).toContainEqual({ value: 'nginx:true', label: 'nginx:true' })
      expect(result).toContainEqual({ value: 'envoy:true', label: 'envoy:true' })
    })

    it('should handle deploymentId filter option', () => {
      const result = buildValueOptions({ deploymentId: 'deploy-123' } as any)

      expect(result).toEqual([{ value: 'deploymentId:deploy-123', label: 'deploymentId:deploy-123' }])
    })
  })

  describe('buildQueryParams', () => {
    it('should parse nginx filter', () => {
      const result = buildQueryParams('nginx:true')

      expect(result.nginx).toBe(true)
    })

    it('should parse envoy filter', () => {
      const result = buildQueryParams('envoy:true')

      expect(result.envoy).toBe(true)
    })

    it('should parse level filter', () => {
      const result = buildQueryParams('level:error')

      expect(result.level).toBe('error')
    })

    it('should parse instance filter', () => {
      const result = buildQueryParams('instance:pod-123')

      expect(result.instance).toBe('pod-123')
    })

    it('should parse message filter', () => {
      const result = buildQueryParams('message:error occurred')

      expect(result.message).toBe('error')
    })

    it('should parse multiple filters including nginx', () => {
      const result = buildQueryParams('level:error nginx:true')

      expect(result.level).toBe('error')
      expect(result.nginx).toBe(true)
    })

    it('should parse multiple filters including envoy', () => {
      const result = buildQueryParams('level:error envoy:true')

      expect(result.level).toBe('error')
      expect(result.envoy).toBe(true)
    })

    it('should parse instance filter with envoy', () => {
      const result = buildQueryParams('instance:envoy-pod-123 envoy:true')

      expect(result.instance).toBe('envoy-pod-123')
      expect(result.envoy).toBe(true)
    })

    it('should extract search text without filters', () => {
      const result = buildQueryParams('nginx:true error occurred')

      expect(result.nginx).toBe(true)
      expect(result.search).toBe('error occurred')
    })

    it('should extract search text with envoy filter', () => {
      const result = buildQueryParams('envoy:true upstream timeout')

      expect(result.envoy).toBe(true)
      expect(result.search).toBe('upstream timeout')
    })

    it('should handle both nginx and envoy filters together', () => {
      const result = buildQueryParams('nginx:true envoy:true level:error')

      expect(result.nginx).toBe(true)
      expect(result.envoy).toBe(true)
      expect(result.level).toBe('error')
    })

    it('should handle deploymentId filter', () => {
      const result = buildQueryParams('deploymentId:deploy-123')

      expect(result.deploymentId).toBe('deploy-123')
    })

    it('should handle plain text without filters', () => {
      const result = buildQueryParams('just some search text')

      expect(result.search).toBe('just some search text')
      expect(result.nginx).toBeUndefined()
      expect(result.envoy).toBeUndefined()
    })
  })
})
