import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type Cluster, WeekdayEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { NodepoolsResourcesSettings, formatTimeRange, formatWeekdays, shortenDay } from './nodepools-resources-settings'

const mockCluster = {
  features: [
    {
      id: 'KARPENTER',
      value_object: {
        value: {
          qovery_node_pools: {
            default_override: {
              limits: {
                max_cpu_in_vcpu: 8,
                max_memory_in_gibibytes: 16,
              },
            },
            stable_override: {
              limits: {
                max_cpu_in_vcpu: 8,
                max_memory_in_gibibytes: 16,
              },
              consolidation: {
                enabled: true,
                days: ['MONDAY'],
                start_time: 'PT22:00',
                duration: 'PT8H',
              },
            },
          },
        },
      },
    },
  ],
  region: 'us-east-1',
} as Cluster

describe('NodepoolsResourcesSettings', () => {
  describe('formatTimeRange', () => {
    it('should format time range correctly', () => {
      expect(formatTimeRange('PT22:00', 'PT8H')).toEqual({
        start: '10:00 pm',
        end: '6:00 am',
      })
    })

    it('should handle hours and minutes in duration', () => {
      expect(formatTimeRange('PT22:00', 'PT1H30M')).toEqual({
        start: '10:00 pm',
        end: '11:30 pm',
      })
    })
  })

  describe('shortenDay', () => {
    it('should shorten day names correctly', () => {
      expect(shortenDay('MONDAY')).toBe('Mon')
      expect(shortenDay('FRIDAY')).toBe('Fri')
    })
  })

  describe('formatWeekdays', () => {
    it('should handle empty array', () => {
      expect(formatWeekdays([])).toBe('')
    })

    it('should return "Operates every day" for full week', () => {
      const fullWeek = Object.keys(WeekdayEnum)
      expect(formatWeekdays(fullWeek)).toBe('Operates every day')
    })

    it('should format consecutive days with "to"', () => {
      expect(formatWeekdays(['MONDAY', 'TUESDAY', 'WEDNESDAY'])).toBe('Monday to Wednesday')
    })

    it('should format single day', () => {
      expect(formatWeekdays(['MONDAY'])).toBe('Monday')
    })

    it('should format non-consecutive days with commas', () => {
      expect(formatWeekdays(['MONDAY', 'WEDNESDAY', 'FRIDAY'])).toBe('Mon, Wed, Fri')
    })
  })

  describe('Component', () => {
    it('should display default values from cluster configuration', () => {
      const { debug, baseElement } = renderWithProviders(
        wrapWithReactHookForm(<NodepoolsResourcesSettings cluster={mockCluster} />, {
          defaultValues: {
            karpenter: {
              qovery_node_pools: {
                default_override: {
                  limits: {
                    max_cpu_in_vcpu: 12,
                    max_memory_in_gibibytes: 24,
                  },
                },
                stable_override: {
                  limits: {
                    max_cpu_in_vcpu: 16,
                    max_memory_in_gibibytes: 32,
                  },
                  consolidation: {
                    enabled: true,
                    days: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
                    start_time: 'PT20:00',
                    duration: 'PT4H',
                  },
                },
              },
            },
          },
        })
      )

      debug(baseElement, 10000)

      // Check stable nodepool values
      expect(screen.getByText('vCPU limit: 16 vCPU;')).toBeInTheDocument()
      expect(screen.getByText('Memory limit: 32 GiB')).toBeInTheDocument()
      expect(screen.getByText('Mon, Wed, Fri,')).toBeInTheDocument()
      expect(screen.getByText('8:00 pm to 12:00 am')).toBeInTheDocument()

      // Check default nodepool values
      expect(screen.getByText('vCPU limit: 12 vCPU;')).toBeInTheDocument()
      expect(screen.getByText('Memory limit: 24 GiB')).toBeInTheDocument()
    })
  })
})
