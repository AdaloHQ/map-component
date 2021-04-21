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

  const viewCenter =
    addresses.length > 0
      ? { lat: addresses[0].location.lat, lng: addresses[0].location.lng }
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
      {isSimple ? (
        <Marker
          coordinate={{
            latitude: addresses.length > 0 ? addresses[0].location.lat : 0,
            longitude: addresses.length > 0 ? addresses[0].location.lng : 0,
          }}
          style={{ alignItems: 'center', justifyContent: 'center' }}
          onPress={onPress}
        >
          <Image
            resizeMode="contain"
            source={
              markerImage && markerSource === 'custom'
                ? markerImage
                : defaultMarker
            }
            style={styles.markerImage}
          />
        </Marker>
      ) : (
        markerCollection &&
        markerCollection.map((marker, index) => (
          <Marker
            coordinate={{
              latitude:
                addresses.length > 0 ? addresses[index].location.lat : 0,
              longitude:
                addresses.length > 0 ? addresses[index].location.lng : 0,
            }}
            style={{ alignItems: 'center', justifyContent: 'center' }}
            key={`marker ${index}`}
            onPress={marker.markers_list.onPress}
          >
            <Image
              resizeMode="contain"
              source={
                marker.markers_list.listMarkerImage &&
                marker.markers_list.markerSource === 'custom'
                  ? marker.markers_list.listMarkerImage
                  : defaultMarker
              }
              style={styles.markerImage}
            />
          </Marker>
        ))
      )}
    </MapView>
  )
}
