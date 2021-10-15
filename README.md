# ember-composability-tools

[![CI](https://github.com/miguelcobain/ember-composability-tools/actions/workflows/ci.yml/badge.svg)](https://github.com/miguelcobain/ember-composability-tools/actions/workflows/ci.yml) [![Ember Observer Score](http://emberobserver.com/badges/ember-composability-tools.svg)](http://emberobserver.com/addons/ember-composability-tools) [![Discord](https://img.shields.io/discord/480462759797063690.svg?logo=discord)](https://discord.gg/zT3asNS)

This addon intends to provide helpers for building a somewhat different kind of components, i.e components which primary goal isn't to render DOM.

## Installation

To install this addon, run the usual
```
ember install ember-composability-tools
```

## Background and motivation

This addon was essentially extracted from [ember-leaflet](https://github.com/miguelcobain/ember-leaflet) and then adapted for more generic scenarios. The idea behind ember-leaflet is to compose components the usual way, but to have them to produce leaflet layers and not DOM.

This idea sounded good in theory, but in practice some problems appeared. The following sections will illustrate both those problems and how **ember-composability-tools** helps solving them.

### 1. Lifecycle hooks order

Consider the following template:

```hbs
<LeafletMap @lat={{51.505}} @lng={{-0.09}} @zoom={{13}} as |layers|>

  <layers.tile @url="http://sometiles.com/{z}/{x}/{y}.png"/>

  <layers.marker @lat={{51.505}} @lng={{-0.09}} as |marker|>
    <marker.popup>
      Hello World!
    </marker.popup>
  </layers.marker>

</LeafletMap>
```

We would like it to be equivalent to the corresponding code using the Leaflet API:

```js
let map = L.map(this.element).setView([51.505, -0.09], 13);
L.tileLayer('http://sometiles.com/{z}/{x}/{y}.png').addTo(map);
L.marker([51.505, -0.09]).bindPopup('Hello World!').addTo(map);
```

In other words, there is an order that needs to be followed. This order is more evident when there are more levels of nesting, but in this case the order is:

1. create map
2. create tile
3. create marker

Unfortunately, this isn't the order that the `{{did-insert}}` modifiers and helpers run. E.g, if we had a `console.log('didInsertNode');` in each `{{did-insert}}`, we would see the following order ([demo in ember-twiddle](https://ember-twiddle.com/13788ea180f4b6ce9012fb60ef62ee65?openFiles=components.my-component-parent%5C.js%2Ctemplates.components.my-component-parent%5C.hbs)):

```
didInsertNode <-- tile-layer
didInsertNode <-- marker-layer
didInsertNode <-- leaflet-map
```

The `didInsertNode` hooks start being called on children, which is not compatible with our 3rd party API logic.
Also, we need to use the `{{did-insert}}` modifier at least on `<LeafletMap>` because we need to make sure an element is available to create a map (`L.map(this.element)`). This is a very common pattern, not only with Leaflet.

Likewise, the destroy lifecycle hooks are not called in the desired order.

**ember-composability-tools** fixes this problem by providing components new render and destroy hooks that trigger in our desired order. Those hooks are called `didInsertParent` and `willDestroyParent`.
You can subclass the `Root` and `Node` classes, which inherit the glimmer `Component` class. Example:

```js
import { Root } from 'ember-composability-tools';

export default class MyMap extends Root {
  didInsertParent(element) {
    // The topmost parent hook call.
    // Here we have a `element` available and
    // we are certain that none of the children's
    // `didInsertParent` hooks were called
  }

  willDestroyParent(element) {
    // the reverse is applied here.
    // We are certain that this call will take place
    // when all of the children's `willDestroyParent`
    // were called.
  }
}
```

The same hooks are available when using the `Node` class. You only need to use a separate `Root` class because it's the
only one that needs to wait on an actual DOM element to be present. So in that sense this component is special, i.e its template is slightly different (uses the `{{did-insert}}` modifier on the element).

Note that a component can be a child and a parent at the same time. e.g `<layers.marker>` is a child to `<LeafletMap>` but a parent to `<marker.popup>`.
You can nest nodes arbitrarily deep because both `Root` and `Node` yield another `Node` contextual component that can be used as the child.

In fact, you can also use the provided components directly and use the new hooks as arguments. Here's an example:

```hbs
<Root @didInsertParent={{this.createMap}} as |Node|>
  <Node @didInsertParent={{this.createTile}}/>
  <Node @didInsertParent={{this.createMarker}}/>
</Root>
```

For simpler cases, this might be enough.

Note: you can customize the element that `<Root>` renders by suppying a `@tagName` argument (which defaults to `div`).
It's also possible to pass in any attributes that will be applied to the element.

Example:

```hbs
<Root @tagName="nav" class="custom-class" as |Node|>
  {{!-- ... --}}
</Root>
```

### 2. Access to parent and children

While composing components like we saw in our previous ember-leaflet example, we often need to access parent/child components. E.g, when we write:

```hbs
<LeafletMap @lat={{51.505}} @lng={{-0.09}} @zoom={{13}} as |layers|>
  <layers.tile @url="http://sometiles.com/{z}/{x}/{y}.png"/>
</LeafletMap>
```

we want the child `<layers.tile>` to be added to the **parent** map instance. In other cases one might need to access children directly from the parent.

With **ember-composability-tools** we can essentially do:

```js
// tile-layer example implementation
L.tileLayer(this.args.url).addTo(this.args.parent._mapInstance);
```

`@parent` is available as an argument on any `Node`.
Likewise, `this.children` property is available on both `Root` and `Node` classes:

```js
// invoke draw on all child components
for (let c of this.children) {
  c.draw();
}
```

This property is a [javascript Set](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Set).

### 3. Render blocks as DOM, but not to the document

Historically, the third problem **ember-composability-tools** aimed to solve was the problem of getting the contents of a block as a DOM you can pass in to a 3rd party library.
This was the case on version previous to `v1.0.0`.
If you take a closer look, in our previous example we had:

```hbs
<layers.marker @lat={{51.505}} @lng={{-0.09}} as |marker|>
  <marker.popup>
    Hello World!
  </marker.popup>
</layers.marker>
```

But how will that `Hello World!` end up in a leaflet popup? Using the leaflet API, we quickly see that problem:

```js
L.marker([this.args.lat, this.args.lng])
  .bindPopup(?) // how do we get the contents of the block of the current component?
  .addTo(this.args.parent._mapInstance);
```

At first sight one might ask "Why not just `this.element`?". The problem in doing this is that the contents would still be rendered to the DOM in the document, like normally. Remember that at this stage we're in a DOM zone that "isn't ours". It belongs to the leaflet map and we're not sure how leaflet treats the DOM here, so it might not be safe to change the DOM here. We should only "render" leaflet layers by now.

**ember-composability-tools** solved this problem by rendering the component's block to an element created by the component itself (using `document.createElement()`).

However, recently Ember released some public apis that made this problem easily solvable with the `{{#in-element}}` helper.

Here's an example:

```js
import { Node } from 'ember-composability-tools';

export default class PopupLayer extends Node {
  // creates the dom element that `in-element` will render into
  destinationElement = document.createElement('div');

  didInsertParent(element) {
    L.marker([this.args.lat, this.args.lng])
      .bindPopup(this.destinationElement) // use the created element
      .addTo(this.args.parent._mapInstance);
  }
}
```
```hbs
{{!-- render into the created element --}}
{{#in-element this.destinationElement}}
  {{yield}}
{{/in-element}}
```

Contributing
------------------------------------------------------------------------------

### Installation

* `git clone <repository-url>`
* `cd ember-composability-tools`
* `npm install`

### Linting

* `npm run lint:hbs`
* `npm run lint:js`
* `npm run lint:js -- --fix`

### Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
