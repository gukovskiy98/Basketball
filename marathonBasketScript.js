// data-mutable-id: MG2_-1350604717 - first quarter , MG3_1215123098 - second quarter, MG4_-514116383 - third quarter, MG5_2051611432 - fourth quarter

let quarter_duration = 10;
let latency = 61;
let timeToStart = 150;
// --------- BEEPER -----------
const audio = `<audio id="mybeep" src="https://www.soundjay.com/button/button-2.mp3" preload="auto"></audio>`;
document.body.insertAdjacentHTML("beforeend", audio);
const audioNode = document.getElementById("mybeep");
// ----------------------------

const log = [];
const signals = [];
let maxTotal = -1;

function makeSomeNoise(minPrevTotal, latestTotal, latestTime) {
  let diff = latestTotal - minPrevTotal;
  console.log(`*********`);
  console.log(`Previous mintotal: ${minPrevTotal}, total now: ${latestTotal}`);
  console.log(`Diff: ${diff}`);
  console.log(`Time: ${latestTime}`);
  console.log(`BET ON ${latestTotal}`);
  console.log(`*********`);

  signals.push({
    total: latestTotal,
    time: latestTime,
    diff: diff,
  });
  audioNode.play();
}

function isEqual(data1, data2) {
  return JSON.stringify(data1) === JSON.stringify(data2);
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
  let { time: latestTime, total: latestTotal } = logArray[logArray.length - 1];
  if (latestTime >= (quarter_duration - 4) * 60 || latestTime <= timeToStart)
    return;

  let previousTime = latestTime - latency;
  let previousTotals = logArray
    .filter((elem) => elem.time >= previousTime)
    .slice(0, -1)
    .map((elem) => elem.total);

  if (!previousTotals) return;
  let previousMinTotal = Math.min(...previousTotals);
  if (maxTotal > latestTotal) return;
  if (latestTotal - previousMinTotal <= 4) return;

  makeSomeNoise(previousMinTotal, latestTotal, latestTime);
}

function getData() {
  let resText = document
    .querySelector(".result-row")
    .textContent.trim()
    .split(" ")
    .filter((elem) => elem.length > 1);
  let timeArray = resText[resText.length - 1].split(":");
  let timeInSecs = +timeArray[0] * 60 + +timeArray[1]; // time from the beginning
  let total = getOdds(); // expecting total
  return {
    time: timeInSecs,
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
  if (log.length === 20) {
    log.shift();
  }
  log.push(data);
  checkForPattern(log);
}

// по дефолту timeToStart = 150, latency = 61, quarter_duration = 10
// timeToStart =
// latency =
// quarter_duration = 12

setInterval(() => fillLog(getData()), 5000);
