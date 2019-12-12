import MapView, { Marker,  PROVIDER_GOOGLE } from 'react-native-maps';
import { View, Text, Image } from 'react-native'
import defaultMarker from './marker.png'

export const getMap = (apiKey, zoom, options, styles, markerType, center, markerTitle, markerSubtitle, markerCollection) => {
    const mapType = options.mapTypeId === 'roadmap' ? 'standard' : options.mapTypeId
    const isSimple = markerType === 'simple'
    const viewCenter = isSimple? center : {
        lat: 41.850033,
        lng: -87.6500523
    }
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
                        latitude: center.lat,
                        longitude: center.lng,
                    }}
                    style={{alignItems: 'center', justifyContent: 'center'}}
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
                            latitude: marker.markers_list.lat,
                            longitude: marker.markers_list.lng,
                        }}
                        style={{alignItems: 'center', justifyContent: 'center'}}
                        key={`marker ${index}`}
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
