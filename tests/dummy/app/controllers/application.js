import Ember from 'ember';
const { Controller } = Ember;

export default Controller.extend({
  show: true,
  showChild: true,
  showParentChild: true,
  actions: {
    toggle(prop) {
      this.toggleProperty(prop);
    }
  }
});
