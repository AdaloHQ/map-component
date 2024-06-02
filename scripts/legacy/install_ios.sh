#!/bin/bash
set -e
set -x

dir=$(dirname "${0}")
key=$("${dir}/get_maps_api_key.js")

name=$PROJECT_NAME

cd ios

# Add `rn_maps_path = '../node_modules/react-native-maps'` above `config = use_native_modules!`
sed -i.bak '/config = use_native_modules!/i\
rn_maps_path = '"'"'../node_modules/react-native-maps'"'"'\
' Podfile

# Add `pod 'react-native-google-maps', :path => rn_maps_path` above `config = use_native_modules!`
sed -i.bak '/config = use_native_modules!/i\
pod '"'"'react-native-google-maps'"'"', :path => rn_maps_path\
' Podfile

# Add `#import <GoogleMaps/GoogleMaps.h>` BEFORE `// MARKER_REACT_NATIVE_IOS_APP_DELEGATE_IMPORTS`
sed -i.bak '/\/\/ MARKER_REACT_NATIVE_IOS_APP_DELEGATE_IMPORTS/i\
#import <GoogleMaps/GoogleMaps.h>\
' ./${name}/AppDelegate.mm

# Add `[GMSServices provideAPIKey:@"GEO_API_KEY"];` AFTER `self.initialProps = @{};`
sed -i.bak '/self.initialProps = @{};/a\
  [GMSServices provideAPIKey:@"GEO_API_KEY"];\
' ./${name}/AppDelegate.mm

# Replace `GEO_API_KEY` with the value of `key`
sed -i.bak "s/GEO_API_KEY/${key}/g" ./${name}/AppDelegate.mm

echo "react-native-maps configuration completed for iOS."
