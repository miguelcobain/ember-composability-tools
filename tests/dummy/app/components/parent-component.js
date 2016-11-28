import Ember from 'ember';
import ParentMixin from 'ember-composability-tools/mixins/parent';
const { Component } = Ember;

export default Component.extend(ParentMixin, {
  didInsertParent() {
    this._super(...arguments);
    console.log('didInsertParent - parent');
  },

  willDestroyParent() {
    this._super(...arguments);
    console.log('willDestroyParent - parent');
  }
});
