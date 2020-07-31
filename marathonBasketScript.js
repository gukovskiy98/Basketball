// ! чувствительность в два раза выше, чем ожидаемое количество очков в минуту (тотал на следующую четверть/10 или 12, в зависимости от лиги)
// data-mutable-id: MG2_-1350604717 - тотал 1 четверть , MG3_1215123098 - 2 четверть, MG4_-514116383 - 3 четверть, MG5_2051611432 - 4 четверть

const audio = `<audio id="mybeep" src="https://www.soundjay.com/button/beep-07.mp3" preload="auto"></audio>`;
document.body.insertAdjacentHTML("beforeend", audio);
const audioNode = document.getElementById("mybeep");
let sensitivity = 6;
let quarter_duration = 10;

function getData() {
  let resText = document
    .querySelector(".result-row")
    .textContent.trim()
    .split(" ")
    .filter((elem) => elem.length > 1);
  let timeArray = resText[resText.length - 1].split(":");
  let timeInSecs = +timeArray[0] * 60 + +timeArray[1]; // время с начала четверти в секундах
  let points = resText[0].split(":").reduce((sum, elem) => +sum + +elem); // Сумма очков
  return {
    time: timeInSecs,
    points: points,
  };
}

const log = [];

function isEqual(data1, data2) {
  return JSON.stringify(data1) === JSON.stringify(data2);
}

function getOdds() {
  let block =
    document.querySelector("[data-mutable-id=MG2_-1350604717]") ||
    document.querySelector("[data-mutable-id=MG3_1215123098]") ||
    document.querySelector("[data-mutable-id=MG4_-514116383]") ||
    document.querySelector("[data-mutable-id=MG5_2051611432]");
  if (!block) return;
  let coefs = block
    .querySelectorAll("tbody")[1]
    .querySelectorAll(".coeff-value");
  let coefBlock = coefs[coefs.length - 2];

  // ! Автоставка
  // let btn = coefBlock.nextElementSibling.firstElementChild;
  // btn.dispatchEvent(new Event("click", { bubbles: true }));

  let message = `Рекомендуемая ставка Т.М. ${coefBlock.textContent.trim()}`;
  // ! Алерт убрать при автоставке
  // alert(message);
  audioNode.play();
  console.log(message);
}

function checkForPattern(logArray) {
  let { time: latestTime, points: latestPoints } = logArray[
    logArray.length - 1
  ];
  if (latestTime >= (quarter_duration - 4) * 60) return;

  let previousTime = latestTime - 60;
  let tempSave;
  for (let current of logArray) {
    if (current.time >= previousTime) {
      tempSave = current;
      break;
    }
  }
  if (!tempSave) return;
  let diff = latestPoints - tempSave.points;
  console.log(`---`);
  console.log("checking");
  console.log(`prevTime: ${tempSave.time} prevPoints: ${tempSave.points}`);
  console.log(`curTime: ${latestTime} curPoints: ${latestPoints}`);
  console.log(`---`);
  if (diff < sensitivity) return;
  getOdds();
  let message = `Diff: ${diff}. Minute ago: ${tempSave.points}, now: ${latestPoints}`;
  // alert(message);
  console.log(message);
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
  if (log.length === 15) {
    log.shift();
  }
  log.push(data);
  checkForPattern(log);
}

setInterval(() => fillLog(getData()), 5000);
// по дефолту sensitivity = 6, quarter_duration = 10
// sensitivity =
// quarter_duration =
// ставить на четвертую четверть только при явном фаворите
