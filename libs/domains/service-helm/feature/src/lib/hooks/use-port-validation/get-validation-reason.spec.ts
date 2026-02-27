import { ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { getValidationReason } from './get-validation-reason'

describe('getValidationReason', () => {
  describe('when service has never been deployed', () => {
    it('should return SERVICE_NOT_DEPLOYED', () => {
      const result = getValidationReason(ServiceDeploymentStatusEnum.NEVER_DEPLOYED, 'STOPPED', [], false)

      expect(result).toBe('SERVICE_NOT_DEPLOYED')
    })

    it('should return SERVICE_NOT_DEPLOYED regardless of other states', () => {
      const result = getValidationReason(ServiceDeploymentStatusEnum.NEVER_DEPLOYED, 'RUNNING', [{}], false)

      expect(result).toBe('SERVICE_NOT_DEPLOYED')
    })
  })

  describe('when service is stopped', () => {
    it('should return SERVICE_STOPPED when running state is STOPPED', () => {
      const result = getValidationReason(ServiceDeploymentStatusEnum.UP_TO_DATE, 'STOPPED', [], false)

      expect(result).toBe('SERVICE_STOPPED')
    })

    it('should return SERVICE_STOPPED when K8s services is empty and not running', () => {
      const result = getValidationReason(ServiceDeploymentStatusEnum.UP_TO_DATE, 'DEPLOYING', [], false)

      expect(result).toBe('SERVICE_STOPPED')
    })
  })

  describe('when there is an API error', () => {
    it('should return API_ERROR when isError is true', () => {
      const result = getValidationReason(ServiceDeploymentStatusEnum.UP_TO_DATE, 'RUNNING', undefined, true)

      expect(result).toBe('API_ERROR')
    })

    it('should prioritize SERVICE_NOT_DEPLOYED over API_ERROR', () => {
      const result = getValidationReason(ServiceDeploymentStatusEnum.NEVER_DEPLOYED, 'RUNNING', undefined, true)

      expect(result).toBe('SERVICE_NOT_DEPLOYED')
    })

    it('should prioritize SERVICE_STOPPED over API_ERROR', () => {
      const result = getValidationReason(ServiceDeploymentStatusEnum.UP_TO_DATE, 'STOPPED', undefined, true)

      expect(result).toBe('SERVICE_STOPPED')
    })
  })

  describe('when validation can proceed', () => {
    it('should return null when service is deployed and running with K8s services', () => {
      const result = getValidationReason(ServiceDeploymentStatusEnum.UP_TO_DATE, 'RUNNING', [{}], false)

      expect(result).toBeNull()
    })

    it('should return null when service is out of date but running', () => {
      const result = getValidationReason(ServiceDeploymentStatusEnum.OUT_OF_DATE, 'RUNNING', [{}], false)

      expect(result).toBeNull()
    })

    it('should return null when K8s services array is empty but service is running', () => {
      const result = getValidationReason(ServiceDeploymentStatusEnum.UP_TO_DATE, 'RUNNING', [], false)

      expect(result).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('should handle undefined deployment status', () => {
      const result = getValidationReason(undefined, 'RUNNING', [{}], false)

      expect(result).toBeNull()
    })

    it('should handle undefined running state', () => {
      const result = getValidationReason(ServiceDeploymentStatusEnum.UP_TO_DATE, undefined, [{}], false)

      expect(result).toBeNull()
    })

    it('should handle undefined K8s services', () => {
      const result = getValidationReason(ServiceDeploymentStatusEnum.UP_TO_DATE, 'RUNNING', undefined, false)

      expect(result).toBeNull()
    })
  })
})
