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
    `Integration | Component | willDestroyParent hook runs in the correct order (${
      async ? 'async' : 'sync'
    })`,
    function (hooks) {
      setupRenderingTest(hooks);

      hooks.beforeEach(function (assert) {
        this.parentSpy = async function (element) {
          if (async) {
            await sleep(100);
          }
          assert.step('parent');
          assert.deepEqual(
            element.tagName,
            'DIV',
            'element was passed in for the parent hook',
          );
        };
        this.childSpy = async function () {
          if (async) {
            await sleep(500);
          }
          assert.step('child');
        };
        this.childParentSpy = async function () {
          if (async) {
            await sleep(300);
          }
          assert.step('child-parent');
        };
        this.nestedChildSpy = async function () {
          if (async) {
            await sleep(500);
          }
          assert.step('nested-child');
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

        await settled();

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
                    <Node @willDestroyParent={{this.nestedChildSpy}}/>
                  {{/if}}
                  <Node @willDestroyParent={{this.nestedChildSpy}}/>
                </Node>
              {{/if}}
            </Root>
          {{/if}}
        `);

        this.set('showChild', false);
        await settled();

        assert.verifySteps(['nested-child']);

        this.set('showChild', true);
        this.set('showParentChild', false);
        await settled();

        assert.verifySteps(['nested-child', 'nested-child', 'child-parent']);

        this.set('showChild', true);
        this.set('showParentChild', true);
        this.set('show', false);
        await settled();

        assert.verifySteps([
          'child',
          'child',
          'nested-child',
          'nested-child',
          'child-parent',
          'parent',
        ]);
      });
    },
  );
}
