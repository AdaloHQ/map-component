import GoogleMapReact from 'google-map-react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { markerWidth, markerHeight } from './config'
import defaultMarker from './assets/marker.png'

const additionalStyles = StyleSheet.create({
    // markerView: {
    //     marginLeft: -75,
    //     marginTop: -markerHeight,
    //     transform: [
    //       { translateY: '-100%' },
    //     ],
    // },
    markerImage: {
        position: 'absolute',
        top: -markerHeight,
        left: -markerWidth / 2,
    }
})

export const addNativeEvent = (apiKey) => {
    // Do nothing in case of web
}

export const getMap = (apiKey, zoom, options, styles, markerType, addresses, /*markerTitle, markerSubtitle,*/onPress, markerCollection) => {
    const isSimple = markerType === 'simple'
    const defaultCenter = {
        lat: 41.850033,
        lng: -87.6500523
    }
    const viewCenter = isSimple? (addresses.length > 0 ? { lat : addresses[0].location.lat, lng: addresses[0].location.lng } : defaultCenter) : defaultCenter
    return (
        <GoogleMapReact
            bootstrapURLKeys={{ key: apiKey }}
            defaultCenter={viewCenter}
            defaultZoom={zoom}
            options={options}
            onGoogleApiLoaded={({map, maps}) => {
                if (!isSimple && addresses.length > 0) {
                    const bounds = new google.maps.LatLngBounds();
                    for (let i = 0; i < addresses.length; i++) {
                        const marker = addresses[i];
                        const newPoint = new google.maps.LatLng(marker.location.lat, marker.location.lng);
                        bounds.extend(newPoint);
                    }
                    map.fitBounds(bounds);
                }
            }}
        >
            {
                isSimple ?
                <View
                    lat={addresses.length > 0 ? addresses[0].location.lat : null}
                    lng={addresses.length > 0 ? addresses[0].location.lng : null}
                    onClick={onPress}
                >
                    <Image
                        resizeMode="contain"
                        source={defaultMarker}
                        style={[styles.markerImage, additionalStyles.markerImage]}
                    />
                    {/* <View
                        style={[styles.markerView, additionalStyles.markerView]}
                    >
                        <Text
                            style={styles.markerTitle}
                        >
                            {markerTitle}
                        </Text>
                        <Text
                            style={styles.markerSubtitle}
                        >
                            {markerSubtitle}
                        </Text>
                    </View> */}
                </View> :
                markerCollection && markerCollection.map((marker, index) => (
                    <View
                        lat={addresses.length > 0 ? addresses[index].location.lat : null}
                        lng={addresses.length > 0 ? addresses[index].location.lng : null}
                        key={`marker ${index}`}
                        onClick={marker.markers_list.onPress}
                    >
                        <Image
                            resizeMode="contain"
                            source={/*marker.markers_list.markerImage? {uri: marker.markers_list.markerImage.uri} : */defaultMarker}
                            style={[styles.markerImage, additionalStyles.markerImage]}
                        />
                        {/* <View
                            style={[styles.markerView, additionalStyles.markerView]}
                        >
                            <Text
                                style={styles.markerTitle}
                            >
                                {marker.markers_list.markerTitle}
                            </Text>
                            <Text
                                style={styles.markerSubtitle}
                            >
                                {marker.markers_list.markerSubtitle}
                            </Text>
                        </View> */}
                    </View>
                ))
            }
        </GoogleMapReact>
    )
}
