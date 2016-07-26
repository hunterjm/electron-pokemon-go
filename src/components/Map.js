import React, { PropTypes, Component } from 'react';
import { default as raf } from 'raf';
import { GoogleMapLoader, GoogleMap, Circle,
  DirectionsRenderer, InfoWindow, SearchBox, Marker } from 'react-google-maps';
import PokemonInfo from './PokemonInfo';
import FortInfo from './FortInfo';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
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

  static overlayView = {
    background: 'white',
    border: '1px solid #ccc',
    padding: 15
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      content: null,
      radius: 0,
      activeMarker: null,
      directionsInfo: null,
      directions: null,
      steps: []
    };
  }

  componentDidMount() {
    const tick = () => {
      this.setState({ radius: this.state.radius + 1 });

      if (this.state.radius > 100) {
        this.setState({ radius: 0 });
        setTimeout(() => { raf(tick); }, 500);
      } else {
        raf(tick);
      }
    };
    raf(tick);
  }

  getDirections(lat, lng, travelMode) {
    const { latitude, longitude } = this.props.location.coords;
    const origin = new window.google.maps.LatLng(latitude, longitude);
    const destination = new window.google.maps.LatLng(lat, lng);
    const DirectionsService = new window.google.maps.DirectionsService();

    let steps = [];

    DirectionsService.route({
      origin,
      destination,
      travelMode,
    }, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        let distance = 0;
        let duration = 0;
        for (const leg of result.routes[0].legs) {
          distance += leg.distance.value;
          duration += leg.duration.value;
          for (const step of leg.steps) {
            for (const latLng of step.lat_lngs) {
              const point = {
                latitude: latLng.lat(),
                longitude: latLng.lng()
              };
              if (steps.length) {
                point.duration = Math.round(
                  this.calculateDistance(point, steps[steps.length - 1]) / distance * duration);
              } else {
                point.duration = 0;
              }
              steps.push(point);
            }
          }
        }
        steps = this.splitSteps(steps);
        steps = steps.reduce((p, c) => {
          if (c.duration > 0) p.push(c);
          return p;
        }, []);
        let running = 0;
        for (const step of steps) {
          running += step.duration;
          step.timeout = setTimeout(() => {
            this.props.setLocation({
              type: 'coords',
              coords: { ...step }
            });
            step.timeout = null;
          }, running * 1000);
        }
        if (this._googleMapComponent) {
          const map = this._googleMapComponent.props.map;
          console.log(map.controls[window.google.maps.ControlPosition.BOTTOM_CENTER]);
          const controlDiv = document.createElement('div');
          controlDiv.index = 1;

          // Set CSS for the control border.
          const controlUI = document.createElement('div');
          controlUI.style.backgroundColor = '#fff';
          controlUI.style.border = '2px solid #fff';
          controlUI.style.borderRadius = '3px';
          controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
          controlUI.style.cursor = 'pointer';
          controlUI.style.marginBottom = '22px';
          controlUI.style.textAlign = 'center';
          controlUI.title = 'Click to recenter the map';
          controlDiv.appendChild(controlUI);

          // Set CSS for the control interior.
          const controlText = document.createElement('div');
          controlText.style.color = 'rgb(25,25,25)';
          controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
          controlText.style.fontSize = '16px';
          controlText.style.lineHeight = '38px';
          controlText.style.paddingLeft = '5px';
          controlText.style.paddingRight = '5px';
          controlText.innerHTML = 'Cancel Directions';
          controlUI.appendChild(controlText);

          // Setup the click event listeners: simply set the map to Chicago.
          controlUI.addEventListener('click', () => {
            this.cancelDirections();
          });

          map.controls[window.google.maps.ControlPosition.BOTTOM_CENTER].push(controlDiv);
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
    this.setState({ directions: null, steps: [] });
  }

  calculateDistance(origin, destination) {
    const R = 6371000; // metres
    const lat1 = this.toRadians(origin.latitude);
    const lat2 = this.toRadians(destination.latitude);
    const latDelta = this.toRadians(destination.latitude - origin.latitude);
    const lngDelta = this.toRadians(destination.longitude - origin.longitude);

    const a = Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  toRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  splitSteps(steps) {
    // We need to split up any step with duration > 30 (or heartbeat timer)
    let newSteps = [];
    let modified = false;

    for (const step of steps) {
      if (step.duration < 5) {
        newSteps.push(step);
        continue;
      }
      const prevStep = newSteps[newSteps.length - 1];
      const newDuration = Math.round(step.duration / 2);
      newSteps.push({
        latitude: ((step.latitude - prevStep.latitude) / 2) + prevStep.latitude,
        longitude: ((step.longitude - prevStep.longitude) / 2) + prevStep.longitude,
        duration: newDuration
      });
      newSteps.push({
        latitude: step.latitude,
        longitude: step.longitude,
        duration: newDuration
      });
      modified = true;
    }

    if (modified) {
      newSteps = this.splitSteps(newSteps);
    }
    return newSteps;
  }

  handleMapClick(event) {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    const directionsInfo = (
      <InfoWindow position={event.latLng} onCloseclick={this.setState({ directionsInfo: null })}>
        <div>
          <button
            onClick={() => this.getDirections(lat, lng, window.google.maps.TravelMode.WALKING)}
          >Walk</button>
          <button
            onClick={() => this.getDirections(lat, lng, window.google.maps.TravelMode.DRIVING)}
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
    const { content, radius } = this.state;
    let center;
    if (this.props.location && this.props.location.coords) {
      center = { lat: this.props.location.coords.latitude || 0, lng: this.props.location.coords.longitude || 0 };
    }
    let contents = [];

    if (center) {
      contents.push(
        (<Circle key="circle" center={center} radius={radius} options={{
          fillColor: 'blue',
          fillOpacity: 0.1,
          strokeColor: 'purple',
          strokeOpacity: 0.8,
          strokeWeight: 1,
        }}
        />)
      );
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
        let icon;
        if (fort.type) {
          if (fort.lure) {
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
            url: `team${parseInt(fort.team, 10)}.png`,
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
              <FortInfo fort={fort} fortDetails={this.props.fortDetails} spinFort={this.props.spinFort} />
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
  spinFort: PropTypes.func.isRequired
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
  return bindActionCreators(GameActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);
