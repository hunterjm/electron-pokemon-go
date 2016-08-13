import { Pokeio } from 'pokemon-go-node-api';
import fs from 'fs';
import path from 'path';
import electron from 'electron';
import Promise from 'bluebird';
const remote = electron.remote;
const app = remote.app;

const api = Promise.promisifyAll(new Pokeio());
let timer;

export default {
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
