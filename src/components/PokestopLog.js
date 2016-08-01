import React, { PropTypes, Component } from 'react';
import { Badge } from 'react-bootstrap';

class PokestopLog extends Component {
  render() {
    const entry = this.props.entry;
    let items = entry.items;
    const count = items.reduce((p, c) => p + c.count, 0);
    items = items.map((item) => (
        <div key={`Item${item.id}`} style={{ float: 'left', margin: '5px' }}>
          <div><img src={item.img} width={20} height={20} /></div>
          <div><small><Badge>{item.count}</Badge></small></div>
        </div>
      ));
    const timestamp = new Date(entry.timestamp);
    return (
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid lightgrey', marginBottom: '5px' }}>
        <div style={{ width: '45px', height: '100%' }}>
          <img src={'pokestop.png'} width={45} height={45} />
        </div>
        <div>
          <div><small>Recieved {count} items from PokeStop.</small></div>
          <div>
            {items}
            <div style={{ clear: 'both' }}></div>
          </div>
          <div><small>{timestamp.toLocaleDateString('en-us')} {timestamp.toLocaleTimeString('en-us')}</small></div>
        </div>
      </div>
    );
  }
}

PokestopLog.propTypes = {
  entry: PropTypes.object.isRequired
};

export default PokestopLog;
