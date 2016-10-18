import Ember from 'ember';
import ParentMixin from 'ember-composability-tools/mixins/parent';
import { module, test } from 'qunit';

module('Unit | Mixin | parent');

// Replace this with your real tests.
test('it works', function(assert) {
  let ParentObject = Ember.Object.extend(ParentMixin);
  let subject = ParentObject.create();
  assert.ok(subject);
});
