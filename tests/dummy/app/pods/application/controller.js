import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ApplicationController extends Controller {
  @tracked show = true;

  @tracked showChild = true;

  @tracked showParentChild = true;

  @action
  toggle(prop) {
    this[prop] = !this[prop];
  }
}
