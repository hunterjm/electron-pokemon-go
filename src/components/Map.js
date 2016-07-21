import { default as React, Component } from 'react';
import { default as canUseDOM } from 'can-use-dom';
import { default as raf } from 'raf';
import { GoogleMapLoader, GoogleMap, Circle, InfoWindow, Marker } from 'react-google-maps';

const geolocation = (canUseDOM && navigator.geolocation);

export default class Map extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      center: null,
      location: null,
      content: null,
      radius: 0,
      markers: []
    };
  }

  componentDidMount() {
    geolocation.getCurrentPosition((position) => {
      this.setState({
        center: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
      });

      const tick = () => {
        this.setState({ radius: this.state.radius + 0.5 });

        if (this.state.radius > 50) {
          this.setState({ radius: 0 });
          setTimeout(() => { raf(tick); }, 500);
        } else {
          raf(tick);
        }
      };
      raf(tick);
    }, (reason) => {
      this.setState({
        center: {
          lat: 60,
          lng: 105,
        },
        content: `Error: The Geolocation service failed (${reason}).`,
      });
    });
  }

  render() {
    const { center, location, content, radius, markers } = this.state;
    let contents = [];

    if (location) {
      contents.push(
        (<Circle key="circle" center={location} radius={radius} options={{
          fillColor: 'blue',
          fillOpacity: 0.1,
          strokeColor: 'purple',
          strokeOpacity: 0.8,
          strokeWeight: 1,
        }}
        />)
      );
      if (content) {
        contents.push((<InfoWindow key="info" position={location} content={content} />));
      }
    }

    contents = contents.concat(markers.map((marker, i) => {
      const markerKey = `Marker${i}`;
      return (
        <Marker key={markerKey}
          {...marker}
        />
      );
    }));

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
            center={center}
          >
            {contents}
          </GoogleMap>
        }
      />
    );
  }
}
