// data-mutable-id: MG2_-2012823853 - первая четверть , MG3_552903962 - вторая четверть, MG4_-1176335519 - третья четверть, MG5_1389392296 - четвертая четверть

let quarter_duration = 10;
let latency = 61;
let timeBeforeEnd = 2;
console.log(`Константы:`);
console.log(`quarter_duration: ${quarter_duration}`);
console.log(`latency: ${latency}`);
console.log(`timeBeforeEnd: ${timeBeforeEnd}`);
console.log(`-------------\n`);
// --------- BEEPER -----------
// const audio = `<audio id="mybeep" src="https://www.soundjay.com/button/button-2.mp3" preload="auto"></audio>`;
// document.body.insertAdjacentHTML("beforeend", audio);
// const audioNode = document.getElementById("mybeep");
// ----------------------------

const log = [];
const signals = [];
let maxTotal = -1;
let minTotal = 999;
let teamsArr = document.querySelectorAll(".live-today-member-name");
if (!teamsArr.length) {
  teamsArr = document.querySelectorAll(".live-member-name");
}
const team1 = teamsArr[0].textContent.trim();
const team2 = teamsArr[1].textContent.trim();
new Notification(`${team1}-${team2}: скрипт работает`);

function secsToMins(time) {
  let mins = Math.floor(time / 60);
  let secs = time - mins * 60;
  if (mins < 10) mins = `0${mins}`;
  if (secs < 10) secs = `0${secs}`;
  return `${mins}:${secs}`;
}

function showNotification(time, diff, latestTotal, pointsToReach) {
  new Notification(
    `Очков/мин:${pointsToReach.toFixed(
      2
    )}.Разница:${diff}.Время:${time}.\nСтавка:меньше,чем ${latestTotal}`
  );
}

function makeSomeNoise(prevTotal, latestTotal, latestTime, pointsToReach) {
  let time = secsToMins(latestTime);
  let diff = latestTotal - prevTotal;
  console.log(`*********`);
  console.log(
    `Минимальный тотал за ${latency} сек: ${prevTotal}, тотал сейчас: ${latestTotal}`
  );
  console.log(`Разница: ${diff}`);
  console.log(`Время: ${time}`);
  console.log(
    `За весь лог - максимальный тотал: ${maxTotal}, минимальный тотал: ${minTotal}`
  );
  console.log(`Ставка: меньше, чем ${latestTotal}`);

  console.log(`Не больше, чем: ${pointsToReach} очков в минуту`);
  console.log(`*********`);

  signals.push({
    total: latestTotal,
    time: latestTime,
    diff: diff,
    ptr: pointsToReach,
  });
  audioNode.play();
  showNotification(time, diff, latestTotal, pointsToReach);
}

function checkForPattern(logArray) {
  let { time: latestTime, total: latestTotal, ptr: pointsToReach } = logArray[
    logArray.length - 1
  ];
  if (
    pointsToReach < latestTotal / quarter_duration - 0.3 || // необходимое кол-во очков в минуту чуть меньше текущего тотала
    latestTime >= (quarter_duration - 4) * 60 ||
    latestTime < (quarter_duration - 4 - timeBeforeEnd) * 60
  )
    return;

  let previousTime = latestTime - latency;
  let previousTotals = logArray
    .filter((elem) => elem.time >= previousTime)
    .slice(0, -1)
    .map((elem) => elem.total);

  if (!previousTotals) return;
  let previousMinTotal = Math.min(...previousTotals);
  if (latestTotal - previousMinTotal < latestTotal / quarter_duration) return;
  makeSomeNoise(previousMinTotal, latestTotal, latestTime, pointsToReach);
}

function isEqual(data1, data2) {
  return JSON.stringify(data1) === JSON.stringify(data2);
}

function getOdds() {
  let block =
    document.querySelector('[data-mutable-id=MG2_-2012823853]') ||
    document.querySelector('[data-mutable-id=MG3_552903962]') ||
    document.querySelector('[data-mutable-id=MG4_-1176335519]') ||
    document.querySelector('[data-mutable-id=MG5_1389392296]');
  if (!block) return 0;
  const mutableId = block.dataset.mutableId;
  let totals = block
    .querySelectorAll("tbody")[1]
    .querySelectorAll(".coeff-value");
  let total = +totals[0].textContent.trim().slice(1, -1);
  if (total > maxTotal) maxTotal = total;
  if (total < minTotal) minTotal = total;
  return total;
}

function getData() {
  let resText = document
    .querySelector('.result-row')
    .textContent.trim()
    .split(' ')
    .filter(elem => elem.length > 1);
  let timeArray = resText[resText.length - 1].split(':');
  let timeInSecs = +timeArray[0] * 60 + +timeArray[1]; // время с начала четверти
  let total = getOdds(); // ожидаемый тотал

  let currentPointsString = resText[resText.length - 2];
  if (currentPointsString[currentPointsString.length - 1] === ')') {
    currentPointsString = currentPointsString.slice(0, -1);
  }
  let currentPoints = currentPointsString
    .split(':')
    .reduce((sum, elem) => +sum + +elem);
  let pointsToReach =
    ((total - currentPoints) / (quarter_duration * 60 - timeInSecs)) * 60;

  return {
    time: timeInSecs,
    total: total,
    ptr: pointsToReach,
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

// по дефолту latency = 61, timeBeforeEnd = 2, quarter_duration = 10, sensitivityForLowerThan = 5.5
// latency =
// timeBeforeEnd = 3
// quarter_duration = 12
// sensitivityForLowerThan = 7

setInterval(() => fillLog(getData()), 5000);
