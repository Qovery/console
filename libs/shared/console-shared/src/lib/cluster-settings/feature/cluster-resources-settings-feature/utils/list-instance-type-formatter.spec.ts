import { listInstanceTypeFormatter } from './list-instance-type-formatter'

describe('listInstanceTypeFormatter', () => {
  it('should return a list of instance type', () => {
    const list = [
      {
        name: 't2.micro',
        cpu: 1,
        ram_in_gb: 1,
        type: 't2.micro',
        architecture: 'x86_64',
      },
      {
        name: 't2.small',
        cpu: 1,
        ram_in_gb: 2,
        type: 't2.small',
        architecture: 'x86_64',
      },
      {
        name: 't2.medium',
        cpu: 2,
        ram_in_gb: 4,
        type: 't2.medium',
        architecture: 'arm64',
      },
    ]
    const expected = [
      {
        label: 't2.micro (1CPU - 1GB RAM - x86_64)',
        value: 't2.micro',
      },
      {
        label: 't2.small (1CPU - 2GB RAM - x86_64)',
        value: 't2.small',
      },
      {
        label: 't2.medium (2CPU - 4GB RAM - arm64)',
        value: 't2.medium',
      },
    ]
    expect(listInstanceTypeFormatter(list)).toEqual(expected)
  })
})
