// data-mutable-id: MG2_-1350604717 - first quarter , MG3_1215123098 - second quarter, MG4_-514116383 - third quarter, MG5_2051611432 - fourth quarter

let quarter_duration = 10;
let latency = 61;
let timeBeforeEnd = 2;
let sensitivityForLower = 6;
let sensitivityForHigher = 4;
// --------- BEEPER -----------
const audio = `<audio id="mybeep" src="https://www.soundjay.com/button/button-2.mp3" preload="auto"></audio>`;
document.body.insertAdjacentHTML("beforeend", audio);
const audioNode = document.getElementById("mybeep");
// ----------------------------

const log = [];
const signals = [];
let maxTotal = -1;
let minTotal = 999;
const teamsArr = document.querySelectorAll(".live-today-member-name");
const team1 = teamsArr[0].textContent.trim();
const team2 = teamsArr[1].textContent.trim();

function secsToMins(time) {
  let mins = Math.floor(time / 60);
  let secs = time - mins * 60;
  if (mins < 10) mins = `0${mins}`;
  if (secs < 10) secs = `0${secs}`;
  return `${mins}:${secs}`;
}

function showNotification(time, diff, param, latestTotal) {
  new Notification(
    `${team1} - ${team2}\nTime: ${time}. Diff: ${diff}.\nBET ON: ${param} than ${latestTotal}`
  );
}

function makeSomeNoise(prevTotal, latestTotal, latestTime, param) {
  let time = secsToMins(latestTime);
  let diff = latestTotal - prevTotal;
  console.log(`*********`);
  console.log(`Previous extremum: ${prevTotal}, total now: ${latestTotal}`);
  console.log(`Diff: ${diff}`);
  console.log(`Time: ${time}`);
  console.log(`BET ON ${param} than ${latestTotal}`);
  if (param === "higher") {
    let tempArr = document
      .querySelector(".result-row")
      .textContent.trim()
      .split(" ")
      .filter((elem) => elem.length > 1);
    let currentPointsString = tempArr[tempArr.length - 2];
    if (currentPointsString[currentPointsString.length - 1] === ")") {
      currentPointsString = currentPointsString.slice(0, -1);
    }
    let currentPoints = currentPointsString
      .split(":")
      .reduce((sum, elem) => +sum + +elem);
    let pointsToReach =
      ((latestTotal + 1 - currentPoints) /
        (quarter_duration * 60 - latestTime)) *
      60;
    console.log(`Has to be scored: ${pointsToReach} in a minute`);
  }
  console.log(`*********`);

  signals.push({
    total: latestTotal,
    time: latestTime,
    diff: diff,
  });
  audioNode.play();
  showNotification(time, diff, param, latestTotal);
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
  if (total < minTotal) minTotal = total;
  return total;
}

function checkForPattern(logArray) {
  let { time: latestTime, total: latestTotal } = logArray[logArray.length - 1];
  if (
    latestTime >= (quarter_duration - 4) * 60 ||
    latestTime <= (quarter_duration - 4 - timeBeforeEnd) * 60
  )
    return;

  let previousTime = latestTime - latency;
  let previousTotals = logArray
    .filter((elem) => elem.time >= previousTime)
    .slice(0, -1)
    .map((elem) => elem.total);

  if (!previousTotals) return;
  let previousMinTotal = Math.min(...previousTotals);
  let previousMaxTotal = Math.max(...previousTotals);
  // if (maxTotal > latestTotal) return;
  if (
    latestTotal - previousMinTotal < sensitivityForLower &&
    previousMaxTotal - latestTotal < sensitivityForHigher
  )
    return;
  if (latestTotal - previousMinTotal >= sensitivityForLower) {
    makeSomeNoise(previousMinTotal, latestTotal, latestTime, "lower");
  } else {
    makeSomeNoise(previousMaxTotal, latestTotal, latestTime, "higher");
  }
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
    minTotal = 999;
    return;
  }
  if (isEqual(data, log[log.length - 1])) return;
  if (log.length === 20) {
    log.shift();
  }
  log.push(data);
  checkForPattern(log);
}

if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

// по дефолту timeBeforeEnd = 2, latency = 61, quarter_duration = 10, sensitivityForLower = 6, sensitivityForHigher = 4
// timeBeforeEnd = 3
// latency =
// quarter_duration = 12
// sensitivityForLower =
// sensitivityForHigher =

setInterval(() => fillLog(getData()), 5000);
