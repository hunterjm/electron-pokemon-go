import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';
import { PageHeader, FormControl, Button } from 'react-bootstrap';
import validator from 'validator';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as AccountActions from '../actions/account';

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: props.account.username || '',
      password: props.account.password || '',
      provider: props.account.provider || '',
      errors: {}
    };
  }

  componentDidMount() {
    if (!this.props.account.username) {
      ReactDOM.findDOMNode(this.refs.usernameInput).focus();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.account.loggedIn) {
      this.context.router.push('/player');
    }
    this.setState({ errors: nextProps.errors || {}, loading: false });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (nextProps.account.loggedIn !== this.props.account.loggedIn
      || nextState.loading !== this.state.loading
      || nextState.errors && nextState.errors !== this.state.errors);
  }

  validate() {
    const errors = {};
    if (this.state.provider === 'google' && !validator.isEmail(this.state.username)) {
      errors.username = 'Must be an email address';
    } else if (!validator.isLength(this.state.username, { min: 6 })) {
      errors.username = ('Must be longer than 6 characters');
    }

    // Your password must be 8 - 16 characters,
    // and include at least one lowercase letter,
    // one uppercase letter, and a number
    if (!validator.isLength(this.state.password, { min: 6 })) {
      errors.password = ('Must be longer than 6 characters');
    }

    if (validator.isNull(this.state.provider)) {
      errors.provider = 'The provider you log in with is required';
    }

    return errors;
  }

  handleChange(event) {
    const nextState = {};
    nextState[event.target.name] = event.target.value;
    this.setState(nextState);
  }

  handleBlur() {
    this.setState({ errors: _.omitBy(this.validate(), (val, key) => !this.state[key] || !this.state[key].length) });
  }

  async handleLogin() {
    const errors = this.validate();
    this.setState({ errors });

    if (_.isEmpty(errors)) {
      this.setState({ loading: true });
      this.props.login(
        this.state.username,
        this.state.password,
        this.props.location,
        this.state.provider
      );
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
  login: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  errors: PropTypes.object
};

Account.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    account: state.account,
    location: state.location
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(AccountActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Account);
