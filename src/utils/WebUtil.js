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
  addLiveReload() {
    if (process.env.NODE_ENV === 'development') {
      const head = document.getElementsByTagName('head')[0];
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'http://localhost:35729/livereload.js';
      head.appendChild(script);
    }
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
