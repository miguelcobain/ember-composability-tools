import Ember from 'ember';
import layout from '../templates/render-block';

const { Mixin, computed } = Ember;

export default Mixin.create({
  layout,

  destinationElementTag: 'div',

  // creates a document fragment that will hold the DOM
  destinationElement: computed(function() {
    return document.createElement(this.get('destinationElementTag'));
  })
});
