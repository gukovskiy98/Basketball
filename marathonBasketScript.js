// data-mutable-id: MG2_-1350604717 - first quarter , MG3_1215123098 - second quarter, MG4_-514116383 - third quarter, MG5_2051611432 - fourth quarter

let quarter_duration = 10;
let latency = 90;
let sensitivity = 0.025;
let timeToStart = latency;
// --------- BEEPER -----------
const audio = `<audio id="mybeep" src="https://www.soundjay.com/button/button-2.mp3" preload="auto"></audio>`;
document.body.insertAdjacentHTML("beforeend", audio);
const audioNode = document.getElementById("mybeep");
// ----------------------------

const log = [];
const signals = [];
let maxTotal = -1;

function makeSomeNoise(weight, prevTotal, latestTotal) {
  console.log(`*********`);
  console.log(
    `Weight: ${weight}. Previous coef: ${prevTotal}, coef now: ${latestTotal}`
  );
  signals.push({ weight: weight, coef: latestTotal });
  console.log(`BET ON ${latestTotal}`);
  console.log(`*********`);
  audioNode.play();
}

function isEqual(data1, data2) {
  return JSON.stringify(data1) === JSON.stringify(data2);
}

function calcWeight(x1, x2, y1, y2) {
  // x2 > x1
  // Sometimes x2 can be equal to x1, and the result is going to be Infinity, but that is OK.
  // if (x2 === x1) return 0;
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
  let totals = block
    .querySelectorAll("tbody")[1]
    .querySelectorAll(".coeff-value");
  let total = +totals[totals.length - 2].textContent.trim().slice(1, -1);
  if (total > maxTotal) maxTotal = total;
  return total;
}

function checkForPattern(logArray) {
  let { time: latestTime, points: latestPoints, total: latestTotal } = logArray[
    logArray.length - 1
  ];
  if (latestTime >= (quarter_duration - 4) * 60 || latestTime < timeToStart)
    return;

  let previousTime = latestTime - latency;
  let previousArray = logArray
    .filter((elem) => elem.time >= previousTime)
    .slice(0, -1);
  let previousTotals = previousArray.map((elem) => elem.total);
  if (!previousTotals) return;
  let previousMaxTotal = Math.max(...previousTotals);
  let previousMinTotal = Math.min(...previousTotals);
  let previousMinTime =
    previousArray[previousTotals.lastIndexOf(previousMinTotal)].time;
  console.log(
    `DEBUG: previousMaxTotal: ${previousMaxTotal}, previousMinTotal: ${previousMinTotal}, previousMinTime: ${previousMinTime}`
  );
  if (latestTotal < previousMaxTotal) return;
  if (maxTotal > latestTotal) return;
  let weight = calcWeight(
    previousMinTime,
    latestTime,
    previousMinTotal,
    latestTotal
  );

  console.log(`------------`);
  console.log("checking");
  console.log(`weight: ${weight}`);
  // console.log(
  //   `prevTime: ${tempSave.time} prevPoints: ${tempSave.points} prevTotal: ${tempSave.total}`
  // );
  console.log(
    `curTime: ${latestTime} curPoints: ${latestPoints} curTotal: ${latestTotal}`
  );
  console.log(`------------`);
  if (weight < sensitivity) return;

  makeSomeNoise(weight, previousMaxTotal, latestTotal);
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
  let total = getOdds(); // expecting amount of points
  return {
    time: timeInSecs,
    points: points,
    total: total,
  };
}

function fillLog(data) {
  if (!log.length) {
    log.push(data);
  }
  if (Object.is(data.time, NaN)) {
    log.splice(0, log.length);
    maxTotal = -1;
    return;
  }
  if (isEqual(data, log[log.length - 1])) return;
  if (log.length === 30) {
    log.shift();
  }
  log.push(data);
  checkForPattern(log);
}

// по дефолту quarter_duration = 10, latency = 90, sensitivity = 0.025, timeToStart = latency
// quarter_duration = 12
// latency = 60
// sensitivity =
// timeToStart = latency*2

setInterval(() => fillLog(getData()), 5000);
