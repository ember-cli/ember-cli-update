import Ember from 'ember';
import { merge } from '@ember/polyfills';

export default Ember.Controller.extend({
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
      var a = { first: 'Yehuda' };
      var b = { last: 'Katz' };
      merge(a, b); // a == { first: 'Yehuda', last: 'Katz' }, b == { last: 'Katz' }
    }
  }
});
