import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class ParentComponent extends Component {
  @action
  didInsertParent() {
    console.log('didInsertParent - parent'); // eslint-disable-line
  }

  @action
  willDestroyParent() {
    console.log('willDestroyParent - parent'); // eslint-disable-line
  }
}
