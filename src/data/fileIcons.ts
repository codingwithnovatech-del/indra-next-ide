const FILE_ICONS: Record<string, string> = {
  ts: '#3178c6',
  tsx: '#519aba',
  js: '#f7df1e',
  jsx: '#61dafb',
  html: '#e34f26',
  htm: '#e34f26',
  css: '#2965f1',
  scss: '#cc6699',
  json: '#5c5c5c',
  md: '#4fc3f7',
  py: '#3776ab',
  rs: '#dea584',
  go: '#00add8',
  vue: '#4fc08d',
  svelte: '#ff3e00',
  java: '#b07219',
  cpp: '#f34b7d',
  c: '#555555',
  h: '#8d8d8d',
  yml: '#ffa500',
  yaml: '#ffa500',
  toml: '#ffa500',
  xml: '#e34f26',
  svg: '#ffb13b',
  png: '#a074c4',
  jpg: '#a074c4',
  jpeg: '#a074c4',
  gif: '#a074c4',
  ico: '#a074c4',
  woff: '#7748ff',
  woff2: '#7748ff',
  ttf: '#7748ff',
  sh: '#89e051',
  bash: '#89e051',
  zsh: '#89e051',
  lock: '#cc3534',
  gitignore: '#e03c2e',
  env: '#ffd700',
}

const FOLDER_ICON = '#dcb67a'
const DEFAULT_FILE = '#5c5c5c'

export function getFileIconColor(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase()
  if (!ext) return DEFAULT_FILE
  if (ext === 'env') return FILE_ICONS.env ?? DEFAULT_FILE
  return FILE_ICONS[ext] ?? DEFAULT_FILE
}

export function getFolderIconColor(): string {
  return FOLDER_ICON
}

export function getFileExtension(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? ''
}
