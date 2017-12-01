import Component from '@ember/component';
import ChildMixin from 'ember-composability-tools/mixins/child';

export default Component.extend(ChildMixin, {
  didInsertParent() {
    this._super(...arguments);
    console.log('didInsertParent - child'); // eslint-disable-line
  },

  willDestroyParent() {
    this._super(...arguments);
    console.log('willDestroyParent - child'); // eslint-disable-line
  }
});
