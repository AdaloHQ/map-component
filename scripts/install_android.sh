#!/bin/bash
set -e
set -x

yarn add react-native-maps@0.26.1

dir=$(dirname "${0}")
key=$("${dir}/get_maps_api_key.js")

cd android

# ./build.gradle

sed -i.bak '/targetSdkVersion/a\
    supportLibVersion = "29.0.0"\
    playServicesVersion = "17.0.0"\
    androidMapsUtilsVersion = "0.6.2"\
' ./build.gradle

# AndroidManifest.xml

# insert meta-data tag before the closing </application> tag
sed -i.bak '/<\/application>/i\
    <meta-data android:name="com.google.android.geo.API_KEY" android:value="${key}" />\
' app/src/main/AndroidManifest.xml
