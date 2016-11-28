import { moduleForComponent } from 'ember-qunit';
import test from 'ember-sinon-qunit/test-support/test';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('did-insert-parent-hook', 'Integration | Component | didInsertParent hook runs in the correct order', {
  integration: true
});

test('top-level parent and two children', function(assert) {
  let parentSpy = this.parentSpy = this.spy();
  let childSpy = this.childSpy = this.spy();

  this.render(hbs`
    {{#parent-component didInsertParent=parentSpy}}
      {{child-component didInsertParent=childSpy}}
      {{child-component didInsertParent=childSpy}}
    {{/parent-component}}
  `);

  assert.ok(parentSpy.calledOnce, 'parent didInsertParent was called once');
  assert.ok(childSpy.calledTwice, 'child didInsertParent was called twice');
  assert.ok(parentSpy.calledBefore(childSpy), 'parent was called before child');
});

test('top-level parent and two children after if', function(assert) {
  let parentSpy = this.parentSpy = this.spy();
  let childSpy = this.childSpy = this.spy();
  this.show = false;

  this.render(hbs`
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

test('top-level parent and two children-parents', function(assert) {
  let parentSpy = this.parentSpy = this.spy();
  let childSpy = this.childSpy = this.spy();
  let childParentSpy = this.childParentSpy = this.spy();

  this.render(hbs`
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

test('top-level parent and two children-parents after if', function(assert) {
  let parentSpy = this.parentSpy = this.spy();
  let childSpy = this.childSpy = this.spy();
  let childParentSpy = this.childParentSpy = this.spy();
  this.show = false;

  this.render(hbs`
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