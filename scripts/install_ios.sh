#!/bin/bash
set -e
set -x

project_path=$(pwd)
name=$PROJECT_NAME

alias react-native="$(pwd)/node_modules/.bin/react-native"

# Dependencies manually added for now

#yarn add react-native-maps -E #@^0.26.1
yarn add react-native-maps@0.26.1
react-native link react-native-maps

# Podfile
cd ios

pod init

echo "# Uncomment the next line to define a global platform for your project
platform :ios, '9.0'

target '${name}' do
  rn_path = '../node_modules/react-native'
  rn_maps_path = '../node_modules/react-native-maps'

  # See http://facebook.github.io/react-native/docs/integration-with-existing-apps.html#configuring-cocoapods-dependencies
  pod 'yoga', path: \"#{rn_path}/ReactCommon/yoga/yoga.podspec\"
  pod 'React', path: rn_path, subspecs: [
    'Core',
    'CxxBridge',
    'DevSupport',
    'RCTActionSheet',
    'RCTAnimation',
    'RCTGeolocation',
    'RCTImage',
    'RCTLinkingIOS',
    'RCTNetwork',
    'RCTSettings',
    'RCTText',
    'RCTVibration',
    'RCTWebSocket',
  ]

  # React Native third party dependencies podspecs
  pod 'DoubleConversion', :podspec => \"#{rn_path}/third-party-podspecs/DoubleConversion.podspec\"
  pod 'glog', :podspec => \"#{rn_path}/third-party-podspecs/glog.podspec\"
  # If you are using React Native <0.54, you will get the following error:
  # Use the following line instead:
  #pod 'GLog', :podspec => \"#{rn_path}/third-party-podspecs/GLog.podspec\"
  pod 'Folly', :podspec => \"#{rn_path}/third-party-podspecs/Folly.podspec\"

  # react-native-maps dependencies
  pod 'react-native-maps', path: rn_maps_path
  pod 'react-native-google-maps', path: rn_maps_path  # Uncomment this line if you want to support GoogleMaps on iOS
  pod 'GoogleMaps'  # Uncomment this line if you want to support GoogleMaps on iOS
  pod 'Google-Maps-iOS-Utils' # Uncomment this line if you want to support GoogleMaps on iOS
end

post_install do |installer|
  installer.pods_project.targets.each do |target|
    if target.name == 'react-native-google-maps'
      target.build_configurations.each do |config|
        config.build_settings['CLANG_ENABLE_MODULES'] = 'No'
      end
    end
    if target.name == 'Google-Maps-iOS-Utils'
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '8.0'
      end
    end
    if target.name == \"React\"
      target.remove_from_project
    end
  end
end" >Podfile

pod install

# Enabling Google Maps on iOS

sed -i.bak '/UserNotifications.h/a\
#import <GoogleMaps/GoogleMaps.h>\
#import <React/RCTLog.h>\
\
@implementation KeyModule\
\
RCT_EXPORT_MODULE();\
\
RCT_EXPORT_METHOD(addEvent:(NSString *)apiKey)\
{\
  [[NSNotificationCenter defaultCenter]postNotificationName:@"APIKeyNotification"\
                                                     object:apiKey];\
}\
\
@end\
' ./${name}/AppDelegate.m

sed -i.bak '/didFinishLaunchingWithOptions/i\
- (void) receiveNotification:(NSNotification *) notification\
  {\
    if ([[notification name] isEqualToString:@"APIKeyNotification"]) {\
      NSString *apiKey = notification.object;\
      NSLog(@"Here is Google map API Key - %@", apiKey);\
      [GMSServices provideAPIKey:apiKey];\
    }\
  }\
' ./${name}/AppDelegate.m

sed -i.bak '/initWithDelegate/i\
  [[NSNotificationCenter defaultCenter] addObserver:self\
                                           selector:@selector(receiveNotification:)\
                                               name:@"APIKeyNotification"\
                                             object:nil];\
' ./${name}/AppDelegate.m

sed -i.bak '/@end/a\
#import <React/RCTBridgeModule.h>\
\
@interface KeyModule : NSObject <RCTBridgeModule>\
@end\
' ./${name}/AppDelegate.h

# Re-link react-native-maps

cd ..
react-native unlink react-native-maps
react-native link react-native-maps

echo "react-native-maps configuration completed for iOS."
