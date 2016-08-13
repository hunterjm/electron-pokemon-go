const mapUtils = {
  getSteps(result, speed = 1) {
    const steps = [];
    let distance = 0;
    let duration = 0;
    for (const leg of result.routes[0].legs) {
      distance += leg.distance.value;
      duration += leg.duration.value;
      for (const step of leg.steps) {
        for (const latLng of step.lat_lngs) {
          const point = {
            latitude: latLng.lat(),
            longitude: latLng.lng()
          };
          if (steps.length) {
            point.duration = Math.round(
              mapUtils.calculateDistance(point, steps[steps.length - 1]) / distance * (duration / speed));
          } else {
            point.duration = 0;
          }
          steps.push(point);
        }
      }
    }
    return mapUtils.splitSteps(steps).reduce((p, c) => {
      if (c.duration > 0) p.push(c);
      return p;
    }, []);
  },
  calculateDistance(origin, destination) {
    const R = 6371000; // metres
    const lat1 = mapUtils.toRadians(origin.latitude);
    const lat2 = mapUtils.toRadians(destination.latitude);
    const latDelta = mapUtils.toRadians(destination.latitude - origin.latitude);
    const lngDelta = mapUtils.toRadians(destination.longitude - origin.longitude);

    const a = Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  },
  toRadians(degrees) {
    return degrees * Math.PI / 180;
  },
  splitSteps(steps = []) {
    // We need to split up any step with duration > 30 (or heartbeat timer)
    let newSteps = [];
    let modified = false;

    for (const step of steps) {
      if (step.duration < 5) {
        newSteps.push(step);
        continue;
      }
      const prevStep = newSteps[newSteps.length - 1];
      const newDuration = Math.round(step.duration / 2);
      newSteps.push({
        latitude: ((step.latitude - prevStep.latitude) / 2) + prevStep.latitude,
        longitude: ((step.longitude - prevStep.longitude) / 2) + prevStep.longitude,
        duration: newDuration
      });
      newSteps.push({
        latitude: step.latitude,
        longitude: step.longitude,
        duration: newDuration
      });
      modified = true;
    }

    if (modified) {
      newSteps = mapUtils.splitSteps(newSteps);
    }
    return newSteps;
  },
  createButtonControl(text, callback) {
    const controlDiv = document.createElement('div');
    controlDiv.index = 1;

    // Set CSS for the control border.
    const controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    const controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = text;
    controlUI.appendChild(controlText);

    // Setup the click event listeners: simply set the map to Chicago.
    controlUI.addEventListener('click', () => {
      callback();
    });

    return controlDiv;
  }
};

export default mapUtils;
