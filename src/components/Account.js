import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';
import { PageHeader, FormControl, Button } from 'react-bootstrap';
import { getApi } from '../utils/ApiUtil';
import validator from 'validator';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as AccountActions from '../actions/account';

class Account extends Component {
  constructor(props) {
    super(props);
    this.next = undefined;
    this.state = {
      username: props.account.username || '',
      password: props.account.password || '',
      provider: props.account.provider || '',
      errors: {}
    };
  }

  componentDidMount() {
    if (this.props.account.provider) {
      ReactDOM.findDOMNode(this.refs.providerSelect).style.color = '#556473';
    } else {
      ReactDOM.findDOMNode(this.refs.usernameInput).focus();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ errors: nextProps.errors || {} });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (nextState.loading !== this.state.loading
      || nextState.errors && nextState.errors !== this.state.errors);
  }

  validate() {
    const errors = {};
    if (!validator.isEmail(this.state.username)) {
      errors.username = 'Must be an email address';
    }

    // Your password must be 8 - 16 characters,
    // and include at least one lowercase letter,
    // one uppercase letter, and a number
    if (!validator.isLength(this.state.password, { min: 6 })) {
      errors.password = ('Must be longer than 6 characters');
    }

    if (validator.isNull(this.state.provider)) {
      errors.platform = 'The provider you log in with is required';
    }

    return errors;
  }

  handleChange(event) {
    const nextState = {};
    nextState[event.target.name] = event.target.value;
    this.setState(nextState);

    // Change color back to dark gray on change
    if (event.target.name === 'provider') {
      const node = event.target;
      node.style.color = '#556473';
    }
  }

  handleBlur() {
    this.setState({ errors: _.omitBy(this.validate(), (val, key) => !this.state[key].length) });
  }

  async handleLogin() {
    if (this.next !== undefined) {
      this.setState({ loading: true });
      this.next(this.state.code);
    } else {
      const errors = this.validate();
      this.setState({ errors });

      if (_.isEmpty(errors)) {
        this.setState({ loading: true });
        const apiClient = getApi();
        await apiClient.init(
          this.state.username,
          this.state.password,
          {
            type: 'name',
            name: 'Times Square'
          },
          this.state.provider
        );
        this.props.saveAccount(this.state);
        this.context.router.push('/player');
      }
    }
  }

  render() {
    const loading = this.state.loading ? <div className="spinner la-ball-clip-rotate la-dark"><div></div></div> : null;
    const fields = (
      <div key="initial-credentials">
        <FormControl ref="usernameInput" maxLength="30" name="username" placeholder="Username"
          defaultValue={this.props.account.username} type="text"
          onChange={this.handleChange.bind(this)} onBlur={this.handleBlur.bind(this)}
        />
        <p className="error-message">{this.state.errors.username}</p>
        <FormControl ref="passwordInput" name="password" placeholder="Password"
          defaultValue={this.props.account.password} type="password"
          onChange={this.handleChange.bind(this)} onBlur={this.handleBlur.bind(this)}
        />
        <p className="error-message">{this.state.errors.password}</p>
        <FormControl componentClass="select" ref="providerSelect" name="provider"
          defaultValue={this.props.account.provider} onChange={this.handleChange.bind(this)}
        >
          <option disabled value="">Provider</option>
          <option value="google">Google</option>
          <option value="ptc">Pokemon Trainer Club</option>
        </FormControl>
        <p className="error-message">{this.state.errors.provider}</p>
      </div>
    );
    return (
      <div className="form-section">
        <PageHeader>Login</PageHeader>
        <form className="form-connect">
          {fields}
          <p className="error-message">{this.state.errors.detail}</p>
          <div className="submit" style={{ float: 'right' }}>
            {loading}
            <Button bsStyle="primary" disabled={this.state.loading}
              onClick={this.handleLogin.bind(this)} type="submit"
            >Log In</Button>
          </div>
        </form>
      </div>
    );
  }
}

Account.propTypes = {
  saveAccount: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired
};

Account.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    account: state.account
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(AccountActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Account);
