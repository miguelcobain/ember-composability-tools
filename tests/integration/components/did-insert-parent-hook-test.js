import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

module('Integration | Component | didInsertParent hook runs in the correct order', function(hooks) {
  setupRenderingTest(hooks);

  test('top-level parent and two children', async function(assert) {
    let parentSpy = this.parentSpy = sinon.spy();
    let childSpy = this.childSpy = sinon.spy();

    await render(hbs`
      {{#parent-component didInsertParent=parentSpy}}
        {{child-component didInsertParent=childSpy}}
        {{child-component didInsertParent=childSpy}}
      {{/parent-component}}
    `);

    assert.ok(parentSpy.calledOnce, 'parent didInsertParent was called once');
    assert.ok(childSpy.calledTwice, 'child didInsertParent was called twice');
    assert.ok(parentSpy.calledBefore(childSpy), 'parent was called before child');
  });

  test('top-level parent and two children after if', async function(assert) {
    let parentSpy = this.parentSpy = sinon.spy();
    let childSpy = this.childSpy = sinon.spy();
    this.show = false;

    await render(hbs`
      {{#parent-component didInsertParent=parentSpy}}
        {{#if show}}
          {{child-component didInsertParent=childSpy}}
          {{child-component didInsertParent=childSpy}}
        {{/if}}
      {{/parent-component}}
    `);

    assert.ok(parentSpy.calledOnce, 'parent didInsertParent was called once');
    assert.notOk(childSpy.called, 'child didInsertParent was never called');

    this.set('show', true);

    assert.ok(parentSpy.calledOnce, 'parent didInsertParent was called once');
    assert.ok(childSpy.calledTwice, 'child didInsertParent was called twice');
    assert.ok(parentSpy.calledBefore(childSpy), 'parent was called before child');
  });

  test('top-level parent and two children-parents', async function(assert) {
    let parentSpy = this.parentSpy = sinon.spy();
    let childSpy = this.childSpy = sinon.spy();
    let childParentSpy = this.childParentSpy = sinon.spy();

    await render(hbs`
      {{#parent-component didInsertParent=parentSpy}}
        {{#child-parent-component didInsertParent=childParentSpy}}
          {{child-component didInsertParent=childSpy}}
          {{child-component didInsertParent=childSpy}}
        {{/child-parent-component}}
      {{/parent-component}}
    `);

    assert.ok(parentSpy.calledOnce, 'parent didInsertParent was called once');
    assert.ok(childParentSpy.calledOnce, 'child-parent didInsertParent was called once');
    assert.ok(childSpy.calledTwice, 'child didInsertParent was called twice');
    assert.ok(parentSpy.calledBefore(childParentSpy), 'parent was called before child-parent');
    assert.ok(childParentSpy.calledBefore(childSpy), 'child-parent was called before child');
    assert.ok(parentSpy.calledBefore(childSpy), 'parent was called before child');
  });

  test('top-level parent and two children-parents after if', async function(assert) {
    let parentSpy = this.parentSpy = sinon.spy();
    let childSpy = this.childSpy = sinon.spy();
    let childParentSpy = this.childParentSpy = sinon.spy();
    this.show = false;

    await render(hbs`
      {{#parent-component didInsertParent=parentSpy}}
        {{#if show}}
          {{#child-parent-component id="cp" didInsertParent=childParentSpy}}
            {{child-component didInsertParent=childSpy}}
            {{child-component didInsertParent=childSpy}}
          {{/child-parent-component}}
        {{/if}}
      {{/parent-component}}
    `);

    assert.ok(parentSpy.calledOnce, 'parent didInsertParent was called once');
    assert.notOk(childParentSpy.called, 'child-parent didInsertParent was never called');
    assert.notOk(childSpy.called, 'child didInsertParent was never called');

    this.set('show', true);

    assert.ok(parentSpy.calledOnce, 'parent didInsertParent was called once');
    assert.ok(childParentSpy.calledOnce, 'child-parent didInsertParent was called once');
    assert.ok(childSpy.calledTwice, 'child didInsertParent was called twice');
    assert.ok(parentSpy.calledBefore(childParentSpy), 'parent was called before child-parent');
    assert.ok(childParentSpy.calledBefore(childSpy), 'child-parent was called before child');
    assert.ok(parentSpy.calledBefore(childSpy), 'parent was called before child');
  });

  test('adding a child to an an already-setup parent', async function(assert) {
    /* eslint-disable no-console */
    let parentSpy = this.parentSpy = sinon.spy();
    let childSpy = this.childSpy = sinon.spy(function() { console.log('didInsertParent - child'); });

    /* We're spying on willRender as a proxy for didInsertElement here, because if
    * we replaced didInsertElement with a test spy, it wouldn't be able to call
    * _super and would break the chain.
    *
    * The important thing is that we aren't calling didInsertParent before the
    * child's element has been initialized. */
    let childWillRenderSpy = this.childWillRenderSpy = sinon.spy(function() { console.log('willRender - child'); });
    /* eslint-enable no-console */

    this.show = false;

    await this.render(hbs`
      {{#parent-component didInsertParent=parentSpy}}
        {{#if show}}
          {{child-component didInsertParent=childSpy willRender=childWillRenderSpy}}
        {{/if}}
      {{/parent-component}}
   `);

    assert.ok(parentSpy.calledOnce, 'parent didInsertParent was called once');
    assert.notOk(childSpy.called, 'child didInsertParent was never called');
    assert.notOk(childWillRenderSpy.called, 'child willRender was never called');

    this.set('show', true);

    assert.ok(parentSpy.calledOnce, 'parent didInsertParent was called once');
    assert.ok(childSpy.calledOnce, 'child didInsertParent was called once');
    assert.ok(childWillRenderSpy.calledOnce, 'child willRender was called once');
    assert.ok(parentSpy.calledBefore(childSpy), 'parent was called before child');
    assert.ok(childWillRenderSpy.calledBefore(childSpy), 'child willRender was called before child didInsertParent');
  });
});
