import Ember from 'ember';
import ChildMixin from 'ember-composability-tools/mixins/child';
const { Component } = Ember;

export default Component.extend(ChildMixin, {
  didInsertParent() {
    this._super(...arguments);
    console.log('didInsertParent - child');
  },

  willDestroyParent() {
    this._super(...arguments);
    console.log('willDestroyParent - child');
  }
});
