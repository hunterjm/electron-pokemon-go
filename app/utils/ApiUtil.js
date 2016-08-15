import { PTCLogin, GoogleLogin, Client } from 'pogobuf';
import fs from 'fs';
import path from 'path';
import electron from 'electron';
const remote = electron.remote;
const app = remote.app;

const api = new Client();
const pokemonlist = JSON.parse(fs.readFileSync(`${__dirname}/../pokemons.json`, 'utf8'));
const itemlist = JSON.parse(fs.readFileSync(`${__dirname}/../items.json`, 'utf8'));
let timer;

export default {
  pokemonlist: pokemonlist.pokemon,
  itemlist: itemlist.items,
  async login(username, password, provider, location) {
    let login;
    if (provider === 'google') {
      login = new GoogleLogin();
    } else {
      login = new PTCLogin();
    }
    const token = await login.login(username, password);
    api.setAuthInfo(provider, token);
    api.setPosition(location.coords.latitude, location.coords.longitude);
    return await api.init();
  },
  getApi() {
    return api;
  },
  loadAccount() {
    let accountInfo = {
      username: '',
      password: '',
      provider: ''
    };
    try {
      accountInfo = JSON.parse(fs.readFileSync(path.join(app.getPath('userData'), 'account')));
    } catch (err) {
      // continue regardless of error
    }
    return accountInfo;
  },
  saveAccount(account) {
    fs.writeFileSync(path.join(app.getPath('userData'), 'account'), JSON.stringify(account));
  },
  setTimer(callback, interval) {
    if (timer) {
      clearInterval(timer);
    }
    timer = setInterval(() => { callback(); }, interval);
  },
  clearTimer() {
    if (timer) {
      clearInterval(timer);
      timer = undefined;
    }
  }
};
