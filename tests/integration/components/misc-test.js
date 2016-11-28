import Ember from 'ember';
import { moduleForComponent } from 'ember-qunit';
import test from 'ember-sinon-qunit/test-support/test';
import hbs from 'htmlbars-inline-precompile';
import { ParentMixin, ChildMixin } from 'ember-composability-tools';

const { Component } = Ember;

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
