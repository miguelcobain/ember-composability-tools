import Ember from 'ember';
const { Mixin, A, tryInvoke } = Ember;

export default Mixin.create({
  _childComponents: null,

  init() {
    this._super(...arguments);
    this._childComponents = new A();
  },

  didInsertElement() {
    this._super(...arguments);

    // If we are a top-level parent, we should start
    // the `didInsertParent` call chain, starting with ourselves
    if (!this.get('parentComponent')) {
      this.didInsertParent();
      this._didInsert = true;
      this.invokeChildDidInsertHooks();
    }
  },

  willDestroyElement() {

    // this wook will be called depth-first from the top-level component
    // since we must destroy childs first, the first parent will
    // be responsible for destroying the children. `this._didInsert` guards
    // that we don't redestroy already destroyed children
    if (this._didInsert) {
      this.destroySelfAndChildren();
    }

    this._super(...arguments);
  },

  invokeChildDidInsertHooks() {
    this._childComponents.invoke('didInsertParent');
    this._childComponents.setEach('_didInsert', true);
    this._childComponents.invoke('invokeChildDidInsertHooks');
  },

  destroySelfAndChildren() {
    this.destroyChildren();
    this.willDestroyParent();
    this._didInsert = false;
  },

  destroyChildren() {
    this._childComponents.reverseObjects();
    // if we have child-parents, destroy their children as well
    this._childComponents.invoke('destroyChildren');
    // destroy children
    this._childComponents.invoke('willDestroyParent');
    this._childComponents.setEach('_didInsert', false);
    this._childComponents.clear();
  },

  registerChild(childComponent) {
    this._childComponents.addObject(childComponent);

    // If parent already setup, setup child immediately
    if (this._didInsert) {
      childComponent.didInsertParent();
      childComponent._didInsert = true;
      tryInvoke(childComponent, 'invokeChildDidInsertHooks');
    }
  },

  unregisterChild(childComponent) {
    this._childComponents.removeObject(childComponent);

    // If parent already setup, teardown child immediately
    if (childComponent._didInsert) {
      tryInvoke(childComponent, 'destroySelfAndChildren');
    }
  }
});
