import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const outDir = resolve(root, 'public/assets/illustrations')

mkdirSync(outDir, { recursive: true })

const theme = {
  green: '#58BE84',
  deep: '#2F6B4F',
  mint: '#DDF5E8',
  pale: '#F2FBF6',
  blue: '#D8F0FA',
  coral: '#F7B7B2',
  yellow: '#F7DFA4',
  text: '#1D2B26',
}

function defs() {
  return `
    <defs>
      <filter id="softShadow" x="-35%" y="-35%" width="170%" height="170%">
        <feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#2F6B4F" flood-opacity="0.14"/>
      </filter>
      <filter id="innerGlow" x="-25%" y="-25%" width="150%" height="150%">
        <feGaussianBlur stdDeviation="5" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
      <linearGradient id="greenGrad" x1="22" y1="20" x2="226" y2="230" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#EFFBF5"/>
        <stop offset="0.52" stop-color="#83D6A5"/>
        <stop offset="1" stop-color="#31A66D"/>
      </linearGradient>
      <linearGradient id="blueGrad" x1="34" y1="26" x2="220" y2="230" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#F8FEFF"/>
        <stop offset="0.56" stop-color="#BFE6F5"/>
        <stop offset="1" stop-color="#78C7E7"/>
      </linearGradient>
      <linearGradient id="warmGrad" x1="28" y1="18" x2="224" y2="232" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#FFFDF8"/>
        <stop offset="0.56" stop-color="#F7DFA4"/>
        <stop offset="1" stop-color="#F2B56B"/>
      </linearGradient>
      <radialGradient id="shine" cx="34%" cy="24%" r="72%">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.95"/>
        <stop offset="0.48" stop-color="#FFFFFF" stop-opacity="0.28"/>
        <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
      </radialGradient>
    </defs>
  `
}

function shell(content) {
  return `
    <svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${defs()}
      <ellipse cx="128" cy="218" rx="72" ry="16" fill="#2F6B4F" opacity="0.09"/>
      ${content}
    </svg>
  `
}

function bgCard(color = 'url(#greenGrad)') {
  return `<rect x="46" y="42" width="164" height="164" rx="48" fill="${color}" filter="url(#softShadow)"/><rect x="58" y="54" width="140" height="140" rx="42" fill="url(#shine)" opacity="0.72"/>`
}

const icons = {
  'gentle-leaf': shell(`
    ${bgCard('url(#greenGrad)')}
    <path d="M83 151C87 92 133 60 182 67C184 120 153 168 94 170C92 163 88 157 83 151Z" fill="#FFFFFF" opacity="0.42"/>
    <path d="M81 150C87 98 130 70 176 73C176 121 146 161 96 164C94 158 89 153 81 150Z" fill="#4CB978"/>
    <path d="M95 157C118 127 142 103 169 82" stroke="#EAFBF1" stroke-width="8" stroke-linecap="round"/>
    <path d="M117 136C109 130 100 127 89 126M137 117C134 105 130 96 123 87M151 105C143 100 134 98 124 99" stroke="#BFF0D2" stroke-width="5" stroke-linecap="round"/>
  `),
  'fasting-bowl': shell(`
    ${bgCard('url(#greenGrad)')}
    <ellipse cx="128" cy="116" rx="54" ry="28" fill="#F7FFFB"/>
    <path d="M75 118C78 156 99 178 128 178C157 178 178 156 181 118H75Z" fill="#CFF3DD"/>
    <path d="M78 118C86 132 103 140 128 140C153 140 170 132 178 118" stroke="#5BBE86" stroke-width="7" stroke-linecap="round"/>
    <circle cx="108" cy="99" r="9" fill="#83D6A5"/>
    <circle cx="130" cy="90" r="11" fill="#BCEBCF"/>
    <circle cx="151" cy="101" r="8" fill="#65C88E"/>
    <path d="M108 74C101 83 101 91 108 99M132 66C125 76 126 84 133 91M154 75C148 83 149 91 156 98" stroke="#DDF5E8" stroke-width="6" stroke-linecap="round"/>
  `),
  'carb-gauge': shell(`
    ${bgCard('url(#warmGrad)')}
    <path d="M77 150C77 122 100 99 128 99C156 99 179 122 179 150" stroke="#EAFBF1" stroke-width="18" stroke-linecap="round"/>
    <path d="M77 150C77 124 98 101 124 99" stroke="#45B878" stroke-width="18" stroke-linecap="round"/>
    <path d="M128 148L154 118" stroke="#2F6B4F" stroke-width="8" stroke-linecap="round"/>
    <circle cx="128" cy="148" r="13" fill="#FFFFFF"/>
    <circle cx="128" cy="148" r="7" fill="#2F6B4F"/>
    <path d="M89 169H167" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" opacity="0.72"/>
  `),
  'glp1-kit': shell(`
    ${bgCard('url(#greenGrad)')}
    <rect x="80" y="91" width="96" height="82" rx="18" fill="#39AE73"/>
    <rect x="98" y="78" width="60" height="28" rx="12" stroke="#E9FFF1" stroke-width="10"/>
    <path d="M128 111V153M107 132H149" stroke="#FFFFFF" stroke-width="13" stroke-linecap="round"/>
    <path d="M78 169H178" stroke="#EAFBF1" stroke-width="9" stroke-linecap="round" opacity="0.66"/>
  `),
  'water-glass': shell(`
    ${bgCard('url(#blueGrad)')}
    <path d="M88 74H168L158 178C156 188 148 194 138 194H118C108 194 100 188 98 178L88 74Z" fill="#F7FEFF" opacity="0.92"/>
    <path d="M98 126C113 118 126 135 142 128C151 124 157 119 162 123L156 177C155 184 148 188 138 188H118C111 188 103 184 102 177L98 126Z" fill="#9EE0F4"/>
    <path d="M93 84H163" stroke="#B7E9F8" stroke-width="8" stroke-linecap="round"/>
    <circle cx="122" cy="146" r="5" fill="#FFFFFF" opacity="0.8"/>
    <circle cx="142" cy="158" r="4" fill="#FFFFFF" opacity="0.8"/>
    <circle cx="123" cy="112" r="6" fill="#B7E9F8"/>
  `),
  'growth-chart': shell(`
    ${bgCard('url(#greenGrad)')}
    <rect x="83" y="148" width="18" height="34" rx="8" fill="#EAFBF1"/>
    <rect x="116" y="124" width="18" height="58" rx="8" fill="#CFF3DD"/>
    <rect x="149" y="96" width="18" height="86" rx="8" fill="#FFFFFF"/>
    <path d="M83 118C105 112 125 99 144 79L170 91" stroke="#2F9E68" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M147 78H171V102" stroke="#2F9E68" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
  `),
  'calendar-plan': shell(`
    ${bgCard('url(#greenGrad)')}
    <rect x="78" y="78" width="100" height="102" rx="20" fill="#F8FFFB"/>
    <path d="M78 103H178" stroke="#BEECCD" stroke-width="9"/>
    <path d="M101 67V88M155 67V88" stroke="#2F6B4F" stroke-width="9" stroke-linecap="round"/>
    <circle cx="105" cy="126" r="7" fill="#58BE84"/>
    <circle cx="128" cy="126" r="7" fill="#F7DFA4"/>
    <circle cx="151" cy="126" r="7" fill="#58BE84"/>
    <circle cx="105" cy="151" r="7" fill="#BFE6F5"/>
    <path d="M122 153L134 164L158 138" stroke="#2F6B4F" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  `),
  'meal-plate': shell(`
    ${bgCard('url(#greenGrad)')}
    <ellipse cx="128" cy="142" rx="62" ry="42" fill="#F9FFFC"/>
    <ellipse cx="128" cy="142" rx="43" ry="27" fill="#DDF5E8"/>
    <circle cx="128" cy="135" r="18" fill="#FFFFFF"/>
    <circle cx="128" cy="135" r="10" fill="#F0B65D"/>
    <path d="M92 140C102 126 114 123 127 133" stroke="#58BE84" stroke-width="11" stroke-linecap="round"/>
    <path d="M146 148C156 136 168 135 178 144" stroke="#8BD7A7" stroke-width="10" stroke-linecap="round"/>
  `),
  'nutrition-bars': shell(`
    ${bgCard('url(#greenGrad)')}
    <rect x="85" y="145" width="18" height="36" rx="8" fill="#BFECD0"/>
    <rect x="116" y="119" width="18" height="62" rx="8" fill="#FFFFFF"/>
    <rect x="147" y="92" width="18" height="89" rx="8" fill="#3BAE74"/>
    <path d="M82 188H176" stroke="#EAFBF1" stroke-width="9" stroke-linecap="round"/>
    <path d="M96 92C111 74 132 72 148 89" stroke="#F7FFFB" stroke-width="7" stroke-linecap="round" opacity="0.76"/>
    <circle cx="91" cy="88" r="6" fill="#EAFBF1"/>
    <circle cx="156" cy="86" r="5" fill="#EAFBF1"/>
  `),
  'window-clock': shell(`
    ${bgCard('url(#greenGrad)')}
    <circle cx="128" cy="132" r="50" fill="#F8FFFB"/>
    <circle cx="128" cy="132" r="38" fill="#EAFBF1"/>
    <path d="M128 107V134L151 148" stroke="#2F6B4F" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M91 96C107 81 129 76 151 84" stroke="#58BE84" stroke-width="10" stroke-linecap="round"/>
    <path d="M172 111C181 129 177 153 162 169" stroke="#8BD7A7" stroke-width="10" stroke-linecap="round"/>
  `),
  'record-book': shell(`
    ${bgCard('url(#greenGrad)')}
    <rect x="82" y="72" width="86" height="112" rx="18" fill="#F8FFFB"/>
    <path d="M102 102H150M102 128H150M102 154H133" stroke="#58BE84" stroke-width="9" stroke-linecap="round"/>
    <path d="M78 93H93M78 121H93M78 149H93" stroke="#2F6B4F" stroke-width="8" stroke-linecap="round"/>
    <path d="M151 159L179 131" stroke="#2F6B4F" stroke-width="12" stroke-linecap="round"/>
    <path d="M146 175L157 163L167 173L151 180Z" fill="#2F6B4F"/>
  `),
  'plan-flag': shell(`
    ${bgCard('url(#greenGrad)')}
    <path d="M94 184V78" stroke="#2F6B4F" stroke-width="12" stroke-linecap="round"/>
    <path d="M100 84C123 70 145 92 168 79V139C145 152 123 131 100 145V84Z" fill="#F8FFFB"/>
    <path d="M100 84C123 70 145 92 168 79V111C145 124 123 103 100 117V84Z" fill="#58BE84"/>
    <circle cx="174" cy="174" r="10" fill="#EAFBF1"/>
    <circle cx="72" cy="68" r="7" fill="#EAFBF1"/>
  `),
}

for (const [name, svg] of Object.entries(icons)) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 512 },
    background: 'rgba(0, 0, 0, 0)',
  })
  const png = resvg.render().asPng()
  writeFileSync(resolve(outDir, `${name}.png`), png)
}

console.log(`Generated ${Object.keys(icons).length} transparent illustrations in ${outDir}`)
