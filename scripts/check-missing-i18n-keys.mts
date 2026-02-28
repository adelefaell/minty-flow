import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const languages = ['en', 'ar'] as const
type Language = (typeof languages)[number]

const basePath = path.join(__dirname, '..', 'src', 'i18n', 'translation')

interface TranslationData {
  [key: string]: any
}

interface CheckResult {
  lang: Language
  missing: string[]
  extra: string[]
  total: number
}

function loadJson(lang: Language): TranslationData | null {
  const filePath = path.join(basePath, `${lang}.json`)

  try {
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`)
      return null
    }

    const content = fs.readFileSync(filePath, 'utf-8')

    if (!content.trim()) {
      console.error(`❌ Empty file: ${filePath}`)
      return null
    }

    return JSON.parse(content)
  } catch (error) {
    console.error(`❌ Error loading ${lang}.json:`, (error as Error).message)
    return null
  }
}

function getAllKeys(obj: any, prefix = ''): string[] {
  if (!obj || typeof obj !== 'object') {
    return []
  }

  let keys: string[] = []

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      const fullKey = prefix ? `${prefix}.${key}` : key

      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        keys = keys.concat(getAllKeys(value, fullKey))
      } else {
        keys.push(fullKey)
      }
    }
  }

  return keys
}

function getKeyValue(obj: any, keyPath: string): any {
  const keys = keyPath.split('.')
  let current = obj

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      return undefined
    }
  }

  return current
}

function printMissingKeys(
  lang: Language,
  missingKeys: string[],
  allData: Record<Language, TranslationData>,
): void {
  if (missingKeys.length === 0) {
    console.log(`✅ No missing keys in ${lang}.json`)
    return
  }

  console.log(`\n❌ Missing keys in ${lang}.json (${missingKeys.length}):`)
  missingKeys.forEach((key) => {
    const value = getKeyValue(allData.en, key)
    console.log(`  ${key}`)
    if (value && typeof value === 'string' && value.length < 100) {
      console.log(`    📝 EN value: "${value}"`)
    }
  })
}

function printExtraKeys(lang: Language, extraKeys: string[]): void {
  if (extraKeys.length === 0) {
    return
  }

  console.log(`\n⚠️  Extra keys in ${lang}.json (${extraKeys.length}):`)
  extraKeys.forEach((key) => console.log(`  ${key}`))
}

function printSummary(results: CheckResult[]): void {
  console.log('\n' + '='.repeat(60))
  console.log('📊 SUMMARY')
  console.log('='.repeat(60))

  let totalMissing = 0
  let totalExtra = 0

  results.forEach((result) => {
    if (result.lang !== 'en') {
      totalMissing += result.missing.length
      totalExtra += result.extra.length

      const status = result.missing.length === 0 ? '✅' : '❌'
      console.log(
        `${status} ${result.lang}.json: ${result.missing.length} missing, ${result.extra.length} extra`,
      )
    }
  })

  console.log('\n📈 Overall:')
  console.log(`  Total missing keys: ${totalMissing}`)
  console.log(`  Total extra keys: ${totalExtra}`)

  if (totalMissing === 0 && totalExtra === 0) {
    console.log('  🎉 All translation files are in sync!')
  }
}

function checkAllFiles(): void {
  console.log('🔍 Checking i18n files...')
  console.log(`📁 Base path: ${basePath}`)

  // Check if base path exists
  if (!fs.existsSync(basePath)) {
    console.error(`❌ Base path does not exist: ${basePath}`)
    process.exit(1)
  }

  // Load all language files
  const allData: Record<Language, TranslationData> = {} as Record<
    Language,
    TranslationData
  >
  const loadedLanguages: Language[] = []

  for (const lang of languages) {
    const data = loadJson(lang)
    if (data !== null) {
      allData[lang] = data
      loadedLanguages.push(lang)
    }
  }

  if (loadedLanguages.length === 0) {
    console.error('❌ No valid language files found!')
    process.exit(1)
  }

  // Use the first successfully loaded language as base if 'en' is not available
  const baseLang: Language = allData.en ? 'en' : loadedLanguages[0]

  if (baseLang !== 'en') {
    console.log(
      `⚠️  Using ${baseLang} as base language (en.json not available)`,
    )
  }

  const baseKeys = getAllKeys(allData[baseLang])

  if (baseKeys.length === 0) {
    console.error(`❌ No keys found in base language file: ${baseLang}.json`)
    process.exit(1)
  }

  console.log(`📝 Base language: ${baseLang} (${baseKeys.length} keys)`)

  const results: CheckResult[] = []

  // Check each language file
  loadedLanguages.forEach((lang) => {
    const keys = getAllKeys(allData[lang])
    const missing = baseKeys.filter((k) => !keys.includes(k))
    const extra = keys.filter((k) => !baseKeys.includes(k))

    results.push({
      lang,
      missing,
      extra,
      total: keys.length,
    })

    if (lang === baseLang) {
      console.log(`\n📋 ${lang}.json: ${keys.length} keys (base file)`)
    } else {
      console.log(`\n📋 ${lang}.json: ${keys.length} keys`)
      printMissingKeys(lang, missing, allData)
      printExtraKeys(lang, extra)
    }
  })

  // Check for languages that failed to load
  const failedLanguages = languages.filter(
    (lang) => !loadedLanguages.includes(lang),
  )
  if (failedLanguages.length > 0) {
    console.log('\n❌ Failed to load:')
    failedLanguages.forEach((lang) => console.log(`  ${lang}.json`))
  }

  printSummary(results)
}

// Run the check
checkAllFiles()
