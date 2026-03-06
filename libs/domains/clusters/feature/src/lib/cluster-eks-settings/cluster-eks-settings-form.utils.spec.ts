import { getEksAnywhereGitFormValues } from './cluster-eks-settings-form.utils'

describe('cluster-eks-settings-form.utils', () => {
  it('should keep owner and repository name from https git url', () => {
    const formValues = getEksAnywhereGitFormValues({
      infrastructure_charts_parameters: {
        eks_anywhere_parameters: {
          git_repository: {
            url: 'https://github.com/Qovery/k8s-event-logger.git',
            branch: 'master',
            git_token_id: 'token-id',
            provider: 'GITHUB',
          },
          yaml_file_path: '/main.go',
        },
      },
    })

    expect(formValues.repository).toBe('Qovery/k8s-event-logger')
    expect(formValues.git_repository?.name).toBe('Qovery/k8s-event-logger')
  })

  it('should keep owner and repository name from ssh git url', () => {
    const formValues = getEksAnywhereGitFormValues({
      infrastructure_charts_parameters: {
        eks_anywhere_parameters: {
          git_repository: {
            url: 'git@github.com:Qovery/k8s-event-logger.git',
            branch: 'master',
            git_token_id: 'token-id',
            provider: 'GITHUB',
          },
          yaml_file_path: '/main.go',
        },
      },
    })

    expect(formValues.repository).toBe('Qovery/k8s-event-logger')
    expect(formValues.git_repository?.name).toBe('Qovery/k8s-event-logger')
  })
})
