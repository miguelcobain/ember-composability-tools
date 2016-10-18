import Ember from 'ember';
import ChildMixin from 'ember-composability-tools/mixins/child';
import ParentMixin from 'ember-composability-tools/mixins/parent';
const { Component } = Ember;

export default Component.extend(ChildMixin, ParentMixin, {
  didInsertParent() {
    this._super(...arguments);
    console.log('didInsertParent - child-parent', this.get('name'));
  },

  willDestroyParent() {
    this._super(...arguments);
    console.log('willDestroyParent - child-parent', this.get('name'));
  }
});
