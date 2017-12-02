import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';
import { A } from '@ember/array';
import { tryInvoke } from '@ember/utils';

export default Mixin.create({
  childComponents: computed(() => new A()),

  didInsertElement() {
    this._super(...arguments);

    tryInvoke(this, 'initChild');

    // If we are a top-level parent, we should start
    // the `didInsertParent` call chain, starting with ourselves
    if (!this.get('parentComponent')) {
      tryInvoke(this, 'didInsertParent');
      this._didInsert = true;
      this.invokeChildDidInsertHooks();
    }
  },

  willDestroyElement() {
    this._super(...arguments);
    if (!this._isComposableDestroying) {
      this._isComposableDestroying = true;
      tryInvoke(this, 'willDestroyElementParent');
      tryInvoke(this, 'willDestroyElementChild');
    }
  },

  willDestroyElementParent() {
    this._super(...arguments);

    // this wook will be called depth-first from the top-level component
    // since we must destroy childs first, the first parent will
    // be responsible for destroying the children. `this._didInsert` guards
    // that we don't redestroy already destroyed children
    if (this._didInsert) {
      this.destroySelfAndChildren();
    }
  },

  invokeChildDidInsertHooks() {
    const childComponents = this.get('childComponents')
    childComponents.invoke('didInsertParent');
    childComponents.setEach('_didInsert', true);
    childComponents.invoke('invokeChildDidInsertHooks');
  },

  destroySelfAndChildren() {
    this.destroyChildren();
    tryInvoke(this, 'willDestroyParent');
    this._didInsert = false;
  },

  destroyChildren() {
    const childComponents = this.get('childComponents')
    childComponents.reverseObjects();
    // if we have child-parents, destroy their children as well
    childComponents.invoke('destroyChildren');
    // destroy children
    childComponents.invoke('willDestroyParent');
    childComponents.setEach('_didInsert', false);
    childComponents.clear();
  },

  registerChild(childComponent) {
    const childComponents = this.get('childComponents')
    childComponents.addObject(childComponent);

    // If parent already setup, setup child immediately
    if (this._didInsert && !childComponent._didInsert) {
      tryInvoke(childComponent, 'didInsertParent');
      childComponent._didInsert = true;
      tryInvoke(childComponent, 'invokeChildDidInsertHooks');
    }
  },

  unregisterChild(childComponent) {
    const childComponents = this.get('childComponents')
    childComponents.removeObject(childComponent);

    // If parent already setup, teardown child immediately
    if (childComponent._didInsert) {
      tryInvoke(childComponent, 'destroySelfAndChildren');
    }
  }
});
