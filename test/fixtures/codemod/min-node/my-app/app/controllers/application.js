import Controller from '@ember/controller';
import Ember from 'ember';
import { assign } from '@ember/polyfills';

export default Controller.extend({
  fullName: computed('firstName', 'lastName', function() {
    return `${this.firstName} ${this.lastName}`;
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
