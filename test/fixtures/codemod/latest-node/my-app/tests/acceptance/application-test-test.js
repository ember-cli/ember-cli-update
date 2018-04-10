import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | application test', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting /application-test', async function(assert) {
    await visit('/application-test');

    assert.equal(currentURL(), '/application-test');
  });
});
