import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { later } from '@ember/runloop';

function sleep(time) {
  return new Promise((resolve) => later(resolve, time));
}

for (let async of [false, true]) {
  module(
    `Integration | Component | didInsertParent hook runs in the correct order (${
      async ? 'async' : 'sync'
    })`,
    function (hooks) {
      setupRenderingTest(hooks);

      hooks.beforeEach(function (assert) {
        this.parentSpy = async function () {
          if (async) {
            await sleep(500);
          }
          assert.step('parent');
        };
        this.childSpy = async function () {
          if (async) {
            await sleep(100);
          }
          assert.step('child');
        };
        this.childParentSpy = async function () {
          if (async) {
            await sleep(300);
          }
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

        await settled();

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

        await settled();

        assert.verifySteps(['child-parent', 'child', 'child']);
      });
    },
  );
}
