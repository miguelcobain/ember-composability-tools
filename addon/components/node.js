import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class Node extends Component {
  children = new Set();
  _didSetup = false;

  constructor() {
    super(...arguments);

    if (this.args.parent) {
      // register with parent
      this.args.parent.registerChild(this);
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);

    if (this.args.parent) {
      this.args.parent.unregisterChild(this);
    }
    // this hook will be called depth-first from the top-level component
    // since we must destroy childs first, the first parent will
    // be responsible for destroying the children. `this._didSetup` guards
    // that we don't redestroy already destroyed children
    if (this._didSetup) {
      this.children.forEach((c) => c.willDestroyNode());
      this.teardown();
      this._didSetup = false;
    }
  }

  /**
   * Method invoked by the child components to register themselves with their parent
   * @param {Component} child
   */
  registerChild(child) {
    this.children.add(child);

    if (this._didSetup) {
      child.setup();
    }
  }

  /**
   * Method invoked by the child components to unregister themselves with their parent
   * @param {Component} child
   */
  unregisterChild(child) {
    this.children.delete(child);
  }

  /**
   * method responsible for setting up itself plus its children
   * it is called by the root initially and recursively to its children
   * @param {HTMLElement} element the root element
   */
  @action
  didInsertNode(element) {
    this.setup(element);

    this.children.forEach((c) => c.didInsertNode(element));
  }

  /**
   * method responsible for tearing down its children plus itself
   * it is called by the root initially and recursively to its children
   * @param {HTMLElement} element the root element
   */
  @action
  willDestroyNode(element) {
    this.children.forEach((c) => c.willDestroyNode(element));

    this.teardown(element);
  }

  /**
   * The actual setup logic
   * @param {HTMLElement} element
   */
  setup(element) {
    // library setup code goes here
    if (typeof this.args.didInsertParent === 'function') {
      this.args.didInsertParent(element);
    }

    if (typeof this.didInsertParent === 'function') {
      this.didInsertParent(element);
    }

    this._didSetup = true;
  }

  /**
   * The actual teardown logic
   * @param {HTMLElement} element
   */
  teardown(element) {
    // library teardown code goes here
    if (typeof this.args.willDestroyParent === 'function') {
      this.args.willDestroyParent(element);
    }

    if (typeof this.willDestroyParent === 'function') {
      this.willDestroyParent(element);
    }

    this._didSetup = false;
  }
}
