# sketch-ui

Generate a UI for tweaking the variables in your creative coding sketches with minimal configuration, using standard HTML inputs.

Designed for use with [p5.js](https://p5js.org/) but not bound to any library or framework.

## Installation
Add it to your project:
```shell
npm install @velvetkevorkian/sketch-ui
```

## Usage

```javascript
import UI from '@velvetkevorkian/sketch-ui'

// declare our variables object.
const vars = {
  myVariable: {
    value: 50
  }
}

// create a new UI instance and pass the variables object to it
const ui = new UI(vars).proxy

function loop() {
  // vars.myVariable.value is proxied to ui.myVariable
  console.log(ui.myVariable)
  // keep the loop going
  window.requestAnimationFrame(loop)
}

// start the requestAnimationFrame loop
window.requestAnimationFrame(loop)
```

Drag the slider and watch the values update in real time.

Setting a value works the same way. Let's set the value of `myVariable` to the x coordinate of each mouse click:

```javascript
document.addEventListener('click', e => {
  ui.myVariable = e.clientX
})
```

Notice the value is capped to 255. Let's look at the defaults and how to change them.

## Configuration
The script will try to infer the type of variable you're using, and generate a suitable input with sensible defaults:
- 7 character hex codes, e.g. `#ff0000`, generates a `color` input.
- numbers generates a `range` input with `min=0`, `max=255`, and `step=1`
- a boolean value generates a `checkbox` input
- an array generates a `select` field with each item in the array an `option`
- anything else will default to a standard `text` input

You can pass additional options to override any of these defaults. For example:
```javascript

const vars = {
  // use a `number` input instead of `range`
  num: {
    value: 50,
    type: 'number'
  },
  // override the step and max values
  bigNum: {
    value: 100,
    max: 1000,
    step: 10
  }
}
```
The script will validate `min` and `max` values for setters as well as via the UI, which is why `myVariable` maxes out at 255 in the click example above.

Any other options you pass will be applied directly to the input, for example:
```javascript
const vars = {
  myVariable: {
    value: 'some text',
    foo: 'bar'
  }
}
```
will result in
```html
<input id='myVariable' type='text' value='some text' foo='bar'>
```

### Callbacks

## To Do
- [ ] show/hide UI
- [ ] save to localstorage
- [ ] fieldsets
- [ ] multiple UIs?
- [ ] document callbacks
- [ ] use with script tag only
- [ ] worked examples
- [ ] theming/styling
- [ ] browser testing
- [ ] transpile/minify?
- [ ] should style loader be a prod dependency?
