import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class ChildComponent extends Component {
  @action
  didInsertParent() {
    console.log('didInsertParent - child', this.args.name); // eslint-disable-line
  }

  @action
  willDestroyParent() {
    console.log('willDestroyParent - child', this.args.name); // eslint-disable-line
  }
}
