import React, { Component } from 'react'
import { ActivityIndicator, View, Text, StyleSheet, Image } from 'react-native'
import { getMap, addNativeEvent } from './map'
import { markerWidth, markerHeight, geocodeURL } from './config'
import axios from 'axios'
import hybrid from './assets/hybrid.jpg'
import roadmap from './assets/roadmap.jpg'
import satellite from './assets/satellite.jpg'
import terrain from './assets/terrain.jpg'
import defaultMarker from './assets/marker.png'

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

  loadAddresses = async () => {
    let { loaded } = this.state

    let {
      apiKey,
      markerType,
      markerCollection,
      markers: { markerAddress },
    } = this.props

    let addr =
      markerType === 'simple'
        ? markerAddress
          ? [markerAddress]
          : []
        : markerCollection
        ? markerCollection.map((m) => {
            return m.markers_list.markerAddress
          })
        : []

    if (!loaded) {
      let result = await axios.post(geocodeURL, {
        addresses: addr,
        key: apiKey,
      })

      this.setState({
        addresses: result.data,
      })

      if (
        markerType === 'simple' ||
        (markerType !== 'simple' && markerCollection)
      ) {
        this.setState({
          loaded: true,
        })
      }
    }
  }

  getFilteredAddresses = () => {
    const { addresses } = this.state

    const { markerType, onPress, markerCollection, markerImage, markerSource } =
      this.props

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
            key: `marker ${index}`,
          }
        })
      }
    }

    //0 addresss passed through case
    return filteredMarkers.filter((marker) => marker.lat)

    // console.log(filtered)

    // if (filtered) {
    //   return filtered
    // } else {
    //   return {
    //     lat: 40.7831,
    //     lng: -73.9712,
    //     image: defaultMarker,
    //     onPress: marker.markers_list.onPress,
    //     key: `marker-1`,
    //   }
    // }
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

    this.loadAddresses()

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
