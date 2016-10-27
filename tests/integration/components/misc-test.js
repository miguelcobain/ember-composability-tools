import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
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
