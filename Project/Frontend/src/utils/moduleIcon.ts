const moduleIcons = [
  // Programmiersprachen und Frameworks
  { keywords: ['python', 'pandas', 'numpy', 'jax'], icon: 'fa-brands fa-python' },
  { keywords: ['javascript', 'typescript', 'ecmascript'], icon: 'fa-brands fa-js' },
  { keywords: ['vue.js', 'vue 3', 'vuejs', 'pinia', 'nuxt'], icon: 'fa-brands fa-vuejs' },
  { keywords: ['react.js', 'reactjs', 'react native', 'next.js'], icon: 'fa-brands fa-react' },
  { keywords: ['node.js', 'nodejs', 'express.js'], icon: 'fa-brands fa-node-js' },
  { keywords: ['c#', 'csharp', '.net', 'asp.net'], icon: 'fa-solid fa-code' },
  { keywords: ['java', 'spring boot'], icon: 'fa-brands fa-java' },

  // Infrastruktur und Datenbanken
  { keywords: ['docker', 'docker compose', 'containerisierung'], icon: 'fa-brands fa-docker' },
  { keywords: ['linux', 'ubuntu', 'debian', 'bash'], icon: 'fa-brands fa-linux' },
  {
    keywords: ['github', 'gitlab', 'versionskontrolle', 'git workshop'],
    icon: 'fa-solid fa-code-branch',
  },
  {
    keywords: [
      'cybersecurity',
      'cybersicherheit',
      'it-sicherheit',
      'verschlüsselung',
      'firewall',
      'datenschutz',
    ],
    icon: 'fa-solid fa-shield-halved',
  },
  {
    keywords: ['datenbank', 'sql', 'postgresql', 'mariadb', 'mongodb', 'datenmodell'],
    icon: 'fa-solid fa-database',
  },
  {
    keywords: ['cloud', 'kubernetes', 'aws', 'azure', 'objektspeicher', 'rustfs'],
    icon: 'fa-solid fa-cloud',
  },
  {
    keywords: ['netzwerk', 'routing', 'subnetting', 'tcp/ip', 'dns', 'verteilte systeme'],
    icon: 'fa-solid fa-network-wired',
  },
  {
    keywords: ['monitoring', 'prometheus', 'grafana', 'alertmanager'],
    icon: 'fa-solid fa-chart-line',
  },
  { keywords: ['devops', 'ci/cd', 'deployment', 'automatisierung'], icon: 'fa-solid fa-gears' },
  { keywords: ['server', 'virtualisierung', 'systemadministration'], icon: 'fa-solid fa-server' },
  {
    keywords: ['hardware', 'mikrocontroller', 'elektronik', 'arduino'],
    icon: 'fa-solid fa-microchip',
  },

  // Softwareentwicklung und Gestaltung
  {
    keywords: ['machine learning', 'künstliche intelligenz', 'neuronale netze', 'deep learning'],
    icon: 'fa-solid fa-brain',
  },
  {
    keywords: ['datenanalyse', 'data science', 'datenvisualisierung'],
    icon: 'fa-solid fa-chart-bar',
  },
  {
    keywords: ['softwaretests', 'unit-test', 'integrationstest', 'playwright', 'vitest'],
    icon: 'fa-solid fa-vial',
  },
  {
    keywords: ['spieleentwicklung', 'game development', 'unity', 'godot'],
    icon: 'fa-solid fa-gamepad',
  },
  {
    keywords: ['mobile app', 'android', 'ios-entwicklung'],
    icon: 'fa-solid fa-mobile-screen-button',
  },
  {
    keywords: ['ui-design', 'ux-design', 'usability', 'figma', 'mockup', 'prototyping'],
    icon: 'fa-solid fa-pen-ruler',
  },
  {
    keywords: ['webentwicklung', 'webdesign', 'frontend', 'html', 'css', 'tailwind'],
    icon: 'fa-solid fa-globe',
  },
  {
    keywords: ['backend', 'web-api', 'rest-api', 'graphql', 'schnittstellen'],
    icon: 'fa-solid fa-plug',
  },
  {
    keywords: [
      'anforderungsanalyse',
      'requirements engineering',
      'projektplanung',
      'projektmanagement',
      'scrum',
      'ict-lösungen initialisieren',
    ],
    icon: 'fa-solid fa-list-check',
  },
  {
    keywords: [
      'programmierung',
      'programmieren',
      'applikationsentwicklung',
      'softwareentwicklung',
      'algorithmen',
    ],
    icon: 'fa-solid fa-code',
  },

  // Allgemeinbildende Fächer
  { keywords: ['mathematik', 'statistik', 'algebra', 'geometrie'], icon: 'fa-solid fa-calculator' },
  { keywords: ['physik', 'chemie', 'naturwissenschaft'], icon: 'fa-solid fa-flask' },
  { keywords: ['englisch', 'französisch', 'deutsch', 'literatur'], icon: 'fa-solid fa-language' },
  {
    keywords: ['wirtschaft', 'finanzen', 'buchhaltung', 'rechnungswesen'],
    icon: 'fa-solid fa-coins',
  },
  { keywords: ['recht', 'staatskunde', 'politik'], icon: 'fa-solid fa-scale-balanced' },
  { keywords: ['präsentation', 'kommunikation', 'rhetorik'], icon: 'fa-solid fa-comments' },
  { keywords: ['sport', 'fitness', 'bewegung'], icon: 'fa-solid fa-person-running' },
]

export function getModuleIcon(title: string): string {
  const normTitle = title.toLowerCase().trim()

  const match = moduleIcons.find(({ keywords }) => {
    keywords.some((keyword) => normTitle.includes(keyword))
  })

  return match?.icon ?? 'fa-solid fa-book'
}
