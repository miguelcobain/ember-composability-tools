import Node from './node';

export default class Root extends Node {
  get tagName() {
    return this.args.tagName || 'div';
  }
}
