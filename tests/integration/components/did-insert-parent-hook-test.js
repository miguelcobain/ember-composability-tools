import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module(
  'Integration | Component | didInsertParent hook runs in the correct order',
  function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function (assert) {
      this.parentSpy = function () {
        assert.step('parent');
      };
      this.childSpy = function () {
        assert.step('child');
      };
      this.childParentSpy = function () {
        assert.step('child-parent');
      };
    });

    test('top-level parent and two children', async function (assert) {
      await render(hbs`
        <Root @didInsertParent={{this.parentSpy}} as |Node|>
          <Node @didInsertParent={{this.childSpy}}/>
          <Node @didInsertParent={{this.childSpy}}/>
        </Root>
      `);

      assert.verifySteps(['parent', 'child', 'child']);
    });

    test('top-level parent and two children after if', async function (assert) {
      this.show = false;

      await render(hbs`
        <Root @didInsertParent={{this.parentSpy}} as |Node|>
          {{#if this.show}}
            <Node @didInsertParent={{this.childSpy}}/>
            <Node @didInsertParent={{this.childSpy}}/>
          {{/if}}
        </Root>
      `);

      assert.verifySteps(['parent']);

      this.set('show', true);

      assert.verifySteps(['child', 'child']);
    });

    test('top-level parent and two children-parents', async function (assert) {
      await render(hbs`
        <Root @didInsertParent={{this.parentSpy}} as |NodeA|>
          <NodeA @didInsertParent={{this.childParentSpy}} as |NodeB|>
            <NodeB @didInsertParent={{this.childSpy}}/>
            <NodeB @didInsertParent={{this.childSpy}}/>
          </NodeA>
        </Root>
      `);

      assert.verifySteps(['parent', 'child-parent', 'child', 'child']);
    });

    test('top-level parent and two children-parents after if', async function (assert) {
      this.show = false;

      await render(hbs`
        <Root @didInsertParent={{this.parentSpy}} as |NodeA|>
          {{#if this.show}}
            <NodeA @didInsertParent={{this.childParentSpy}} as |NodeB|>
              <NodeB @didInsertParent={{this.childSpy}}/>
              <NodeB @didInsertParent={{this.childSpy}}/>
            </NodeA>
          {{/if}}
        </Root>
      `);

      assert.verifySteps(['parent']);

      this.set('show', true);

      assert.verifySteps(['child-parent', 'child', 'child']);
    });
  },
);
