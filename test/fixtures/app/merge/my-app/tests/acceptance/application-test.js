import { test } from 'qunit';
import moduleForAcceptance from 'my-app/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | application');

test('visiting /application', function(assert) {
  visit('/application');

  andThen(function() {
    assert.equal(currentURL(), '/application');
  });
});
