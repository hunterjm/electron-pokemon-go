import React, { PropTypes, Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PokemonStats from './PokemonStats';
import * as SettingsActions from '../actions/settings';

class Inventory extends Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.game.inventory !== this.props.game.inventory
      || nextProps.settings !== this.props.settings;
  }

  render() {
    const inventory = this.props.game.inventory;
    const sortBy = this.props.settings.sort || 'iv';
    const asc = ['nickname', 'name'].indexOf(sortBy) !== -1;
    let contents = [];
    if (inventory.pokemon && inventory.pokemon.length) {
      const pokemon = [...inventory.pokemon];
      pokemon.sort((a, b) => {
        if (a[sortBy] === b[sortBy]) return 0;
        let v = a[sortBy] > b[sortBy] ? -1 : 1;
        if (asc) v *= -1;
        return v;
      });
      contents = contents.concat(pokemon.map((p, i) => {
        const key = `inventory${i}`;
        return (<PokemonStats key={key} pokemon={p} />);
      }));
    }
    return (
      <div className="form-section">
        <select className="form-control" value={sortBy} onChange={(e) => this.props.updateSortOrder(e.target.value)}>
          <option value="iv">Individual Values (IV)</option>
          <option value="cp">Combat Power (CP)</option>
          <option value="favorite">Favorite</option>
          <option value="nickname">Name</option>
          <option value="name">Type</option>
          <option value="creation_time_ms">Recent</option>
        </select>
        <br />
        {contents}
      </div>
    );
  }
}

Inventory.propTypes = {
  updateSortOrder: PropTypes.func.isRequired,
  game: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired
};

Inventory.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    game: state.game,
    settings: state.settings
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...SettingsActions }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Inventory);
