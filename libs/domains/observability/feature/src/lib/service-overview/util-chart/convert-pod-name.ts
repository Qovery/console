export function convertPodName(pod: string) {
  if (pod.startsWith('qovery-') || pod.startsWith('app-')) {
    return pod.replace(/^[^-]+-[^-]+-/, '')
  }
  return pod
}

export default convertPodName
