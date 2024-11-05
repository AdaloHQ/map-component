import { join } from 'https://deno.land/std@0.224.0/path/mod.ts'
import { backupFile, getMapsApiKey, insertLineAfterString } from './commons.ts'

const projectPath = Deno.env.get('ADALO_APP_PROJECT_PATH') as string
const projectName = Deno.env.get('ADALO_APP_PROJECT_NAME') as string

const apiKey = await getMapsApiKey(projectPath)

const podfilePath = join(projectPath, `ios/Podfile`)

await backupFile(podfilePath)

let podfileContent = await Deno.readTextFile(podfilePath)

// Add `rn_maps_path = '../node_modules/react-native-maps'` above `config = use_native_modules!`

podfileContent = insertLineAfterString(
  podfileContent,
  'config = use_native_modules!',
  `rn_maps_path = '../node_modules/react-native-maps'`,
  { insertBefore: true }
)

// Add `pod 'react-native-google-maps', :path => rn_maps_path` above `config = use_native_modules!`
podfileContent = insertLineAfterString(
  podfileContent,
  'config = use_native_modules!',
  `pod 'react-native-google-maps', :path => rn_maps_path`,
  { insertBefore: true }
)

// Add these additional pod configurations after the existing maps configuration
podfileContent = insertLineAfterString(
  podfileContent,
  "pod 'react-native-google-maps', :path => rn_maps_path",
  `
  pod 'Google-Maps-iOS-Utils'
  pod 'GoogleMaps'`
)

// Ensure subspecs are added
podfileContent = insertLineAfterString(
  podfileContent,
  "target '${projectName}' do",
  `
  # React Native Maps dependencies
  rn_maps_path = '../node_modules/react-native-maps'
  pod 'react-native-google-maps', :path => rn_maps_path
  pod 'GoogleMaps'
  pod 'Google-Maps-iOS-Utils'`,
  { insertBefore: false }
)

await Deno.writeTextFile(podfilePath, podfileContent)
console.log(`Updated Podfile with react-native-google-maps and rn_maps_path`)

const appDelegatePath = join(projectPath, `ios/${projectName}/AppDelegate.mm`)

await backupFile(appDelegatePath)

let appDelegateContent = await Deno.readTextFile(appDelegatePath)

// Add `#import <GoogleMaps/GoogleMaps.h>` BEFORE `// MARKER_REACT_NATIVE_IOS_APP_DELEGATE_IMPORTS`

appDelegateContent = insertLineAfterString(
  appDelegateContent,
  'MARKER_REACT_NATIVE_IOS_APP_DELEGATE_IMPORTS',
  `#import <GoogleMaps/GoogleMaps.h>`,
  { insertBefore: true }
)

// Add `[GMSServices provideAPIKey:@"GEO_API_KEY"];` AFTER `self.initialProps = @{};`

appDelegateContent = insertLineAfterString(
  appDelegateContent,
  'initialProps = @{}',
  `  [GMSServices provideAPIKey:@"GEO_API_KEY"];`
)

// Replace `GEO_API_KEY` with the value of `key`
appDelegateContent = appDelegateContent.replaceAll('GEO_API_KEY', apiKey)

await Deno.writeTextFile(appDelegatePath, appDelegateContent)
console.log(`Updated AppDelegate.mm with GoogleMaps import and API key`)
