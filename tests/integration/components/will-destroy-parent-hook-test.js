import { moduleForComponent } from 'ember-qunit';
import test from 'ember-sinon-qunit/test-support/test';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('will-destroy-parent-hook', 'Integration | Component | willDestroyParent hook runs in the correct order', {
  integration: true
});

test('top-level parent and two children', function(assert) {
  let parentSpy = this.parentSpy = this.spy();
  let childSpy = this.childSpy = this.spy();
  this.show = true;

  this.render(hbs`
    {{#if show}}
      {{#parent-component willDestroyParent=parentSpy}}
        {{child-component willDestroyParent=childSpy}}
        {{child-component willDestroyParent=childSpy}}
      {{/parent-component}}
    {{/if}}
  `);

  this.set('show', false);

  assert.ok(parentSpy.calledOnce, 'parent willDestroyParent was called once');
  assert.ok(childSpy.calledTwice, 'child willDestroyParent was called twice');
  assert.ok(childSpy.calledBefore(parentSpy), 'child was called before parent');
});

test('top-level parent and two children after if', function(assert) {
  let parentSpy = this.parentSpy = this.spy();
  let childSpy = this.childSpy = this.spy();
  let childParentSpy = this.childParentSpy = this.spy();
  this.showChild = this.showParentChild = this.show = true;

  this.render(hbs`
    {{#if show}}
      {{#parent-component willDestroyParent=parentSpy}}
        {{child-component willDestroyParent=childSpy}}
        {{child-component willDestroyParent=childSpy}}
        {{#if showParentChild}}
          {{#child-parent-component willDestroyParent=childParentSpy}}
            {{#if showChild}}
              {{child-component willDestroyParent=childSpy}}
            {{/if}}
            {{child-component willDestroyParent=childSpy}}
          {{/child-parent-component}}
        {{/if}}
      {{/parent-component}}
    {{/if}}
  `);

  this.set('showChild', false);

  assert.notOk(parentSpy.called, 'parent willDestroyParent was never called');
  assert.notOk(childParentSpy.called, 'child-parent willDestroyParent was never called');
  assert.ok(childSpy.calledOnce, 'child willDestroyParent was called twice');

  childSpy.reset();
  this.set('showChild', true);
  this.set('showParentChild', false);

  assert.notOk(parentSpy.called, 'parent willDestroyParent was never called');
  assert.ok(childParentSpy.calledOnce, 'child-parent willDestroyParent was called once');
  assert.ok(childSpy.calledTwice, 'child willDestroyParent was called twice');
  assert.ok(childSpy.calledBefore(childParentSpy), 'child was called before child-parent');

  childSpy.reset();
  childParentSpy.reset();
  this.set('showChild', true);
  this.set('showParentChild', true);
  this.set('show', false);

  assert.ok(parentSpy.calledOnce, 'parent willDestroyParent was called once');
  assert.ok(childParentSpy.calledOnce, 'child-parent willDestroyParent was called once');
  assert.equal(childSpy.callCount, 4, 'child willDestroyParent was called 4 times');
  assert.ok(childSpy.calledBefore(childParentSpy), 'child was called before child-parent');
  assert.ok(childParentSpy.calledBefore(parentSpy), 'child-parent was called before parent');
});