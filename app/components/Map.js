import React, { PropTypes, Component } from 'react';
import { GoogleMapLoader, GoogleMap,
  DirectionsRenderer, InfoWindow, SearchBox, Marker } from 'react-google-maps';
import PokemonInfo from './PokemonInfo';
import FortInfo from './FortInfo';
import { getSteps, createButtonControl, calculateDistance } from '../utils/MapUtil';
import { setTimer } from '../utils/ApiUtil';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as AccountActions from '../actions/account';
import * as GameActions from '../actions/game';

class Map extends Component {
  static inputStyle = {
    border: '1px solid transparent',
    borderRadius: '1px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
    boxSizing: 'border-box',
    MozBoxSizing: 'border-box',
    fontSize: '14px',
    height: '32px',
    marginTop: '27px',
    outline: 'none',
    padding: '0 12px',
    textOverflow: 'ellipses',
    width: '400px'
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      content: null,
      activeMarker: null,
      directionsInfo: null,
      directions: null,
      steps: []
    };
  }

  getDirections(lat, lng, travelMode, speed = 1) {
    const { latitude, longitude } = this.props.location.coords;
    const origin = new window.google.maps.LatLng(latitude, longitude);
    const destination = new window.google.maps.LatLng(lat, lng);
    const DirectionsService = new window.google.maps.DirectionsService();

    DirectionsService.route({
      origin,
      destination,
      travelMode,
    }, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        const steps = getSteps(result, speed);
        let running = 0;
        for (const step of steps) {
          running += step.duration;
          step.timeout = setTimeout(() => {
            this.props.setLocation({
              type: 'coords',
              coords: { ...step }
            });
            step.timeout = null;
            // Automatically cancel directions on the last step
            if (step === steps[steps.length - 1]) {
              this.cancelDirections();
            }
          }, running * 1000);
        }
        if (this._googleMapComponent) {
          const map = this._googleMapComponent.props.map;
          const controlDiv = createButtonControl(
            `Cancel Directions<br />(eta ${Math.round(running / 60)} min)`,
            () => { this.cancelDirections(); }
          );
          map.controls[window.google.maps.ControlPosition.BOTTOM_CENTER].push(controlDiv);
        }
        if (this.props.account.loggedIn) {
          setTimer(this.props.heartbeat, 10000);
        }
        this.setState({
          directionsInfo: null,
          directions: result,
          steps
        });
      } else {
        console.error(result);
      }
    });
  }

  cancelDirections() {
    if (this._googleMapComponent) {
      this._googleMapComponent.props.map.controls[window.google.maps.ControlPosition.BOTTOM_CENTER].pop();
    }
    for (const step of this.state.steps) {
      if (step.timeout) clearTimeout(step.timeout);
    }
    if (this.props.account.loggedIn) {
      setTimer(this.props.heartbeat, 30000);
    }
    this.setState({ directions: null, steps: [] });
  }

  handleMapClick(event) {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    const directionsInfo = (
      <InfoWindow position={event.latLng} onCloseclick={this.setState({ directionsInfo: null })}>
        <div>
          <button
            onClick={() => this.getDirections(lat, lng, window.google.maps.TravelMode.WALKING, 1)}
          >Walk</button>
          <button
            onClick={() => this.getDirections(lat, lng, window.google.maps.TravelMode.WALKING, 2)}
          >Run</button>
          <button
            onClick={() => this.getDirections(lat, lng, window.google.maps.TravelMode.DRIVING, 1)}
          >Drive</button>
          <button
            onClick={() => {
              this.props.setLocation({
                type: 'coords',
                coords: {
                  latitude: lat,
                  longitude: lng
                }
              });
              this.setState({ directionsInfo: null });
              if (this.props.account.loggedIn) {
                this.props.heartbeat();
              }
            }}
          >Teleport</button>
        </div>
      </InfoWindow>
    );
    this.setState({ directionsInfo });
  }

  handlePlacesChanged() {
    const places = this.refs.searchBox.getPlaces();
    if (this._googleMapComponent && places.length) {
      this._googleMapComponent.panTo(places[0].geometry.location);
      this.handleMapClick({ latLng: places[0].geometry.location });
    }
  }

  handleMarkerClick(id) {
    this.setState({ activeMarker: id });
  }

  handleMarkerClose() {
    this.setState({ activeMarker: null });
  }

  render() {
    const { content } = this.state;
    let center;
    if (this.props.location && this.props.location.coords) {
      center = { lat: this.props.location.coords.latitude || 0, lng: this.props.location.coords.longitude || 0 };
    }
    let contents = [];

    if (center) {
      const width = Math.min(90 / (this._googleMapComponent && this._googleMapComponent.getZoom() / 10), 22);
      const height = Math.min(240 / (this._googleMapComponent && this._googleMapComponent.getZoom() / 10), 60);
      const avatar = this.props.account.profile && this.props.account.profile.avatar;
      const icon = {
        url: `avatar${avatar && avatar.gender ? 2 : 1}.png`,
        scaledSize: { width, height }
      };
      const marker = {
        key: 'Player',
        position: center,
        icon,
        zIndex: 10
      };
      contents.push((<Marker {...marker} />));
      if (content) {
        contents.push((<InfoWindow key="info" position={center} content={content} />));
      }
    }

    if (this.props.game.nearbyPokemon) {
      contents = contents.concat(this.props.game.nearbyPokemon.map((pokemon, i) => {
        const size = Math.min(120 / (this._googleMapComponent && this._googleMapComponent.getZoom() / 8), 48);
        const icon = {
          url: pokemon.img,
          scaledSize: {
            width: size,
            height: size
          }
        };
        const marker = {
          key: `Pokemon${i}`,
          position: {
            lat: pokemon.latitude,
            lng: pokemon.longitude
          },
          icon,
          zIndex: 1000 + i
        };
        let info;
        if (this.state.activeMarker === pokemon.id) {
          info = (
            <InfoWindow key={`${pokemon.id}Info`} onCloseclick={::this.handleMarkerClose}>
              <PokemonInfo pokemon={pokemon} />
            </InfoWindow>
          );
        }
        return (
          <Marker {...marker} onClick={this.handleMarkerClick.bind(this, pokemon.id)}>
            {info}
          </Marker>
        );
      }));
    }

    if (this.props.game.nearbyForts) {
      contents = contents.concat(this.props.game.nearbyForts.map((fort, i) => {
        const size = Math.min(120 / (this._googleMapComponent && this._googleMapComponent.getZoom() / 8), 48);
        const nearby = calculateDistance(this.props.location.coords, fort) < 40;
        let icon;
        if (fort.type) {
          if (nearby) {
            icon = {
              url: 'pokestop_near.png',
              scaledSize: {
                width: size,
                height: size
              }
            };
          } else if (fort.lure) {
            icon = {
              url: 'pokestop_lure.png',
              scaledSize: {
                width: size,
                height: size
              }
            };
          } else {
            icon = {
              url: 'pokestop.png',
              scaledSize: {
                width: size,
                height: size
              }
            };
          }
        } else {
          icon = {
            url: `team${parseInt(fort.team, 10) || 0}.png`,
            scaledSize: {
              width: size,
              height: size
            }
          };
        }
        const marker = {
          key: `Fort${i}`,
          position: {
            lat: fort.latitude,
            lng: fort.longitude
          },
          icon,
          zIndex: 100 + i
        };
        let info;
        if (this.state.activeMarker === fort.id) {
          info = (
            <InfoWindow key={`${fort.id}Info`} onCloseclick={::this.handleMarkerClose}>
              <FortInfo
                fort={fort} nearby={nearby}
                fortDetails={(id, lat, lng) => { this.props.fortDetails(id, lat, lng); }}
                spinFort={(id, lat, lng) => { this.props.spinFort(id, lat, lng); }}
                getJournal={() => { this.props.getJournal(); }}
              />
            </InfoWindow>
          );
        }
        return (
          <Marker {...marker} onClick={this.handleMarkerClick.bind(this, fort.id)}>
            {info}
          </Marker>
        );
      }));
    }

    return (
      <GoogleMapLoader
        containerElement={
          <div
            style={{
              height: '100%',
            }}
          />
        }
        googleMapElement={
          <GoogleMap
            ref={(map) => (this._googleMapComponent = map)}
            defaultZoom={16}
            center={this._googleMapComponent && this._googleMapComponent.getCenter() || center}
            onClick={::this.handleMapClick}
          >
            <SearchBox
              bounds={this.state.bounds}
              controlPosition={window.google.maps.ControlPosition.TOP_CENTER}
              onPlacesChanged={::this.handlePlacesChanged}
              ref="searchBox"
              placeholder="Search"
              style={Map.inputStyle}
            />
            {this.state.directionsInfo}
            {this.state.directions ? <DirectionsRenderer directions={this.state.directions} /> : null}
            {contents}
          </GoogleMap>
        }
      />
    );
  }
}

Map.propTypes = {
  game: PropTypes.object.isRequired,
  account: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  setLocation: PropTypes.func.isRequired,
  heartbeat: PropTypes.func.isRequired,
  fortDetails: PropTypes.func.isRequired,
  spinFort: PropTypes.func.isRequired,
  getJournal: PropTypes.func.isRequired
};

Map.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    game: state.game,
    account: state.account,
    location: state.game.location || {}
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...GameActions, ...AccountActions }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);
