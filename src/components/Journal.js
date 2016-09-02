import React, { PropTypes, Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PokemonLog from './PokemonLog';
import PokestopLog from './PokestopLog';
import * as AccountActions from '../actions/account';

class Journal extends Component {
  componentWillMount() {
    this.props.getJournal();
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.account.journal !== this.props.account.journal;
  }

  render() {
    const account = this.props.account;
    let contents = [];
    if (account.journal && account.journal.length) {
      contents = contents.concat(account.journal.map((entry, i) => {
        const key = `entry${i}`;
        if (entry.action === 'catch_pokemon') {
          return (<PokemonLog key={key} entry={entry} />);
        }
        return (<PokestopLog key={key} entry={entry} />);
      }));
    }
    return (
      <div className="form-section">
        {contents}
      </div>
    );
  }
}

Journal.propTypes = {
  getJournal: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired
};

Journal.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return { account: state.account };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...AccountActions }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Journal);
