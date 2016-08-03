const _ = require('lodash');
const actions = require('mankov/action-creators');

const cards = require('./cah-base');

// all times are in seconds
const JOINING_WAIT_TIME = 45;
const ROUND_MAX_TIME = 60;


module.exports = class CAHGame {
  constructor(core, botName, groupId) {
    this._core = core;
    this._botName = botName;
    this._groupId = groupId;

    this._players = [];

    setTimeout(this.startRound, JOINING_WAIT_TIME * 1000);
  }


  get groupId() {
    return this._groupId;
  }


  addPlayer(userId, callName) {
    this._players.push({ userId, callName });
    return actions.sendMessage(
      'Tervetuloa peliin - aloitamme kohta!',
      { target: userId }
    );
  }

  startRound() {
    // IMPLEMENT
  }

  getRandomBlackCard() {
    const cardsMaxIndex = cards.blackCards.length - 1;
    const randomIndex = _.random(cardsMaxIndex);

    return cards.blackCards[randomIndex];
  }

  getRandomWhiteCards(count) {
    count = count || 5;

    const cardMaxIndex = cards.whiteCards.length - 1;

    return _.times(count, () =>
      // TODO: we could get same card here twice
      cards.whiteCards[_.random(cardMaxIndex)]
    );
  }


  _sendMessage(message, targetId) {
    this._core.executeActions(actions.sendMessage(
      message,
      {
        target: targetId || this._groupId,
        toBot: this._botName
      }
    ));
  }
};

