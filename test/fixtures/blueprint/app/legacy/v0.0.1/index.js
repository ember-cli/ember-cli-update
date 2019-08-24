'use strict';

module.exports = {
  name: require('./package').name,

  locals(options) {
    return {
      name: options.entity.name,
      customOption: options.customOption
    };
  }
};
