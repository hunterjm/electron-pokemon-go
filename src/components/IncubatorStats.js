import React, { PropTypes, Component } from 'react';

class IncubatorStats extends Component {
  render() {
    const profile = this.props.profile;
    const incubator = this.props.incubator;
    const kmRequired = incubator.target_km_walked - incubator.start_km_walked;
    const kmWalked = profile.km_walked - incubator.start_km_walked;
    const progress = kmWalked / kmRequired * 100 || 0;
    return (
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid lightgrey', marginBottom: '5px' }}>
        <div style={{ width: '45px', height: '100%' }}>
          <img src={incubator.img} alt={incubator.name} width={45} height={45} />
        </div>
        <div style={{ marginLeft: '10px', textAlign: 'center', width: '100%' }}>
          <div className="progress">
            <div
              className="progress-bar progress-bar-info"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
              style={{ width: `${progress}%` }}
            >
              <span className="sr-only">{progress}% Complete</span>
            </div>
          </div>
          <div style={{ marginTop: '-16px' }}>{kmWalked.toFixed(2)} / {kmRequired} km</div>
        </div>
      </div>
    );
  }
}

IncubatorStats.propTypes = {
  profile: PropTypes.object.isRequired,
  incubator: PropTypes.object.isRequired
};

export default IncubatorStats;
