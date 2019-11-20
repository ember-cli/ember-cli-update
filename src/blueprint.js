'use strict';

class Blueprint {
  constructor() {
    this._options = [];
  }

  get options() {
    return this._options;
  }
}

module.exports = Blueprint;
