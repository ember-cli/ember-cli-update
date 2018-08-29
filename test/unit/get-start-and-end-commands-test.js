'use strict';

const { expect } = require('chai');
const getStartAndEndCommands = require('../../src/get-start-and-end-commands');

describe('Unit - getStartAndEndCommands', function() {
  it('throws for glimmer apps', function() {
    expect(() => getStartAndEndCommands({
      projectType: 'glimmer'
    })).to.throw('cannot checkout older versions of glimmer blueprint');
  });
});
