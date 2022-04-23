import React, { Component } from 'react'
import { ActivityIndicator, View, Text, StyleSheet, Platform, NativeModules } from 'react-native'
import MapWrapper from './MapWrapper'
import { markerWidth, markerHeight, geocodeURL } from './config'
import axios from 'axios'
import hybrid from './assets/hybrid.jpg'
import roadmap from './assets/roadmap.jpg'
import satellite from './assets/satellite.jpg'
import terrain from './assets/terrain.jpg'
import defaultMarker from './assets/marker.png'
import userLocation from './assets/user.png'

// Matches a comma-separated latitude/longitude coordinate pair: "47.1231231, 179.99999999"
// https://stackoverflow.com/questions/3518504/regular-expression-for-matching-latitude-longitude-coordinates
const COORD_REG_EX = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/

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

const defaultCenter = {
  lat: 40.7831,
  lng: -73.9712,
}

const StatusMessage = ({ message }) => (
  <View style={stylesStatus.wrapper}>
    <Text style={stylesStatus.text}>{message}</Text>
  </View>
)
export default class Map extends Component {
  state = {
    addresses: [],
    errorMessage: null,
    isLoaded: false,
    isLoading: false,
    currentDeviceLocation: null,
    userAddress: [],
  }

  componentDidMount() {
    const { editor, apiKey, style: { currentLocation } } = this.props

    if (editor) {
      return
    }

    if (!apiKey) {
      return this.setState({
        errorMessage: 'API Key is not set.....',
      })
    }

    if (Platform.OS === 'ios') {
      const KeyModule = NativeModules.KeyModule
      KeyModule.addEvent(apiKey)
    }

    if (Platform.OS === 'web' && currentLocation) {
      navigator.geolocation.getCurrentPosition((currentDeviceLocation) => {
        this.setState({
          currentDeviceLocation
        })
      });
    }
  }

  componentDidUpdate() {
    const { editor, apiKey } = this.props
    const { isLoaded, isLoading } = this.state

    if (editor || isLoading || !apiKey) {
      return
    }

    if (this.mapShouldReload()) {
      this.setState({ isLoaded: false })
    }
    
    if (!isLoaded) {
      this.loadAddresses()
    }
  }

  mapShouldReload() {
    const { markerType, markerCollection, markers: { markerAddress }, style: { currentLocation } } = this.props
    const { addresses, isLoaded, currentDeviceLocation, userAddress } = this.state

    if (!isLoaded) {
      return false
    }

    if (currentDeviceLocation) {
      return !userAddress.length
    }

    if (markerType === 'simple') {
      return addresses.length ? markerAddress !== addresses[0].name : markerAddress
    }

    return markerCollection && markerCollection.length !== addresses.length
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

    const { currentDeviceLocation } = this.state

    // prevents unnecessary state updates in didComponentUpdate
    this.setState({
      isLoading: true
    })

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
    const userAddress = []


    if (currentDeviceLocation) {
      userAddress.push({
        lat: currentDeviceLocation.coords.latitude,
        lng: currentDeviceLocation.coords.longitude,
        image: userLocation,
      })
    }

    for (let i = 0; i < locations.length; i++) {
      const location = locations[i]

      if (COORD_REG_EX.test(location.replace(/\s/g, ''))) {
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

    const { data: geocodedLocations } = await axios.post(geocodeURL, {
      addresses,
      key: apiKey,
    })

    const geocodedCoordinates = geocodedLocations.map(location => ({
      name: location.name,
      location: location.address ? location.address.geometry.location : { lat: null, lng: null },
    }))

    // we need to preserve the original order of string addresses/coordinates
    // because getFilteredAddresses relies on indexes
    for (const coordinate of coordinates) {
      const { name, location, index } = coordinate

      geocodedCoordinates.splice(index, 0, { name, location })
    }

    this.setState({
      userAddress: userAddress,
      addresses: geocodedCoordinates,
      isLoaded: true,
      isLoading: false,
    })
  }

  getFilteredAddresses = () => {
    const { addresses, userAddress } = this.state

    const {
      markerType,
      markerCollection,
      markers: { markerSource, markerImage, onPress },
    } = this.props

    let filteredMarkers = []

    if (markerType === 'simple') {
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

    if (userAddress.length) {
      filteredMarkers.push(userAddress[0])
    }

    return filteredMarkers.filter((marker) => marker.lat)
  }

  render() {
    const {
      apiKey,
      editor,
      style: { mapStyle, customStyle, currentLocation }
    } = this.props
    const { errorMessage, isLoaded } = this.state

    const filteredMarkers = this.getFilteredAddresses()

    if (editor) {
      return (
        <View style={{ width: '100%', height: '100%' }}>
          <img
            src={placeholderImages[mapStyle]}
            style={{ objectFit: 'cover', width: 'auto', height: '100%' }}
          />
        </View>
      )
    }

    if (errorMessage) {
      return <StatusMessage message={errorMessage} />
    }

    const options = {
      fullscreenControl: false,
      mapTypeId: mapStyle,
    }

    if (customStyle) {
      try {
        options.styles = JSON.parse(customStyle)
      }
      catch (e) {}
    }

    const viewCenter =
      filteredMarkers.length
        ? { lat: filteredMarkers[0].lat, lng: filteredMarkers[0].lng }
        : defaultCenter

    return (
      <View style={{ width: '100%', height: '100%' }}>
        {isLoaded ? (
          <MapWrapper
            apiKey={apiKey}
            options={options}
            styles={styles}
            currentLocation={currentLocation}
            filteredMarkers={filteredMarkers}
            viewCenter={viewCenter}
          />
        ) : <ActivityIndicator />}
      </View>
    )
  }
}
