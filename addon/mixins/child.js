import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { tryInvoke } from '@ember/utils';
import ParentMixin from './parent';

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

  didInsertElement() {
    this._super(...arguments);
    this.notifyParentOfInsert();
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
    if (parentComponent && this.shouldRegisterToParent(parentComponent)) {
      parentComponent.registerChild(this);
    }
  },

  notifyParentOfInsert() {
    let parentComponent = this.get('parentComponent');

    if (this.shouldRegisterToParent(parentComponent)) {
      parentComponent.childDidInsertElement(this);
    }
  },

  unregisterWithParent() {
    let parentComponent = this.get('parentComponent');
    if (parentComponent) {
      parentComponent.unregisterChild(this);
    }
  }
});
