import { convertCpuToVCpu } from './convert-cpu-to-vcpu'

describe('test convert cpu to vcpu', () => {
  it('should convert cpu to vcpu', () => {
    expect(convertCpuToVCpu(2500)).toEqual(2.5)
  })
  it('should convert vcpu to cpu', () => {
    expect(convertCpuToVCpu(2.5, true)).toEqual(2500)
  })
})
