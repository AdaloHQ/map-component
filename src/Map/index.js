import React, { Component } from 'react'
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native'
import { getMap, addNativeEvent } from './map'
import { markerWidth, markerHeight, geocodeURL } from './config'
import axios from 'axios'
import hybrid from './assets/hybrid.jpg'
import roadmap from './assets/roadmap.jpg'
import satellite from './assets/satellite.jpg'
import terrain from './assets/terrain.jpg'
import defaultMarker from './assets/marker.png'

// Matches a comma-separated latitude/longitude coordinate pair: "47.1231231, 179.99999999"
// https://stackoverflow.com/questions/3518504/regular-expression-for-matching-latitude-longitude-coordinates
const COORD_REG_EX = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/

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
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  markerImage: {
    width: markerWidth,
    height: markerHeight,
  },
})

const placeholderImages = {
  hybrid,
  roadmap,
  satellite,
  terrain,
}

export default class Map extends Component {
  state = {
    apiKey: null,
    markerAddress: null,
    addresses: [],
    markerImage: null,
    onPress: null,
    mapStyle: null,
    customStyle: null,
    currentLocation: false,
    errorMessage: null,
    zoom: 13,
    markerType: null,
    mapConfigLoaded: false,
    loaded: false,
  }
  isBrowser = true

  componentDidMount() {
    if (!this.props.editor) {
      this.isBrowser = typeof document !== 'undefined'
      this.fetchMapConfiguration()
    }
  }

  async componentDidUpdate() {
    const { markerCollection, editor, markers: { markerAddress } } = this.props
    const { loaded } = this.state

    const markersLoaded = markerCollection || markerAddress

    // load the addresses here instead of componentDidMount
    // because markerCollection is not immediately available
    if (markersLoaded && !loaded && !editor) {
      this.loadAddresses()
    }
  }

  static getDerivedStateFromProps(props, state) {
    const { addresses, loaded } = state
    const { markerType, markerCollection } = props
    if (loaded && markerType !== 'simple') {
      if (markerCollection && markerCollection.length !== addresses.length) {
        return {
          ...state,
          loaded: false,
        }
      }
    }
    return null
  }

  fetchMapConfiguration() {
    const {
      apiKey,
      markerType,
      markers: { markerAddress, markerImage, onPress },
      style: { mapStyle, customStyle, currentLocation },
    } = this.props

    if (!apiKey) {
      return this.setState({
        errorMessage: 'API Key is not set.....',
        mapConfigLoaded: true,
      })
    }

    addNativeEvent(apiKey)

    this.setState({
      apiKey,
      markerType,
      markerAddress,
      onPress,
      mapStyle,
      customStyle,
      currentLocation,
      errorMessage: null,
      mapConfigLoaded: true,
    })
  }

  getMapOptions(maps) {
    return {
      fullscreenControl: false,
      mapTypeId: maps.MapTypeId.ROADMAP,
    }
  }

  async loadAddresses() {
    const {
      apiKey,
      markerType,
      markerCollection,
      markers: { markerAddress },
    } = this.props

    const locations =
      markerType === 'simple'
        ? markerAddress
          ? [markerAddress]
          : []
        : markerCollection
        ? markerCollection.map(m => m.markers_list.markerAddress)
        : []
    
    const coordinates = []
    const addresses = []

    for (let i = 0; i < locations.length; i++) {
      const location = locations[i]

      if (COORD_REG_EX.test(location)) {
        const [lat, lng] = location.split(',')

        // this matches the shape of the geocoded coordinates below
        coordinates.push({
          name: location,
          location: {
            lat: parseFloat(lat.trim(), 10),
            lng: parseFloat(lng.trim(), 10),
          },
          index: i,
        })
      } else {
        addresses.push(location)
      }
    }

    const { data: geocodedCoordinates } = await axios.post(geocodeURL, {
      addresses,
      key: apiKey,
    })

    for (const coordinate of coordinates) {
      const { name, location, index } = coordinate

      geocodedCoordinates.splice(index, 0, { name, location })
    }

    this.setState({
      addresses: geocodedCoordinates,
      loaded: true,
    })
  }

  getFilteredAddresses = () => {
    const { addresses } = this.state

    const {
      markerType,
      markerCollection,
      markers: { markerSource, markerImage, onPress },
    } = this.props

    const isSimple = markerType === 'simple'
    let filteredMarkers = []

    if (isSimple) {
      filteredMarkers.push({
        lat: addresses.length > 0 ? addresses[0].location.lat : null,
        lng: addresses.length > 0 ? addresses[0].location.lng : null,
        image:
          markerImage && markerSource === 'custom'
            ? markerImage
            : defaultMarker,
        onPress,
      })
    } else {
      if (markerCollection) {
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
            image:
              marker.markers_list.listMarkerImage &&
              marker.markers_list.markerSource === 'custom'
                ? marker.markers_list.listMarkerImage
                : defaultMarker,
            onPress: marker.markers_list.onPress,
          }
        })
      }
    }
    return filteredMarkers.filter((marker) => marker.lat)
  }

  render() {
    let { apiKey, editor } = this.props

    let {
      mapStyle,
      customStyle,
      currentLocation,
      errorMessage,
      mapConfigLoaded,
      loaded,
    } = this.state

    const filteredMarkers = this.getFilteredAddresses()

    if (editor) {
      return (
        <View style={{ width: '100%', height: '100%' }}>
          <img
            src={placeholderImages[this.props.style.mapStyle]}
            style={{ objectFit: 'cover', width: 'auto', height: '100%' }}
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
      try {
        options.styles = JSON.parse(customStyle)
      }
      catch (e) {}
    }

    return (
      <View style={{ width: '100%', height: '100%' }}>
        {loaded &&
          getMap({
            apiKey,
            zoom: this.state.zoom,
            options,
            styles,
            currentLocation,
            filteredMarkers,
          })}
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
