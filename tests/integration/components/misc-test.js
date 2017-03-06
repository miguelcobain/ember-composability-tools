import Ember from 'ember';
import { moduleForComponent } from 'ember-qunit';
import test from 'ember-sinon-qunit/test-support/test';
import hbs from 'htmlbars-inline-precompile';
import { ParentMixin, ChildMixin } from 'ember-composability-tools';

const { Component, computed, get, set } = Ember;

moduleForComponent('misc', 'Integration | Component | misc', {
  integration: true,
  beforeEach() {
    let parentComponent = Component.extend(ParentMixin, {});
    this.register('component:parent-component', parentComponent);

    let childComponent = Component.extend(ChildMixin, {});
    this.register('component:child-component', childComponent);
  }
});

test('parent component without hooks doesn\'t error', function(assert) {

  this.render(hbs`
    {{#parent-component}}
      <p>Block content</p>
    {{/parent-component}}
  `);

  assert.ok(true);
});

test('child component without hooks doesn\'t error', function(assert) {

  this.render(hbs`
    {{#parent-component}}
      {{#child-component}}
        <p>Block content</p>
      {{/child-component}}
    {{/parent-component}}
  `);

  assert.ok(true);
});

test('child component with `shouldRegister=false` doesn\'t register to parent', function(assert) {
  let parentSpy = this.parentSpy = this.spy();
  let childSpy = this.childSpy = this.spy();

  this.render(hbs`
    {{#parent-component didInsertParent=parentSpy}}
      {{child-component shouldRegister=false didInsertParent=childSpy}}
      {{child-component shouldRegister=true didInsertParent=childSpy}}
    {{/parent-component}}
  `);

  assert.ok(parentSpy.calledOnce, 'parent didInsertParent was called once');
  assert.ok(childSpy.calledOnce, 'child didInsertParent was called once');
  assert.ok(parentSpy.calledBefore(childSpy), 'parent was called before child');
});

moduleForComponent('misc', 'Integration | Component | misc init', {
  integration: true
});

test('init super is called only once per mixin', function(assert) {
  const customizedObject = Ember.Object.extend({
    init() {
      const timesCalled = get(this, 'timesCalled');
      set(this, 'timesCalled', timesCalled + 1);
    },
    timesCalled: computed({
      get() {
        return 0;
      }
    })
  });
  const parentObject = customizedObject.extend(ParentMixin, { });
  const childObject = customizedObject.extend(ChildMixin, {
    parentComponent: null,
    registerWithParent() {}
  });
  const parentInstance = parentObject.create();
  const childInstance = childObject.create();

  assert.equal(get(parentInstance, 'timesCalled'), 1, 'Should call parent init super wrapper only once');
  assert.equal(get(childInstance, 'timesCalled'), 1, 'Should call child init super wrapper only once');
});