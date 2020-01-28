import MapView, { Marker,  PROVIDER_GOOGLE } from 'react-native-maps';
import { View, Text, Image, NativeModules, Platform } from 'react-native'
import defaultMarker from './marker.png'

export const addNativeEvent = (apiKey) => {
    if (Platform.OS === 'ios') {
        var KeyModule = NativeModules.KeyModule;
        KeyModule.addEvent(apiKey);
    } else {
    }
}

export const getMap = (apiKey, zoom, options, styles, markerType, addresses, markerTitle, markerSubtitle, onPress, markerCollection) => {
    const mapType = options.mapTypeId === 'roadmap' ? 'standard' : options.mapTypeId
    const isSimple = markerType === 'simple'
    const defaultCenter = {
        lat: 41.850033,
        lng: -87.6500523
    }
    const viewCenter = isSimple? (addresses.length > 0 ? { lat : addresses[0].location.lat, lng: addresses[0].location.lng } : defaultCenter) : defaultCenter
    return (
        <MapView
            style={styles.container}
            provider={PROVIDER_GOOGLE}
            region={{
              latitude: viewCenter.lat,
              longitude: viewCenter.lng,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            mapType={mapType}
            customMapStyle={options.styles? options.styles: []}
        >
            {
                isSimple ?
                <Marker
                    coordinate={{
                        latitude: addresses.length > 0 ? addresses[0].location.lat : 0,
                        longitude: addresses.length > 0 ? addresses[0].location.lng : 0
                    }}
                    style={{alignItems: 'center', justifyContent: 'center'}}
                    onPress={onPress}
                >
                    <View
                        style={styles.markerView}
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
                    </View>
                    <Image
                        resizeMode="contain"
                        source={{uri: "https://s3.amazonaws.com/proton-uploads-production/499cb11629f511ada5c83ac84b4f026ee345a9bd3b17bdf6a7b06f3198052c3b.png"}}
                        style={styles.markerImage}
                    />
                </Marker> :
                markerCollection && markerCollection.map((marker, index) => (
                    <Marker
                        coordinate={{
                            latitude: addresses.length > 0 ? addresses[index].location.lat : 0,
                            longitude: addresses.length > 0 ? addresses[index].location.lng : 0
                        }}
                        style={{alignItems: 'center', justifyContent: 'center'}}
                        key={`marker ${index}`}
                        onPress={marker.markers_list.onPress}
                    >
                        <View
                            style={styles.markerView}
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
                        </View>
                        <Image
                            resizeMode="contain"
                            source={marker.markers_list.markerImage? {uri: marker.markers_list.markerImage.uri} : defaultMarker}
                            style={styles.markerImage}
                        />
                    </Marker>
                ))
            }
        </MapView>
    )
}
