import Component from '@ember/component';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { RenderBlockMixin } from 'ember-composability-tools';

let component;

module('Integration | Component | render block', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    let renderBlockComponent = Component.extend(RenderBlockMixin, {
      init() {
        this._super(...arguments);
        component = this;
      }
    });
    this.owner.register('component:render-block', renderBlockComponent);
  });

  test('it renders and destroys', async function(assert) {

    await render(hbs`
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
});
