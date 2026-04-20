export function setLocalStorageStepIntroduction(value: boolean) {
  if (!value) {
    localStorage.removeItem('step-lifecycle-introduction')
  } else {
    localStorage.setItem('step-lifecycle-introduction', 'true')
  }
}

export function getLocalStorageStepIntroduction() {
  return localStorage.getItem('step-lifecycle-introduction')
}
