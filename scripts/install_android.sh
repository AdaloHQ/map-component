#!/bin/bash
set -e
set -x

# if [[ $# -ne 1 ]]; then
#   echo "Usage: ./maps.sh PROJECT_PATH"
#   exit 1
# fi
#
# project_path=$1
#
# cd "${project_path}/android"

###############################################
# Main Maps package
###############################################

yarn add react-native-maps@0.26.1
react-native link react-native-maps

dir=$(dirname "${0}")
key=$("${dir}/get_maps_api_key.js")

# CD to android
cd android

# ./build.gradle

sed -i.bak '/targetSdkVersion/a\
    supportLibVersion = "28.0.0"\
    playServicesVersion = "17.0.0"\
    androidMapsUtilsVersion = "0.6.2"\
' ./build.gradle

# AndroidManifest.xml

cat <<EOF > /tmp/adalo-sed
/com.facebook.react.devsupport/a\\
    <meta-data android:name="com.google.android.geo.API_KEY" android:value="${key}" />\\
EOF

sed -i.bak "$(cat /tmp/adalo-sed)" app/src/main/AndroidManifest.xml

