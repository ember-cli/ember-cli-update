import Ember from 'ember';
import { merge } from '@ember/polyfills';

export default Ember.Controller.extend({
  fullName: computed(function() {
    return `${this.firstName} ${this.lastName}`;
  }).property('firstName', 'lastName'),

  fullName2: computed(function() {
    return `${this.firstName} ${this.lastName}`;
  }).volatile('firstName', 'lastName'),

  friendNames: map('friends', function(friend) {
    return friend[this.nameKey];
  }).property('nameKey'),

  actions: {
    foo(object) {
      Ember.propertyWillChange(object, 'someProperty');
      this.doStuff(object);
      Ember.propertyDidChange(object, 'someProperty');

      object.propertyWillChange('someProperty');
      this.doStuff(object);
      object.propertyDidChange('someProperty');
    },

    bar() {
      let a = { first: 'Yehuda' };
      let b = { last: 'Katz' };
      merge(a, b);
    }
  }
});
