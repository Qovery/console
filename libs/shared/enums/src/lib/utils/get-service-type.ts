import {
  type BaseJobResponseAllOfSource,
  type BaseJobResponseAllOfSourceOneOf,
  type ContainerSourceResponse,
  type ContainerSourceResponseOneOf,
  type ContainerSourceResponseOneOf1,
  type HelmResponseAllOfSource,
  type HelmResponseAllOfSourceOneOf,
  type HelmResponseAllOfSourceOneOf1,
  type HelmResponseAllOfValuesOverride,
  type HelmResponseAllOfValuesOverrideFileGit,
} from 'qovery-typescript-axios'

export function isHelmGitSource(source?: HelmResponseAllOfSource): source is HelmResponseAllOfSourceOneOf {
  return !!source && 'git' in source
}

export function isHelmRepositorySource(source?: HelmResponseAllOfSource): source is HelmResponseAllOfSourceOneOf1 {
  return !!source && 'repository' in source
}

export function isHelmGitValuesOverride(
  valuesOverride?: HelmResponseAllOfValuesOverride
): valuesOverride is HelmResponseAllOfValuesOverride & { file: { git: HelmResponseAllOfValuesOverrideFileGit } } {
  return !!valuesOverride?.file?.git?.git_repository
}

export function isJobGitSource(source?: BaseJobResponseAllOfSource): source is BaseJobResponseAllOfSourceOneOf {
  return !!source && 'docker' in source
}

export function isJobContainerSource(source?: BaseJobResponseAllOfSource): source is ContainerSourceResponseOneOf {
  return !!source && 'image' in source
}

export function isContainerGitSource(source?: ContainerSourceResponse): source is ContainerSourceResponseOneOf1 {
  return !!source && 'git_repository' in source
}
