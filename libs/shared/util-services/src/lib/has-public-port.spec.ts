import { StateEnum } from 'qovery-typescript-axios'
import { hasPublicPort } from './has-public-port'

describe('hasPublicPort', () => {
  it('should return true when ingressDeploymentStatus is DEPLOYED', () => {
    expect(hasPublicPort(StateEnum.DEPLOYED)).toBe(true)
  })

  it('should return true when ingressDeploymentStatus is WAITING_RUNNING', () => {
    expect(hasPublicPort(StateEnum.WAITING_RUNNING)).toBe(true)
  })

  it('should return false when ingressDeploymentStatus is anything else', () => {
    expect(hasPublicPort(StateEnum.BUILDING)).toBe(false)
    expect(hasPublicPort(StateEnum.BUILD_ERROR)).toBe(false)
    expect(hasPublicPort(StateEnum.CANCELED)).toBe(false)
    expect(hasPublicPort(StateEnum.CANCELING)).toBe(false)
    expect(hasPublicPort(StateEnum.DELETED)).toBe(false)
    expect(hasPublicPort(StateEnum.DELETE_ERROR)).toBe(false)
    expect(hasPublicPort(StateEnum.DELETE_QUEUED)).toBe(false)
    expect(hasPublicPort(StateEnum.DELETING)).toBe(false)
    expect(hasPublicPort(StateEnum.DEPLOYING)).toBe(false)
    expect(hasPublicPort(StateEnum.DEPLOYMENT_ERROR)).toBe(false)
    expect(hasPublicPort(StateEnum.DEPLOYMENT_QUEUED)).toBe(false)
    expect(hasPublicPort(StateEnum.QUEUED)).toBe(false)
    expect(hasPublicPort(StateEnum.READY)).toBe(false)
    expect(hasPublicPort(StateEnum.RECAP)).toBe(false)
    expect(hasPublicPort(StateEnum.RESTARTED)).toBe(false)
    expect(hasPublicPort(StateEnum.RESTARTING)).toBe(false)
    expect(hasPublicPort(StateEnum.RESTART_ERROR)).toBe(false)
    expect(hasPublicPort(StateEnum.RESTART_QUEUED)).toBe(false)
    expect(hasPublicPort(StateEnum.STOPPED)).toBe(false)
    expect(hasPublicPort(StateEnum.STOPPING)).toBe(false)
    expect(hasPublicPort(StateEnum.STOP_ERROR)).toBe(false)
    expect(hasPublicPort(StateEnum.STOP_QUEUED)).toBe(false)
    expect(hasPublicPort(StateEnum.WAITING_DELETING)).toBe(false)
    expect(hasPublicPort(StateEnum.WAITING_RESTARTING)).toBe(false)
    expect(hasPublicPort(StateEnum.WAITING_STOPPING)).toBe(false)
  })
})
