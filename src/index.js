// # IltaaCommander - example commander
//
const Promise = require('bluebird');
const _ = require('lodash');
const actions = require('mankov/action-creators');

const log = require('./logger')(__filename);
const Game = require('./game');


module.exports = class CAHCommander {

  constructor(core) {
    this._core = core;

    this._games = [];
  }

  getGame(groupId) {
    return _.find(this._games, i => i.groupId === groupId);
  }

  // # getBidForEvent
  // returns "bid" for event, intenting is this commander
  // willing to handle this event or not.
  //
  // Must always return a Promise.
  getBidForEvent(event) {
    if (event.text.indexOf('/cah') >= 0) { // TODO better logic
      return Promise.resolve({
        description: 'Käynnistää Cards Against Humanity -pelin',
        commander: this
      });
    } else if (event.text.indexOf('/cahjoin')) {
      return Promise.resolve({
        description: 'Liittyä Cards Against Humanity -pelin',
        commander: this
      });
    } else {
      return Promise.reject();
    }
  }

  handleEvent(event) {
    // Game Start command
    if (event.text.indexOf('/cah') >= 0) { // TODO better logic
      return this._onStartGame(event);
    }
    // Game Join command
    else if (event.text.indexOf('/cahjoin')) {
      return this._onJoinGame(event);
    }
    // Pokemon block
    else {
      log.error('in handleEvent catch-all block, we should never get here!');
      return Promise.resolve();
    }
  }


  _onStartGame(event) {
    // we allow game starting happen only from a group
    if (!event.meta.isFromGroup) {
      return Promise.resolve(actions.sendMessage('Anna komento jossain ryhmäkeskustelussa!'));
    }

    // is there already a game on this channel?
    if (this.getGame(event.meta.chatGroupId)) {
      // Game already exists on this channel.
      return Promise.resolve(actions.sendMessage(
        'Peli on jo käynnissä kanavallasi!',
        { target: event.meta.userId }
      ));
    }

    // -> no game in this group, start a new one

    const actionsArray = [];

    const game = new Game(this._core, event.fromBot, event.meta.chatGroupId);

    actionsArray.push(
      game.addPlayer(event.userId, event.meta.userCallName),
      actions.sendMessage(
        `${event.meta.userCallName} käynnisti pelin! Liity sanomalla /cahjoin !`
      )
    );

    return Promise.resolve(actionsArray);
  }

  _onJoinGame(event) {
    if (!event.meta.isFromGroup) {
      return Promise.resolve(actions.sendMessage('Anna komento jossain ryhmäkeskustelussa!'));
    }

    const game = this.getGame(event.meta.chatGroupId);

    if (game) {
      return Promise.resolve(game.addPlayer(event.userId, event.meta.userCallName));
    } else {
      return this._onStartGame(event);
    }
  }

};
