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

export const getMap = ({
  apiKey,
  zoom,
  options,
  styles,
  currentLocation,
  filteredMarkers,
}) => {
  const mapType =
    options.mapTypeId === 'roadmap' ? 'standard' : options.mapTypeId
  const defaultCenter = {
    lat: 40.7831,
    lng: -73.9712,
  }
  const LATITUDE_DELTA = Math.exp(Math.log(360) - (zoom + 1) * Math.LN2)
  const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height)
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
        if (filteredMarkers.length > 1) {
          mapRef.fitToElements(true)
        }
      }}
    >
      {filteredMarkers.map((marker) => (
        <Marker
          coordinate={{
            latitude: marker && marker.lat,
            longitude: marker && marker.lng,
          }}
          style={{ alignItems: 'center', justifyContent: 'center' }}
          key={`marker ${index}`}
          onPress={marker.onPress}
        >
          <Image
            resizeMode="contain"
            source={marker && marker.image}
            style={styles.markerImage}
          />
        </Marker>
      ))}
    </MapView>
  )
}
