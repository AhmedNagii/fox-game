import { modFox, modScene, togglePoopBag, writeModal } from "./ui";
import {
  RAIN_CHANCE,
  SCENES,
  DAY_LENGTH,
  NIGHT_LENGTH,
  getNextDieTime,
  getNextHungeryTime,
  getNextPoopTime,
} from "./constants"

const gameState = {
  current: "INIT",
  clock: 1,
  //we can use undefined However we are just being consistent with the types since -1 gives same result
  wakeTime: -1,
  sleepTime: -1,
  hungeryTime: -1,
  dieTime: -1,
  timeToStartCelebrating: -1,
  timeToEndCelebrating: -1,
  poopTime: -1,


  tick() {
    this.clock++;
    if (this.clock === this.wakeTime) {
      this.wake()
    } else if (this.clock === this.sleepTime) {
      this.sleep()
    } else if (this.clock === this.hungeryTime) {
      this.hungery()
    } else if (this.clock === this.dieTime) {
      this.die()
    } else if (this.clock === this.timeToStartCelebrating) {
      this.startCelebrating()
    } else if (this.clock === this.timeToEndCelebrating) {
      this.endCelebrating()
    } else if (this.clock === this.poopTime) {
      this.poop()
    }
    return this.clock
  },
  startGame() {
    this.current = "HATCHING"
    this.wakeTime = this.clock + 3
    modFox('egg')
    modScene("day")
    writeModal()
  },
  wake() {
    this.current = "IDLING"
    this.wakeTime = -1
    this.scene = Math.random() > RAIN_CHANCE ? 0 : 1
    modScene(SCENES[this.scene])
    this.sleepTime = this.clock + DAY_LENGTH
    this.hungeryTime = getNextHungeryTime(this.clock)
    this.determineFoxState()
  },



  sleep() {

    this.state = "SLEEP";
    modFox("sleep");
    modScene("night");
    this.clearTimes()
    this.wakeTime = this.clock + NIGHT_LENGTH

  },
  clearTimes() {

    this.dieTime = -1;
    this.wakeTime = -1;
    this.sleepTime = -1;
    this.hungeryTime = -1;
    this.timeToStartCelebrating = -1;
    this.timeToEndCelebrating = -1;
    this.poopTime = -1;
  },
  hungery() {
    this.current = "HUNGRY"
    this.dieTime = getNextDieTime(this.clock)
    this.hungeryTime = -1
    modFox("hungry")
  },

  poop() {

    this.current = "POOPING"
    this.poopTime = -1
    this.dieTime = getNextDieTime(this.clock)
    modFox("pooping")
  },

  die() {
    this.current = "DEAD"
    modScene("dead")
    modFox('dead')
    this.clearTimes()
    writeModal("The fox died :( <br/> Press the middle button to start")
  },


  startCelebrating() {
    this.current = "CELEBRATING"
    modFox('celebrate')
    this.timeToStartCelebrating = -1
    this.timeToEndCelebrating = this.clock + 2
  },
  endCelebrating() {
    this.timeToEndCelebrating = -1
    this.current = "IDLING"
    this.determineFoxState()
    togglePoopBag(false)
  },


  determineFoxState() {
    if (this.current == "IDLING") {
      if (SCENES[this.scene] === "rain") {
        modFox('rain')
      } else {
        modFox('idling')
      }
    }
  },

  handelUserAction(icon) {
    if (["SLEEP", "FEEDING", "CELEBRATING", "HATCHING"].includes(this.current)) {
      return;
    }

    if (this.current === "INIT" || this.current === "DEAD") {
      this.startGame();
      return
    }

    switch (icon) {
      case "weather":
        this.changeWeather();
        break;
      case "poop":
        this.cleanUpPoop();
        break;
      case "fish":
        this.feed()
        break;
    }

  },

  changeWeather() {
    this.scene = (this.scene + 1) % SCENES.length
    modScene(SCENES[this.scene])
    this.determineFoxState()
  },
  cleanUpPoop() {
    if (!this.current === "POOPING") {
      return
    }
    this.dieTime = -1
    togglePoopBag(true)
    this.startCelebrating()
    this.hungeryTime = getNextHungeryTime(this.clock)
  },
  feed() {
    if (this.current !== "HUNGRY") {
      return
    }
    this.current = "FEEDING"
    this.dieTime = -1
    this.poopTime = getNextPoopTime(this.clock)
    modFox('eating')
    this.timeToStartCelebrating = this.clock + 2;
  }
};

// we are binding handelUserAction  to make sure that "this" refers to gameState not to where it will be invoked
export const handelUserAction = gameState.handelUserAction.bind(gameState)
export default gameState;