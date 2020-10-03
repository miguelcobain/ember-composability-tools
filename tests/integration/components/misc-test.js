import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | misc', function(hooks) {
  setupRenderingTest(hooks);

  test('root component without hooks doesn\'t error', async function(assert) {

    await render(hbs`
      <Root>
        <p>Block content</p>
      </Root>
    `);

    assert.ok(true);
  });

  test('node component without hooks doesn\'t error', async function(assert) {

    await render(hbs`
      <Root as |Node|>
        <Node>
          <p>Block content</p>
        </Node>
      </Root>
    `);

    assert.ok(true);
  });
});
