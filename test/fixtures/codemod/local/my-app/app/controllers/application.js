import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    foo(object) {
      Ember.propertyWillChange(object, 'someProperty');
      this.doStuff(object);
      Ember.propertyDidChange(object, 'someProperty');

      object.propertyWillChange('someProperty');
      this.doStuff(object);
      object.propertyDidChange('someProperty');
    }
  }
});
