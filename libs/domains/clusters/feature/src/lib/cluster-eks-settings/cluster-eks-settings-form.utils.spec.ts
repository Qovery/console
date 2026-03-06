import {
  getEksAnywhereGitFormValues,
  getInfrastructureChartsParametersWithEksAnywhereGit,
} from './cluster-eks-settings-form.utils'

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

  it('should not reuse previous git token id when git account is selected', () => {
    const infrastructureChartsParameters = getInfrastructureChartsParametersWithEksAnywhereGit({
      cluster_type: 'PARTIALLY_MANAGED',
      instance_type: 't3.xlarge',
      nodes: [3, 5],
      disk_size: 20,
      provider: 'GITLAB',
      branch: 'main',
      root_path: '/main.go',
      git_token_id: null,
      git_repository: {
        id: '',
        name: 'perso6332726/guustsqs',
        url: 'https://gitlab.com/perso6332726/guustsqs.git',
        default_branch: 'main',
      },
      infrastructure_charts_parameters: {
        eks_anywhere_parameters: {
          git_repository: {
            url: 'https://github.com/Qovery/old-repo.git',
            branch: 'main',
            git_token_id: 'old-token-id',
            provider: 'GITHUB',
          },
          yaml_file_path: '/old.yaml',
        },
      },
    })

    expect(infrastructureChartsParameters?.eks_anywhere_parameters?.git_repository?.git_token_id).toBe('')
    expect(infrastructureChartsParameters?.eks_anywhere_parameters?.git_repository?.provider).toBe('GITLAB')
  })

  it('should keep previous git token id when git token is undefined', () => {
    const infrastructureChartsParameters = getInfrastructureChartsParametersWithEksAnywhereGit({
      cluster_type: 'PARTIALLY_MANAGED',
      instance_type: 't3.xlarge',
      nodes: [3, 5],
      disk_size: 20,
      provider: 'GITHUB',
      branch: 'main',
      root_path: '/main.go',
      git_repository: {
        id: '',
        name: 'Qovery/old-repo',
        url: 'https://github.com/Qovery/old-repo.git',
        default_branch: 'main',
      },
      infrastructure_charts_parameters: {
        eks_anywhere_parameters: {
          git_repository: {
            url: 'https://github.com/Qovery/old-repo.git',
            branch: 'main',
            git_token_id: 'old-token-id',
            provider: 'GITHUB',
          },
          yaml_file_path: '/old.yaml',
        },
      },
    })

    expect(infrastructureChartsParameters?.eks_anywhere_parameters?.git_repository?.git_token_id).toBe('old-token-id')
  })
})
