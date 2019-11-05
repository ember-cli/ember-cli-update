import { on } from '@ember/object/evented';
import Controller from '@ember/controller';
import Ember from 'ember';
import { assign } from '@ember/polyfills';
import { map } from '@ember/object/computed';

export default Controller.extend({
  fullName: computed('firstName', 'lastName', function() {
    return `${this.firstName} ${this.lastName}`;
  }),

  get fullName2() {
    return `${this.firstName} ${this.lastName}`;
  },

  friendNames: map('friends', ['nameKey'], function(friend) {
    return friend[this.nameKey];
  }),

  logCompleted: on('completed', function() {
    console.log('Job completed!');
  }),

  actions: {
    foo(object) {
      this.doStuff(object);
      Ember.notifyPropertyChange(object, 'someProperty');

      this.doStuff(object);
      object.notifyPropertyChange('someProperty');
    },

    bar() {
      let a = { first: 'Yehuda' };
      let b = { last: 'Katz' };
      assign(a, b);
    }
  }
});
