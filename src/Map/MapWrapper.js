import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
// import { useEffect } from 'react'
import { Image, Dimensions } from 'react-native'
import { defaultZoom } from './config'

const { height, width } = Dimensions.get('window')

const MapWrapper = ({
  options,
  styles,
  currentLocation,
  filteredMarkers = [],
  viewCenter,
  overrideDefaultZoom,
  initZoom
}) => {
  const mapType =
    options.mapTypeId === 'roadmap' ? 'standard' : options.mapTypeId
  const zoom = overrideDefaultZoom ? initZoom : defaultZoom + 1;
  const LATITUDE_DELTA = Math.exp(Math.log(360) - (zoom) * Math.LN2)
  const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height)

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
      customMapStyle={options.styles || []}
      ref={(map) => (mapRef = map)}
      onMapReady={() => {
        if (overrideDefaultZoom) return;
        if (filteredMarkers.length > 1) {
          mapRef.fitToElements(true)
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
