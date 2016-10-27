import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { RenderBlockMixin } from 'ember-composability-tools';

const { Component, run } = Ember;

let component;

moduleForComponent('render-block', 'Integration | Component | render block', {
  integration: true,
  beforeEach() {
    let renderBlockComponent = Component.extend(RenderBlockMixin, {
      init() {
        this._super(...arguments);
        component = this;
      }
    });
    this.register('component:render-block', renderBlockComponent);
  }
});

test('it renders and destroys', function(assert) {

  this.render(hbs`
    {{#render-block}}
      <p>Block content</p>
    {{/render-block}}
  `);

  run(() => {
    component.set('shouldRender', true);
  });

  let destinationElement = component.get('destinationElement');
  assert.equal(destinationElement.innerHTML.trim(), '<p>Block content</p>', 'document fragment holds DOM');

  run(() => {
    component.set('shouldRender', false);
  });

  assert.equal(destinationElement.innerHTML, '', 'document fragment doesn\'t hold the DOM');
});
