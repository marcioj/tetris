import Game from "./game.js";

const loop = (cb) => {
  requestAnimationFrame(function nextFrame() {
    cb();
    requestAnimationFrame(nextFrame);
  });
};

async function main() {
  // Wait for the font to load to avoid FOUC
  await document.fonts.load('16px "Gameplay"');
  const game = new Game(document.querySelector("#canvas"));
  window.game = game;

  loop(() => {
    game.nextFrame();
  });
}

// 0
// i = y * 4 + x
//    0, 1, 2, 3
// 0  0, 1, 2, 3,
// 1  4, 5, 6, 7,
// 2  8, 9,10,11,
// 3  12,13,14,15

// 90
// i = 12 + y - (4 * x)
//    0, 1, 2, 3
// 0  12, 8, 4, 0,
// 1  13, 9, 5, 1,
// 2  14,10, 6, 2
// 3  15,11, 7, 3

// 180
// i = 15 - x - (4 * y)
//    0, 1, 2, 3
// 0  15, 14, 13, 12
// 1  11, 10, 9, 8
// 2  7, 6, 4, 4
// 3  3, 2, 1, 0

// 270
// i = 3 - y + (4 * x)
//    0, 1, 2, 3
// 0  3, 7 , 11, 15
// 1  2, 6,  10, 14
// 2  1, 4, 9, 13
// 3  0, 4, 8, 12

window.onload = main;
