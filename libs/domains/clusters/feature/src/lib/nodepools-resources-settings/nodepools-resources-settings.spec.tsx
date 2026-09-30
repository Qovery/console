import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type Cluster, WeekdayEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen, within } from '@qovery/shared/util-tests'
import { NodepoolsResourcesSettings, formatTimeRange, formatWeekdays, shortenDay } from './nodepools-resources-settings'

jest.mock('posthog-js/react', () => ({ useFeatureFlagEnabled: jest.fn() }))

const mockUseFeatureFlagEnabled = useFeatureFlagEnabled as jest.MockedFunction<typeof useFeatureFlagEnabled>

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
    beforeEach(() => {
      mockUseFeatureFlagEnabled.mockReturnValue(true)
    })

    it('hides drift blocking in the summary when the feature flag is off', () => {
      mockUseFeatureFlagEnabled.mockReturnValue(false)
      renderWithProviders(
        wrapWithReactHookForm(<NodepoolsResourcesSettings cluster={mockCluster} filter="default" />, {
          defaultValues: {
            karpenter: {
              qovery_node_pools: {
                stable_override: {
                  drift_blocking: {
                    enabled: true,
                    days: Object.values(WeekdayEnum),
                    start_time: 'PT21:00',
                    duration: 'PT2H',
                  },
                },
              },
            },
          },
        })
      )

      expect(screen.queryByText('Drift blocking')).not.toBeInTheDocument()
      expect(screen.queryByText('Every day, 9:00 pm to 11:00 pm (UTC)')).not.toBeInTheDocument()
    })

    it('shows disabled drift blocking without parsing its inactive schedule', () => {
      renderWithProviders(
        wrapWithReactHookForm(<NodepoolsResourcesSettings cluster={mockCluster} filter="default" />, {
          defaultValues: {
            karpenter: {
              qovery_node_pools: {
                stable_override: {
                  drift_blocking: {
                    enabled: false,
                    days: Object.values(WeekdayEnum),
                    start_time: 'unused',
                    duration: 'unused',
                  },
                },
              },
            },
          },
        })
      )

      expect(
        within(screen.getByText('Drift blocking').parentElement as HTMLElement).getByText('Disabled')
      ).toBeInTheDocument()
    })

    it('shows an unavailable schedule when an enabled drift window has no times', () => {
      renderWithProviders(
        wrapWithReactHookForm(<NodepoolsResourcesSettings cluster={mockCluster} filter="default" />, {
          defaultValues: {
            karpenter: {
              qovery_node_pools: {
                stable_override: {
                  drift_blocking: {
                    enabled: true,
                    days: Object.values(WeekdayEnum),
                    start_time: '',
                    duration: '',
                  },
                },
              },
            },
          },
        })
      )

      const driftSection = screen.getByText('Drift blocking').parentElement as HTMLElement
      expect(within(driftSection).getByText('Enabled, schedule unavailable')).toBeInTheDocument()
    })

    it('shows the configured weekdays for a drift window in existing cluster data', () => {
      renderWithProviders(
        wrapWithReactHookForm(<NodepoolsResourcesSettings cluster={mockCluster} filter="default" />, {
          defaultValues: {
            karpenter: {
              qovery_node_pools: {
                stable_override: {
                  drift_blocking: {
                    enabled: true,
                    days: ['MONDAY'],
                    start_time: 'PT21:00',
                    duration: 'PT2H',
                  },
                },
              },
            },
          },
        })
      )

      const driftSection = screen.getByText('Drift blocking').parentElement as HTMLElement
      expect(within(driftSection).getByText('Monday, 9:00 pm to 11:00 pm (UTC)')).toBeInTheDocument()
    })

    it('should display default values from cluster configuration', () => {
      renderWithProviders(
        wrapWithReactHookForm(<NodepoolsResourcesSettings cluster={mockCluster} filter="default" />, {
          defaultValues: {
            karpenter: {
              qovery_node_pools: {
                default_override: {
                  limits: {
                    enabled: true,
                    max_cpu_in_vcpu: 12,
                    max_memory_in_gibibytes: 24,
                  },
                },
                stable_override: {
                  limits: {
                    enabled: true,
                    max_cpu_in_vcpu: 16,
                    max_memory_in_gibibytes: 32,
                  },
                  consolidation: {
                    enabled: true,
                    days: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
                    start_time: 'PT20:00',
                    duration: 'PT4H',
                  },
                  drift_blocking: {
                    enabled: true,
                    days: Object.values(WeekdayEnum),
                    start_time: 'PT21:00',
                    duration: 'PT2H',
                  },
                  spot_enabled: true,
                },
              },
            },
          },
        })
      )

      // Check stable nodepool values
      expect(screen.getByText('vCPU limit: 16 vCPU;')).toBeInTheDocument()
      expect(screen.getByText('Memory limit: 32 GiB')).toBeInTheDocument()
      expect(screen.getByText('Mon, Wed, Fri,')).toBeInTheDocument()
      expect(screen.getByText('8:00 pm to 12:00 am')).toBeInTheDocument()
      expect(screen.getByText('Every day, 9:00 pm to 11:00 pm (UTC)')).toBeInTheDocument()

      // Check default nodepool values
      expect(screen.getByText('vCPU limit: 12 vCPU;')).toBeInTheDocument()
      expect(screen.getByText('Memory limit: 24 GiB')).toBeInTheDocument()

      // Check spot instances summary (cards are rendered stable first, default second)
      const [stableSpotSection, defaultSpotSection] = screen
        .getAllByText('Spot instances')
        .map((label) => label.parentElement as HTMLElement)
      expect(within(stableSpotSection).getByText('Enabled')).toBeInTheDocument()
      expect(within(defaultSpotSection).getByText('Disabled')).toBeInTheDocument()
    })

    it('should display cronjob nodepool values', () => {
      renderWithProviders(
        wrapWithReactHookForm(<NodepoolsResourcesSettings cluster={mockCluster} filter="cronjob" />, {
          defaultValues: {
            karpenter: {
              qovery_node_pools: {
                cronjob_override: {
                  limits: {
                    enabled: true,
                    max_cpu_in_vcpu: 10,
                    max_memory_in_gibibytes: 20,
                  },
                  consolidation: {
                    enabled: true,
                    days: ['TUESDAY', 'THURSDAY'],
                    start_time: 'PT13:00',
                    duration: 'PT2H',
                  },
                  consolidate_after: '10m',
                },
              },
            },
          },
        })
      )

      expect(screen.getByText('Cronjob nodepool')).toBeInTheDocument()
      expect(screen.getByText('1:00 pm to 3:00 pm')).toBeInTheDocument()
      expect(screen.getByText('Consolidate after: 10m')).toBeInTheDocument()
      expect(screen.getByText('vCPU limit: 10 vCPU;')).toBeInTheDocument()
      expect(screen.getByText('Memory limit: 20 GiB')).toBeInTheDocument()
    })
  })
})
