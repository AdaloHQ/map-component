import { useRef } from 'react'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { Image, Dimensions, Platform } from 'react-native'
import { defaultZoom } from './config'

const { height, width } = Dimensions.get('window')

const MapWrapper = ({
  options,
  styles,
  currentLocation,
  filteredMarkers = [],
  viewCenter,
}) => {
  const mapType =
    options.mapTypeId === 'roadmap' ? 'standard' : options.mapTypeId

  const LATITUDE_DELTA = Math.exp(Math.log(360) - (defaultZoom + 1) * Math.LN2)
  const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height)

  const mapRef = useRef(null)

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
      customMapStyle={options.styles || []}
      ref={mapRef}
      onMapReady={() => {
        if (!mapRef.current) {
          return
        }

        if (filteredMarkers.length > 1) {
          if (Platform.OS === 'android') {
            // This is a hack inspired by this issue:
            // https://github.com/react-native-maps/react-native-maps/issues/4531
            // It may be that future versions of react-native-maps will fix this issue
            setTimeout(() => {
              mapRef.current.fitToElements(true)
            }, 50)
            
            return
          }
          
          mapRef.current.fitToElements(true)
        }
      }}
    >
      {filteredMarkers &&
        filteredMarkers.map(marker => (
          <Marker
            coordinate={{
              latitude: marker && marker.lat,
              longitude: marker && marker.lng,
            }}
            style={{ alignItems: 'center', justifyContent: 'center' }}
            key={marker.key}
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

export default MapWrapper
