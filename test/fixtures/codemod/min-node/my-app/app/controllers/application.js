import Controller from "@ember/controller";
import Ember from "ember";
import { assign } from "@ember/polyfills";

export default Controller.extend({
  actions: {
    foo(object) {
      this.doStuff(object);
      Ember.notifyPropertyChange(object, "someProperty");

      this.doStuff(object);
      object.notifyPropertyChange("someProperty");
    },

    bar() {
      var a = { first: "Yehuda" };
      var b = { last: "Katz" };
      assign(a, b); // a == { first: 'Yehuda', last: 'Katz' }, b == { last: 'Katz' }
    }
  }
});
