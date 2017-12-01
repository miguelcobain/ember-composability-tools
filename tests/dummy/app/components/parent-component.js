import Component from '@ember/component';
import ParentMixin from 'ember-composability-tools/mixins/parent';

export default Component.extend(ParentMixin, {
  didInsertParent() {
    this._super(...arguments);
    console.log('didInsertParent - parent'); // eslint-disable-line
  },

  willDestroyParent() {
    this._super(...arguments);
    console.log('willDestroyParent - parent'); // eslint-disable-line
  }
});
