import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL,
  test: Ember.computed.alias('rootURL')
});

Router.map(function() {
});

export default Router;
