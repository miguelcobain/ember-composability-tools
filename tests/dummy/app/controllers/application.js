import Controller from '@ember/controller';

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
