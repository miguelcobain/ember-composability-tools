import Ember from 'ember';
import ParentMixin from 'ember-composability-tools/mixins/parent';
const { Component } = Ember;

export default Component.extend(ParentMixin, {
  didInsertParent() {
    console.log('didInsertParent - parent');
  },

  willDestroyParent() {
    console.log('willDestroyParent - parent');
  }
});
