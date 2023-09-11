import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

module(
  'Integration | Component | willDestroyParent hook runs in the correct order',
  function (hooks) {
    setupRenderingTest(hooks);

    test('top-level parent and two children', async function (assert) {
      let parentSpy = (this.parentSpy = sinon.spy());
      let childSpy = (this.childSpy = sinon.spy());
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

      assert.ok(
        parentSpy.calledOnce,
        'parent willDestroyParent was called once',
      );
      assert.ok(
        childSpy.calledTwice,
        'child willDestroyParent was called twice',
      );
      assert.ok(
        childSpy.calledBefore(parentSpy),
        'child was called before parent',
      );
    });

    test('top-level parent and two children after if', async function (assert) {
      let parentSpy = (this.parentSpy = sinon.spy());
      let childSpy = (this.childSpy = sinon.spy());
      let childParentSpy = (this.childParentSpy = sinon.spy());
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

      assert.notOk(
        parentSpy.called,
        'parent willDestroyParent was never called',
      );
      assert.notOk(
        childParentSpy.called,
        'child-parent willDestroyParent was never called',
      );
      assert.ok(childSpy.calledOnce, 'child willDestroyParent was called once');

      childSpy.resetHistory();
      this.set('showChild', true);
      this.set('showParentChild', false);

      assert.notOk(
        parentSpy.called,
        'parent willDestroyParent was never called',
      );
      assert.ok(
        childParentSpy.calledOnce,
        'child-parent willDestroyParent was called once',
      );
      assert.ok(
        childSpy.calledTwice,
        'child willDestroyParent was called twice',
      );
      assert.ok(
        childSpy.calledBefore(childParentSpy),
        'child was called before child-parent',
      );

      childSpy.resetHistory();
      childParentSpy.resetHistory();
      this.set('showChild', true);
      this.set('showParentChild', true);
      this.set('show', false);

      assert.ok(
        parentSpy.calledOnce,
        'parent willDestroyParent was called once',
      );
      assert.ok(
        childParentSpy.calledOnce,
        'child-parent willDestroyParent was called once',
      );
      assert.strictEqual(
        childSpy.callCount,
        4,
        'child willDestroyParent was called 4 times',
      );
      assert.ok(
        childSpy.calledBefore(childParentSpy),
        'child was called before child-parent',
      );
      assert.ok(
        childParentSpy.calledBefore(parentSpy),
        'child-parent was called before parent',
      );
    });
  },
);
