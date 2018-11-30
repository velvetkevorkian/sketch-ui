# sketch-ui

__Warning: extremely early version. Breaking changes will happen.__

Generate a UI for tweaking the variables in your creative coding sketches with minimal configuration, using standard HTML inputs.

Designed for use with [p5.js](https://p5js.org/) but not bound to any library or framework.

## Installation
The examples currently assume you're using Webpack to build your JS and CSS.

Add it to your project:
```shell
npm install @velvetkevorkian/sketch-ui
```

## Usage

```javascript
import UI from '@velvetkevorkian/sketch-ui'
import '@velvetkevorkian/sketch-ui/src/ui.css'

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

Setting a value works the same way.
```javascript
  ui.myVariable = 200
  console.log(ui.myVariable) // 200
```

By default a number using a `range` input has a range of 0-255. Trying to set a variable outside that range will see it clamped to 0 or 255. Let's look at how we can configure the options.

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

You can also set a custom label value if you don't want to use the plain variable name.
```javascript
const vars = {
  backgroundColor: {
    value: '#0f0f0f',
    label: 'Background Color'
  }
}
```

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

### Buttons

Setting `type: 'button'` will create a `<button>` element with the text of the label as its text. Let's look at how we can make the button do something when you press it using a callback.

### Callbacks

Each input can be passed a callback to run when the value is changed.
```javascript
const vars = {
  blendMode: {
    value: ['ADD', 'BLEND'],
    label: 'Blend Mode',
    callback: (val) => {
      console.log(val)
    }
  }
}
```

When creating your UI you can pass an additional `context` parameter which will be available to the callback. This can be useful if you need to access properties of other objects. For example, this will call a method on our `p5.js` instance.
```javascript
const vars = {
  loop: {
    value: true,
    callback: (val, p) => {
      val == true ? p.loop() : p.noLoop()
    }
  }
}

new p5(p => {
  p.setup = () => {
    const ui = new UI(variables, p).proxy
  }
})
```

You can also do something when a button is pressed. The button has no value but can still access the context if available.
```javascript
const vars = {
  myButton: {
      type: 'button',
      label: 'Click me',
      callback() {
        console.log('button clicked!')
      }
    }
  }
```

## To Do
- [ ] document with gifs
- [ ] document multiple instances
- [ ] save to localstorage
- [ ] fieldsets
- [ ] use with script tag only
- [ ] worked examples
- [ ] theming/styling
- [ ] transpile/minify?
- [ ] less flaky jsdom setup
- [ ] add CSSlint
