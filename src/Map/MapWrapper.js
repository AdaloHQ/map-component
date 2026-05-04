import { useRef } from 'react'
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { Image, Dimensions, Platform } from 'react-native'
import { defaultZoom } from './config'

const { height, width } = Dimensions.get('window')

const MapWrapper = ({
  options,
  styles,
  currentLocation,
  filteredMarkers = [],
  viewCenter,
  locationPrecision = 'coarse',
  approximateUserPosition = null,
}) => {
  const mapType =
    options.mapTypeId === 'roadmap' ? 'standard' : options.mapTypeId

  const LATITUDE_DELTA = Math.exp(Math.log(360) - (defaultZoom + 1) * Math.LN2)
  const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height)

  const mapRef = useRef(null)

  const showUserLocationDot =
    Platform.OS === 'android'
      ? Boolean(currentLocation) && locationPrecision === 'fine'
      : Boolean(currentLocation)

  // Android coarse tier: draw an approximate accuracy circle around the user
  // instead of the precise blue dot. Requires only ACCESS_COARSE_LOCATION.
  const showApproximateCircle =
    Platform.OS === 'android' &&
    Boolean(currentLocation) &&
    locationPrecision === 'coarse' &&
    approximateUserPosition &&
    typeof approximateUserPosition.latitude === 'number' &&
    typeof approximateUserPosition.longitude === 'number'

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
      showsUserLocation={showUserLocationDot}
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
      {showApproximateCircle && (
        <Circle
          center={{
            latitude: approximateUserPosition.latitude,
            longitude: approximateUserPosition.longitude,
          }}
          radius={
            typeof approximateUserPosition.accuracy === 'number' &&
            approximateUserPosition.accuracy > 0
              ? approximateUserPosition.accuracy
              : 500
          }
          fillColor="rgba(0, 122, 255, 0.15)"
          strokeColor="rgba(0, 122, 255, 0.4)"
          strokeWidth={1}
        />
      )}
    </MapView>
  )
}

export default MapWrapper
