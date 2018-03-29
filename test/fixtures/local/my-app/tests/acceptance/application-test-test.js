import { test } from 'qunit';
import moduleForAcceptance from 'my-app/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | application test');

test('visiting /application-test', function(assert) {
  visit('/application-test');

  andThen(function() {
    assert.equal(currentURL(), '/application-test');
  });
});
