import { joinArgsWithQuotes, parseCmd } from './parse-cmd'

describe('parseCmd function', () => {
  it('should parse a simple command string', () => {
    const cmd = 'docker run -d nginx'
    const result = parseCmd(cmd)
    expect(result).toEqual(['docker', 'run', '-d', 'nginx'])
  })

  it('should handle quoted arguments', () => {
    const cmd = 'docker run -v  "arg arg" "/data:/mnt/data" nginx'
    const result = parseCmd(cmd)
    expect(result).toEqual(['docker', 'run', '-v', 'arg arg', '/data:/mnt/data', 'nginx'])
  })

  it('should handle operations', () => {
    const cmd = 'docker ps -a'
    const result = parseCmd(cmd)
    expect(result).toEqual(['docker', 'ps', '-a'])
  })

  it('should handle comments', () => {
    const cmd = 'docker run nginx # start nginx container'
    const result = parseCmd(cmd)
    expect(result).toEqual(['docker', 'run', 'nginx', '# start nginx container'])
  })

  it('should handle env variables', () => {
    const cmd = 'docker $ENV_VAR run nginx'
    const result = parseCmd(cmd)
    expect(result).toEqual(['docker', '$ENV_VAR', 'run', 'nginx'])
  })

  it('should handle complex arguments and operations together', () => {
    const cmd = 'docker run -v "/data:/mnt/data" -p 8080:80 nginx "arg arg" # start nginx container'
    const result = parseCmd(cmd)
    expect(result).toEqual([
      'docker',
      'run',
      '-v',
      '/data:/mnt/data',
      '-p',
      '8080:80',
      'nginx',
      'arg arg',
      '# start nginx container',
    ])
  })
})

describe('joinArgsWithQuotes', () => {
  it('should handle single word arguments correctly', () => {
    const input = ['arg1', 'arg2']
    const expected = 'arg1 arg2'
    expect(joinArgsWithQuotes(input)).toBe(expected)
  })

  it('should handle arguments with multiple words correctly', () => {
    const input = ['arg1', 'arg3 arg4']
    const expected = 'arg1 "arg3 arg4"'
    expect(joinArgsWithQuotes(input)).toBe(expected)
  })

  it('should handle arguments starting with # correctly', () => {
    const input = ['arg1', '# hello world 123']
    const expected = 'arg1 # hello world 123'
    expect(joinArgsWithQuotes(input)).toBe(expected)
  })

  it('should handle mixed arguments correctly', () => {
    const input = ['arg2', 'arg3 arg4', '# test test test']
    const expected = 'arg2 "arg3 arg4" # test test test'
    expect(joinArgsWithQuotes(input)).toBe(expected)
  })

  it('should handle multiple words starting with # correctly', () => {
    const input = ['# singleword', 'multiple words here']
    const expected = '# singleword "multiple words here"'
    expect(joinArgsWithQuotes(input)).toBe(expected)
  })
})
