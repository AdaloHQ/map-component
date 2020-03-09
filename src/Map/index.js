import React, { Component } from 'react'
import { ActivityIndicator, View, Text, StyleSheet, Image } from 'react-native'
import { getMap, addNativeEvent } from './map'
import { markerWidth, markerHeight, geocodeURL } from './config'
import axios from 'axios'

const stylesStatus = StyleSheet.create({
  wrapper: {
    backgroundColor: '#d30',
    padding: 16,
    borderRadius: 5,
    marginBottom: 16,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
})

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%'
  },
  image: {
    width: '100%',
    height: '100%',
  },
  // markerView: {
  //   display: 'flex',
  //   flexDirection: 'column',
  //   width: 150,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   backgroundColor: 'white',
  //   borderRadius: 5,
  //   paddingLeft: 10,
  //   paddingRight: 10,
  // },
  // markerTitle: {
  //   fontSize: 20,
  //   textAlign: 'center',
  //   marginBottom: 5,
  // },
  // markerSubtitle: {
  //   fontSize: 15,
  //   textAlign: 'center',
  // },
  markerImage: {
    width: markerWidth,
    height: markerHeight
  }
})

export default class Map extends Component {
  state = {
    apiKey: null,
    markerAddress: null,
    addresses: [],
    // markerTitle: null,
    // markerSubtitle: null,
    markerImage: null,
    onPress: null,
    mapStyle: null,
    customStyle: null,
    errorMessage: null,
    zoom: 13,
    markerType: null,
    mapConfigLoaded: false,
  }
  isBrowser = true

  componentDidMount() {
    if (!this.props.editor) {
      this.isBrowser = typeof document !== 'undefined'
      this.fetchMapConfiguration()
    }
  }

  fetchMapConfiguration() {
    const {
      apiKey,
      markerType,
      markers: {
        markerAddress, /*markerTitle, markerSubtitle,*/ markerImage, onPress
      },
      style: {
        mapStyle, customStyle
      }
    } = this.props

    console.log('-------------->', apiKey)

    if (!apiKey) {
      return this.setState({
        errorMessage: "API Key is not set.....",
        mapConfigLoaded: true
      })
    }
    if (!markerAddress) {
      return this.setState({
        errorMessage: "Marker address is not set.",
        mapConfigLoaded: true
      })
    }
    addNativeEvent(apiKey)
    this.setState({
      apiKey,
      markerType,
      markerAddress,
      // markerTitle,
      // markerSubtitle,
      onPress,
      mapStyle,
      customStyle,
      errorMessage: null,
      mapConfigLoaded: true
    })
  }

  getMapOptions(maps) {
    return {
        // streetViewControl: false,
        // scaleControl: true,
        fullscreenControl: false,
        // styles: [{
        //     featureType: "poi.business",
        //     elementType: "labels",
        //     stylers: [{
        //         visibility: "off"
        //     }]
        // }],
        // gestureHandling: "greedy",
        // disableDoubleClickZoom: true,
        // minZoom: 1,
        // maxZoom: 18,

        // mapTypeControl: true,
        mapTypeId: maps.MapTypeId.ROADMAP,
        // mapTypeControlOptions: {
        //     style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
        //     position: maps.ControlPosition.BOTTOM_CENTER,
        //     mapTypeIds: [
        //         maps.MapTypeId.ROADMAP,
        //         maps.MapTypeId.SATELLITE,
        //         maps.MapTypeId.HYBRID,
        //         maps.MapTypeId.TERRAIN
        //     ]
        // },

        // zoomControl: true,
        // clickableIcons: false
    };
  }

  render() {
    let { editor, markerCollection } = this.props
    let {
      apiKey,
      markerType,
      markerAddress,
      addresses,
      // markerTitle,
      // markerSubtitle,
      onPress,
      mapStyle,
      customStyle,
      errorMessage,
      mapConfigLoaded
    } = this.state

    if (editor) {
      return (
        <View style={{ width: '100%', height: '100%' }}>
          <Image
            resizeMode="cover"
            resizeMethod="scale"
            source={{uri: require(`./assets/${this.props.style.mapStyle}.jpg`)}}
            style={styles.image}
          />
        </View>
      )
    }

    if (!mapConfigLoaded) {
      return <ActivityIndicator />
    }

    if (errorMessage) {
      return <StatusMessage message={errorMessage} />
    }

    let options = {
      fullscreenControl: false,
      mapTypeId: mapStyle,
    }
    if (customStyle) {
      options.styles = JSON.parse(customStyle)
    }

    const addr = markerType === 'simple' ? [markerAddress] : markerCollection? markerCollection.map(m => m.markers_list.markerAddress) : []
    if (addresses.length === 0) {
      axios.post(geocodeURL, {
          addresses: addr,
          key: apiKey
      })
      .then(res => {
        this.setState({
          addresses: res.data
        })
      })
      .catch(err => {
      })
    }

    return (
      <View style={{ width: '100%', height: '100%' }}>
        {
          addresses.length > 0 && getMap(apiKey,
            this.state.zoom,
            options,
            styles,
            markerType,
            addresses,
            // markerTitle,
            // markerSubtitle,
            onPress,
            markerCollection
          )
        }
      </View>
    )
  }
}

export class StatusMessage extends Component {
  render() {
    let { message } = this.props

    return (
      <View style={stylesStatus.wrapper}>
        <Text style={stylesStatus.text}>{message}</Text>
      </View>
    )
  }
}
