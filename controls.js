const controlMappings = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowDown: "down",
  " ": "rotate",
};
const controls = {};

document.addEventListener("keydown", (evt) => {
  controls[controlMappings[evt.key]] = true;
});

document.addEventListener("keyup", (evt) => {
  controls[controlMappings[evt.key]] = false;
});

export default function getControls() {
  return Object.assign({}, controls);
}
