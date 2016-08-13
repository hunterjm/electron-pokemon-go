import electron from 'electron';
const remote = electron.remote;
const app = remote.app;
import fs from 'fs';
import path from 'path';

export default {
  addWindowSizeSaving() {
    window.addEventListener('resize', () => {
      fs.writeFileSync(path.join(app.getPath('userData'), 'size'), JSON.stringify({
        width: window.outerWidth,
        height: window.outerHeight,
      }));
    });
  },
  disableGlobalBackspace() {
    document.onkeydown = function onkeydown(e) {
      const event = e || window.event;
      let doPrevent;
      if (event.keyCode === 8) {
        const d = event.srcElement || event.target;
        if (d.tagName.toUpperCase() === 'INPUT' || d.tagName.toUpperCase() === 'TEXTAREA') {
          doPrevent = d.readOnly || d.disabled;
        } else {
          doPrevent = true;
        }
      } else {
        doPrevent = false;
      }
      if (doPrevent) {
        e.preventDefault();
      }
    };
  },
};
