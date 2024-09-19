import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class Node extends Component {
  children = new Set();

  #didTeardown = false;
  #setupPromise = Promise.withResolvers();
  #element;

  constructor() {
    super(...arguments);

    if (this.args.parent) {
      // register with parent
      this.args.parent.registerChild(this);
    }
  }

  async willDestroy() {
    super.willDestroy(...arguments);
    this.willDestroyRecursive(this.#element);
  }

  /**
   * Method invoked by the child components to register themselves with their parent
   * @param {Component} child
   */
  async registerChild(child) {
    this.children.add(child);

    await this.#setupPromise.promise;
    child.setup();
  }

  /**
   * Method invoked by the child components to unregister themselves with their parent
   * @param {Component} child
   */
  unregisterChild(child) {
    this.children.delete(child);
  }

  /**
   * method responsible for tearing down its children plus itself
   * it is called by the root initially and recursively to its children
   * @param {HTMLElement} element the root element
   */
  async willDestroyRecursive(element) {
    // this hook will be called depth-first from the top-level component
    // since we must destroy childs first, the first parent will
    // be responsible for destroying the children. `this.#didTeardown` guards
    // that we don't redestroy already destroyed children
    if (!this.#didTeardown) {
      this.#didTeardown = true;

      // teardown children
      await Promise.all(
        [...this.children].map((c) => c.willDestroyRecursive()),
      );
      // teardown self
      await this.teardown(element);

      if (this.args.parent) {
        this.args.parent.unregisterChild(this);
      }
    }
  }

  /**
   * method responsible for setting up itself
   * it is called by the root initially and recursively to its children
   * @param {HTMLElement} element the root element
   */
  @action
  async setup(element) {
    try {
      this.#element = element;
      // library setup code goes here
      if (typeof this.args.didInsertParent === 'function') {
        await this.args.didInsertParent(element);
      }

      if (typeof this.didInsertParent === 'function') {
        await this.didInsertParent(element);
      }

      this.#setupPromise.resolve();
    } catch (e) {
      this.#setupPromise.reject(e);
      throw e;
    }
  }

  /**
   * The actual teardown logic
   * @param {HTMLElement} element
   */
  async teardown(element) {
    // library teardown code goes here
    if (typeof this.args.willDestroyParent === 'function') {
      await this.args.willDestroyParent(element);
    }

    if (typeof this.willDestroyParent === 'function') {
      await this.willDestroyParent(element);
    }
  }
}
