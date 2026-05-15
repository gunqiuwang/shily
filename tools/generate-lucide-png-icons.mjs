import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const iconNodes = JSON.parse(readFileSync(resolve(root, 'node_modules/lucide-static/icon-nodes.json'), 'utf8'))

const tones = {
  muted: '#7F918A',
  active: '#65BD8C',
  deep: '#2F6B4F',
  white: '#FFFFFF',
}

const iconMap = {
  home: 'house',
  plus: 'plus',
  sparkle: 'sparkles',
  chart: 'chart-column',
  user: 'user-round',
  droplet: 'droplet',
  egg: 'egg',
  flag: 'flag',
  activity: 'activity',
  clock: 'clock-3',
  cloud: 'cloud',
  send: 'send-horizontal',
  settings: 'settings',
  bell: 'bell',
  target: 'scan-heart',
  bookmark: 'bookmark',
  group: 'users-round',
  notebook: 'notebook-tabs',
  route: 'route',
  shirt: 'shirt',
  moon: 'moon-star',
  sun: 'sun',
  'chevron-right': 'chevron-right',
  calendar: 'calendar-days',
  camera: 'camera',
  close: 'x',
  'arrow-left': 'arrow-left',
  check: 'check',
}

const outputDirs = [
  resolve(root, 'public/assets/icons'),
  resolve(root, 'src/assets/icons'),
]

function attrsToString(attrs) {
  return Object.entries(attrs)
    .map(([key, value]) => `${key}="${String(value).replace(/"/g, '&quot;')}"`)
    .join(' ')
}

function nodeToSvg([tag, attrs]) {
  return `<${tag} ${attrsToString(attrs)} />`
}

function renderIcon(iconName, color) {
  const nodes = iconNodes[iconName]
  if (!nodes) {
    throw new Error(`Missing Lucide icon: ${iconName}`)
  }

  const body = nodes.map(nodeToSvg).join('\n')
  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="128"
      height="128"
      viewBox="0 0 24 24"
      fill="none"
      stroke="${color}"
      stroke-width="2.75"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      ${body}
    </svg>
  `

  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: 128 },
    background: 'rgba(0, 0, 0, 0)',
  }).render().asPng()

  return Buffer.from(png)
}

for (const dir of outputDirs) {
  mkdirSync(dir, { recursive: true })

  for (const [localName, lucideName] of Object.entries(iconMap)) {
    for (const [toneName, color] of Object.entries(tones)) {
      const png = renderIcon(lucideName, color)
      writeFileSync(resolve(dir, `${localName}-${toneName}.png`), png)
    }
  }
}

console.log(`Generated ${Object.keys(iconMap).length * Object.keys(tones).length} Lucide PNG icons.`)
