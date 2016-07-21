import React, { PropTypes, Component } from 'react';
import { default as raf } from 'raf';
import { GoogleMapLoader, GoogleMap, Circle, InfoWindow, Marker } from 'react-google-maps';
import { connect } from 'react-redux';

class Map extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      content: null,
      radius: 0,
      markers: []
    };
  }

  componentDidMount() {
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
  }

  render() {
    const { content, radius, markers } = this.state;
    const center = this.props.location.coords;
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

Map.propTypes = {
  location: PropTypes.object.isRequired
};

Map.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    location: state.location
  };
}

export default connect(mapStateToProps)(Map);
