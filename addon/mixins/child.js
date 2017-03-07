import Ember from 'ember';
import ParentMixin from './parent';
const { Mixin, computed, assert, tryInvoke } = Ember;

export default Mixin.create({

  // This is intended as an escape hatch, but ideally you would
  // `{{yield` a child contextual component with `parentComponent=this`
  parentComponent: computed(function() {
    return this.nearestOfType(ParentMixin);
  }),

  init() {
    this._super(...arguments);
    tryInvoke(this, 'initParent');
    tryInvoke(this, 'initChild');
  },

  initChild() {
    this.registerWithParent();
  },

  willDestroyElement() {
    this._super(...arguments);
    if (!this._isComposableDestroying) {
      this._isComposableDestroying = true;
      tryInvoke(this, 'willDestroyElementParent');
      tryInvoke(this, 'willDestroyElementChild');
    }
  },

  willDestroyElementChild() {
    this._super(...arguments);
    this.unregisterWithParent();
  },

  shouldRegister: true,

  shouldRegisterToParent(/*parentComponent*/) {
    return this.get('shouldRegister');
  },

  destroySelfAndChildren() {
    // We may be a child-parent. Destroy children if we can.
    tryInvoke(this, 'destroyChildren');
    tryInvoke(this, 'willDestroyParent');
    this._didInsert = false;
  },

  registerWithParent() {
    let parentComponent = this.get('parentComponent');
    if (this.shouldRegisterToParent(parentComponent)) {
      assert(`Tried to use ${this} outside the context of a parent component.`, parentComponent);
      parentComponent.registerChild(this);
    }
  },

  unregisterWithParent() {
    let parentComponent = this.get('parentComponent');
    if (parentComponent) {
      parentComponent.unregisterChild(this);
    }
  }

});
