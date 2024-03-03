import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module(
  'Integration | Component | willDestroyParent hook runs in the correct order',
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
      this.show = true;

      await render(hbs`
        {{#if this.show}}
          <Root @willDestroyParent={{this.parentSpy}} as |Node|>
            <Node @willDestroyParent={{this.childSpy}}/>
            <Node @willDestroyParent={{this.childSpy}}/>
          </Root>
        {{/if}}
      `);

      this.set('show', false);

      assert.verifySteps(['child', 'child', 'parent']);
    });

    test('top-level parent and two children after if', async function (assert) {
      this.showChild = this.showParentChild = this.show = true;

      await render(hbs`
        {{#if this.show}}
          <Root @willDestroyParent={{this.parentSpy}} as |Node|>
            <Node @willDestroyParent={{this.childSpy}}/>
            <Node @willDestroyParent={{this.childSpy}}/>
            {{#if this.showParentChild}}
              <Node @willDestroyParent={{this.childParentSpy}} as |Node|>
                {{#if this.showChild}}
                  <Node @willDestroyParent={{this.childSpy}}/>
                {{/if}}
                <Node @willDestroyParent={{this.childSpy}}/>
              </Node>
            {{/if}}
          </Root>
        {{/if}}
      `);

      this.set('showChild', false);

      assert.verifySteps(['child']);

      this.set('showChild', true);
      this.set('showParentChild', false);

      assert.verifySteps(['child', 'child', 'child-parent']);

      this.set('showChild', true);
      this.set('showParentChild', true);
      this.set('show', false);

      assert.verifySteps([
        'child',
        'child',
        'child',
        'child',
        'child-parent',
        'parent',
      ]);
    });
  },
);
