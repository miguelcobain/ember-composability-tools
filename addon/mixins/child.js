import Ember from 'ember';
import ParentMixin from './parent';
const { Mixin, computed, assert, K } = Ember;

export default Mixin.create({

  didInsertParent: K,
  willDestroyParent: K,

  // This is intended as an escape hatch, but ideally you would
  // `{{yield` a a child contextual component with `parentComponent=this`
  parentComponent: computed(function() {
    return this.nearestOfType(ParentMixin);
  }),

  didInsertElement() {
    this._super(...arguments);
    this.registerWithParent();
  },

  willDestroyElement() {
    this._super(...arguments);
    this.unregisterWithParent();
  },

  destroySelfAndChildren() {
    this.willDestroyParent();
    this._didInsert = false;
  },

  registerWithParent() {
    let parentComponent = this.get('parentComponent');
    assert(`Tried to use ${this} outside the context of a parent component.`, parentComponent);
    parentComponent.registerChild(this);
  },

  unregisterWithParent() {
    let parentComponent = this.get('parentComponent');
    if (parentComponent) {
      parentComponent.unregisterChild(this);
    }
  }

});
