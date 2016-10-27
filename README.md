# ember-composability-tools

[![Build Status](https://travis-ci.org/miguelcobain/ember-composability-tools.svg)](https://travis-ci.org/miguelcobain/ember-composability-tools) [![Ember Observer Score](http://emberobserver.com/badges/ember-composability-tools.svg)](http://emberobserver.com/addons/ember-composability-tools) [![Slack Status](https://ember-community-slackin.herokuapp.com/badge.svg)](https://ember-community-slackin.herokuapp.com/)

This addon intends to provide helpers for building a somewhat different kind of components, i.e components which primary goal isn't to render DOM.

## Installation

To install this addon, run the usual
```
ember install ember-composability-tools
```

## Background and motivation

This addon was essencially extracted from [ember-leaflet](https://github.com/miguelcobain/ember-leaflet) and then adapted for more generic scenarios. The idea behind ember-leaflet is to compose components the usual way, but to have them to produce leaflet layers and not DOM. To do that, Ember's [component lifecycle hooks](https://guides.emberjs.com/v2.8.0/components/the-component-lifecycle/) are used to create the leaflet layers and not produce any DOM (tagless and templateless components).

This idea sounded good in theory, but in practice some problems appeared. The following sections will illustrate both those problems and how **ember-composability-tools** helps solving them.

### 1. Lifecycle hooks order

Consider the following template:

```hbs
{{#leaflet-map lat=51.505 lng=-0.09 zoom=13}}

  {{tile-layer url="http://sometiles.com/{z}/{x}/{y}.png"}}

  {{#maker-layer lat=51.505 lng=-0.09}}
    {{#popup-layer}}
      Hello World!
    {{/popup-layer}}
  {{/maker-layer}}

{{/leaflet-map}}
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

Unfortunately, this isn't the order that any of the lifecycle hooks trigger. E.g, if we had a `console.log('didInsertElement');` in each `didInsertElement` hook, we would see the following order ([demo in ember-twiddle](https://ember-twiddle.com/d1606d4fffecfdeb3257c6effa06cad8?openFiles=templates.application.hbs%2C)):

```
didInsertElement <-- tile-layer
didInsertElement <-- marker-layer
didInsertElement <-- leaflet-map
```

The render hooks start being called on children, which is not compatible with our 3rd party API logic.
Also, we need to use `didInsertElement` at least on `leaflet-map` because we need to make sure an element is available to create a map (`L.map(this.element)`). This is a very common pattern, not only with leaflet.

Likewise, the destroy lifecycle hooks are not called in the desired order.

**ember-composability-tools** fixes this problem providing components new render and destroy hooks that trigger in our desired order. Those hooks are called `didInsertParent` and `willDestroyParent`. You just need to include `ChildMixin` on child components and `ParentMixin` on parent components to have access to them. Example:

```js
import Ember from 'ember';
import { ParentMixin } from 'ember-composability-tools';
const { Component } = Ember;

export default Component.extend(ParentMixin, {
  didInsertParent() {
    this._super(...arguments);
    // The topmost parent hook call.
    // Here we have a `this.element` available and
    // we are certain that none of the children's
    // `didInsertParent` hooks were called
  },
  willDestroyParent() {
    this._super(...arguments);
    // the reverse is applied here.
    // We are certain that this call will take place
    // when all of the children's `willDestroyParent`
    // were called.
  }
});
```

The same hooks are available when using `ChildMixin`.

Note that a component can be a child and a parent at the same time. e.g `marker-layer` is a child to `leaflet-map` but a parent to `popup-layer`. In that case just include both mixins. They are compatible.

### 2. Access to parent and children

While composing components like we say in our previous ember-leaflet example, we often need to access parent/child components. E.g, when we write:

```hbs
{{#leaflet-map lat=51.505 lng=-0.09 zoom=13}}
  {{tile-layer url="http://sometiles.com/{z}/{x}/{y}.png"}}
{{/leaflet-map}}
```

we want the child tile-layer to be added to the **parent** map instance. In other cases one might need to access children directly from the parent.

With **ember-composability-tools** we can essentially do:

```js
// tile-layer example implementation
L.tileLayer(this.get('url')).addTo(this.get('parentComponent')._mapInstance);
```

`parentComponent` is available on any component that includes the `ChildMixin` and is used inside the block of a component that includes the `ParentMixin`.

Likewise, the `childComponents` property is available on a component that includes the `ParentMixin`:

```js
// invoke draw on all child components
this.get('childComponents').invoke('draw');
```

### 3. Render blocks as DOM, but not to the document

The third problem **ember-composability-tools** aims to solve is the problem of getting the  contents of a block as a DOM you can pass in to a 3rd party library.
If you take a closer look, in our previous example we had:

```hbs
{{#maker-layer lat=51.505 lng=-0.09}}
  {{#popup-layer}}
    Hello World!
  {{/popup-layer}}
{{/maker-layer}}
```

But how will that `Hello World!` ends up in a leaflet popup? Using the leaflet API, we quickly that problem:

```js
L.marker([this.get('lat'), this.get('lng')])
  .bindPopup(?) // how do we get the contents of the block of the current component?
  .addTo(this.get('parentComponent')._mapInstance);
```

At first sight one might ask "Why not just `this.$()` or `this.element`?". The problem in doing this is that the contents would still be rendered to the DOM in the document, like normally. Remember that at this stage we're in a DOM zone that "isn't ours". It belongs to the leaflet map and we're not sure how leaflet treats the DOM here, so it might not be safe to change the DOM here. We should only "render" leaflet layers by now.

**ember-composability-tools** solves this problem by rendering the component's block to an element created by the component itself (using `document.createElement()`).

To use this functionality you just need to include the `RenderBlockMixin`. By default, the `RenderBlockMixin` doesn't render anything to the `destinationElement`. This way you don't render anything you don't want to. You control when to render by setting `shouldRender` to `true` or `false`.

Example:

```js
import Ember from 'ember';
import { RenderBlockMixin } from 'ember-composability-tools';
const { Component } = Ember;

export default Component.extend(RenderBlockMixin, {
  // use `this.get('destinationElement')` in the component context
  // in this case we decided to always render the block
  // so we set shouldRender to true at init time.
  shouldRender: true
});
```

## Contribution

### Clone and setup dependencies

* `git clone <repository-url>` this repository
* `cd ember-composability-tools`
* `npm install`
* `bower install`

### Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

### Building

* `ember build`

For more information on using ember-cli, visit [http://ember-cli.com/](http://ember-cli.com/).
