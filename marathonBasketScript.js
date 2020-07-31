// data-mutable-id: MG2_-1350604717 - first quarter , MG3_1215123098 - second quarter, MG4_-514116383 - third quarter, MG5_2051611432 - fourth quarter

let quarter_duration = 10;
let latency = 90;

// --------- BEEPER -----------
const audio = `<audio id="mybeep" src="https://www.soundjay.com/button/beep-07.mp3" preload="auto"></audio>`;
document.body.insertAdjacentHTML("beforeend", audio);
const audioNode = document.getElementById("mybeep");
// ----------------------------

const log = [];
const signals = [];

function makeSomeNoise(weight, prevCoef, latestCoef) {
  console.log(`*********`);
  console.log(
    `Weight: ${weight}. Previous coef: ${prevCoef}, coef now: ${latestCoef}`
  );
  signals.push({ weight: weight, coef: latestCoef });
  console.log(`BET ON ${latestCoef}-${latestCoef + 2}`);
  console.log(`*********`);
  audioNode.play();
}

function isEqual(data1, data2) {
  return JSON.stringify(data1) === JSON.stringify(data2);
}

function calcWeight(x1, x2, y1, y2) {
  // x2 > x1
  let tan = (y2 - y1) / (x2 - x1);
  let weight = (10 * tan) / y1;
  return weight;
}

function getOdds() {
  let block =
    document.querySelector("[data-mutable-id=MG2_-1350604717]") ||
    document.querySelector("[data-mutable-id=MG3_1215123098]") ||
    document.querySelector("[data-mutable-id=MG4_-514116383]") ||
    document.querySelector("[data-mutable-id=MG5_2051611432]");
  if (!block) return 0;
  let coefs = block
    .querySelectorAll("tbody")[1]
    .querySelectorAll(".coeff-value");
  let coef = coefs[coefs.length - 2].textContent.trim().slice(1, -1);

  return +coef;
}

function checkForPattern(logArray) {
  let { time: latestTime, points: latestPoints, coef: latestCoef } = logArray[
    logArray.length - 1
  ];
  if (latestTime >= (quarter_duration - 4) * 60) return;

  let previousTime = latestTime - latency;
  let tempSave = logArray
    .filter((elem) => elem.time >= previousTime)
    .reduceRight((res, elem) => (elem.time < res.time ? elem : res));
  if (!tempSave) return;
  if (latestTime - tempSave.time < latency - 20) return;
  let weight = calcWeight(tempSave.time, latestTime, tempSave.coef, latestCoef);

  console.log(`------------`);
  console.log("checking");
  console.log(`weight: ${weight}`);
  console.log(
    `prevTime: ${tempSave.time} prevPoints: ${tempSave.points} prevCoef: ${tempSave.coef}`
  );
  console.log(
    `curTime: ${latestTime} curPoints: ${latestPoints} curCoef: ${latestCoef}`
  );
  console.log(`------------`);
  if (weight < 0.01) return;

  makeSomeNoise(weight, tempSave.coef, latestCoef);
}

function getData() {
  let resText = document
    .querySelector(".result-row")
    .textContent.trim()
    .split(" ")
    .filter((elem) => elem.length > 1);
  let timeArray = resText[resText.length - 1].split(":");
  let timeInSecs = +timeArray[0] * 60 + +timeArray[1]; // time from the beginning
  let points = resText[0].split(":").reduce((sum, elem) => +sum + +elem); // sum
  let coef = getOdds(); // expecting amount of points
  return {
    time: timeInSecs,
    points: points,
    coef: coef,
  };
}

function fillLog(data) {
  if (!log.length) {
    log.push(data);
  }
  if (Object.is(data.time, NaN)) {
    log.splice(0, log.length);
    return;
  }
  if (isEqual(data, log[log.length - 1])) return;
  if (log.length === 30) {
    log.shift();
  }
  log.push(data);
  checkForPattern(log);
}

// по дефолту quarter_duration = 10, latency = 90
// quarter_duration = 12
// latency = 60

setInterval(() => fillLog(getData()), 5000);
