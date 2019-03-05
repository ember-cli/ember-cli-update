import { setupRenderingTest } from '@glimmer/test-helpers';
import hbs from '@glimmer/inline-precompile';

const { module, test } = QUnit;

module('Component: my-app', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await this.render(hbs`<my-app />`);
    assert.equal(this.containerElement.textContent, 'Welcome to Glimmer!\n');
  });
});
