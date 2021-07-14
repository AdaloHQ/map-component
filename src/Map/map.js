import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import {
  View,
  Text,
  Image,
  NativeModules,
  Platform,
  Dimensions,
} from 'react-native'
const { height, width } = Dimensions.get('window')
import defaultMarker from './assets/marker.png'

export const addNativeEvent = (apiKey) => {
  if (Platform.OS === 'ios') {
    var KeyModule = NativeModules.KeyModule
    KeyModule.addEvent(apiKey)
  } else {
  }
}

export const getMap = (
  apiKey,
  zoom,
  options,
  styles,
  markerType,
  addresses,
  currentLocation,
  onPress,
  markerCollection,
  markerImage,
  markerSource
) => {
  const mapType =
    options.mapTypeId === 'roadmap' ? 'standard' : options.mapTypeId
  const isSimple = markerType === 'simple'
  const defaultCenter = {
    lat: 40.7831,
    lng: -73.9712,
  }
  const LATITUDE_DELTA = Math.exp(Math.log(360) - (zoom + 1) * Math.LN2)
  const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height)

  let filteredMarkers = []

  if (isSimple) {
    filteredMarkers.push({
      //might need coordinates : longitude:
      lat: addresses.length > 0 ? addresses[0].location.lat : null,
      lng: addresses.length > 0 ? addresses[0].location.lng : null,
      style: { alignItems: 'center', justifyContent: 'center' },
      image:
        markerImage && markerSource === 'custom' ? markerImage : defaultMarker,
      onPress,
    })
  } else {
    filteredMarkers = markerCollection.map((marker, index) => {
      return {
        lat:
          addresses.length > 0 && addresses[index]
            ? addresses[index].location.lat
            : null,
        lng:
          addresses.length > 0 && addresses[index]
            ? addresses[index].location.lng
            : null,
        style: { alignItems: 'center', justifyContent: 'center' },
        image:
          marker.markers_list.listMarkerImage &&
          marker.markers_list.markerSource === 'custom'
            ? marker.markers_list.listMarkerImage
            : defaultMarker,
        onPress: marker.markers_list.onPress,
        key: `marker ${index}`,
      }
    })
  }

  filteredMarkers = filteredMarkers.filter((marker) => marker.lat)

  const viewCenter =
    filteredMarkers.length > 0
      ? { lat: filteredMarkers[0].lat, lng: filteredMarkers[0].lng }
      : defaultCenter
  let mapRef = null

  return (
    <MapView
      style={styles.container}
      provider={PROVIDER_GOOGLE}
      initialRegion={{
        latitude: viewCenter.lat,
        longitude: viewCenter.lng,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }}
      showsUserLocation={currentLocation}
      mapType={mapType}
      customMapStyle={options.styles ? options.styles : []}
      ref={(map) => (mapRef = map)}
      onMapReady={() => {
        if (!isSimple && addresses.length > 1) {
          mapRef.fitToElements(true)
        }
      }}
    >
      {filteredMarkers.map((marker) => (
        <View lat={marker.lat} lng={marker.lng} onClick={marker.onPress}>
          <Image
            resizeMode="contain"
            source={marker.image}
            style={[styles.markerImage, additionalStyles.markerImage]}
          />
        </View>
      ))}
    </MapView>
  )
}
