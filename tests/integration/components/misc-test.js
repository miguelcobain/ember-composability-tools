import Component from '@ember/component';
import EObject, { computed } from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { ParentMixin, ChildMixin } from 'ember-composability-tools';

module('Integration | Component | misc', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    let parentComponent = Component.extend(ParentMixin, {});
    this.owner.register('component:parent-component', parentComponent);

    let childComponent = Component.extend(ChildMixin, {});
    this.owner.register('component:child-component', childComponent);
  });

  test('parent component without hooks doesn\'t error', async function(assert) {

    await render(hbs`
      {{#parent-component}}
        <p>Block content</p>
      {{/parent-component}}
    `);

    assert.ok(true);
  });

  test('child component without hooks doesn\'t error', async function(assert) {

    await render(hbs`
      {{#parent-component}}
        {{#child-component}}
          <p>Block content</p>
        {{/child-component}}
      {{/parent-component}}
    `);

    assert.ok(true);
  });

  test('child component with `shouldRegister=false` doesn\'t register to parent', async function(assert) {
    let parentSpy = this.parentSpy = sinon.spy();
    let childSpy = this.childSpy = sinon.spy();

    await render(hbs`
      {{#parent-component didInsertParent=parentSpy}}
        {{child-component shouldRegister=false didInsertParent=childSpy}}
        {{child-component shouldRegister=true didInsertParent=childSpy}}
      {{/parent-component}}
    `);

    assert.ok(parentSpy.calledOnce, 'parent didInsertParent was called once');
    assert.ok(childSpy.calledOnce, 'child didInsertParent was called once');
    assert.ok(parentSpy.calledBefore(childSpy), 'parent was called before child');
  });

  test('init super is called only once per mixin', function(assert) {
    let customizedObject = EObject.extend({
      init() {
        this._super(...arguments);
        let timesCalled = this.get('timesCalled');
        this.set('timesCalled', timesCalled + 1);
      },
      timesCalled: computed(function() {
        return 0;
      })
    });
    let parentObject = customizedObject.extend(ParentMixin, { });
    let childObject = customizedObject.extend(ChildMixin, {
      parentComponent: null,
      registerWithParent() {}
    });
    let parentInstance = parentObject.create();
    let childInstance = childObject.create();

    assert.equal(parentInstance.get('timesCalled'), 1, 'Should call parent init super wrapper only once');
    assert.equal(childInstance.get('timesCalled'), 1, 'Should call child init super wrapper only once');
  });
});
