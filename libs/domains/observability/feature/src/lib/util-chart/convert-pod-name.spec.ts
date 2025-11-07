import { convertPodName } from './convert-pod-name'

describe('convertPodName', () => {
  it('should convert qovery pod name', () => {
    expect(convertPodName('qovery-app-test-service-pod-123')).toBe('test-service-pod-123')
  })
})
