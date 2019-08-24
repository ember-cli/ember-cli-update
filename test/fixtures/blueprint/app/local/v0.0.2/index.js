'use strict';

module.exports = {
  name: require('./package').name,

  locals(options) {
    return {
      name: options.entity.name,
      blueprintName: this.name,
      blueprintVersion: require('./package').version,
      suppliedOption: options.suppliedOption,
      unsuppliedOption: options.unsuppliedOption || 'bar'
    };
  }
};
