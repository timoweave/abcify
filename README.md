# abcify

`abcify` can be used to sort
1. object literal by keys,
2. object destructing by keys,
3. jsx properties by name

## SETUP

* `npm install recast yargs` # abcify dependencies
* `npm install abcify`

## EXAMPLE

* `abcify example.js` # to abcify javascript file.
* `abcify example.js -s` # to save abcified javascript file.

where `example.js` is shown below:

```
"use strict";
import {z, y, x} from "./xyz.js";
const {c, b, a} = require('./abc.js');

const obj = {
  e: [3, 2, 1, 0],
  d: {z: 0, y: false, x: "hey"},
  c: "hello",
  "b": true,
  "a": 1,
};

console.log({"k3": e, "k2": d, "k1": obj});

const {e, d: {y, x} } = obj;

const Box = (
    <div z="hello" y={true} x={1}>
    box
    </div>
);
```

After `abcify`, the terminal output would be the following:

```
"use strict";
import {x, y, z} from "./xyz.js";
const {a, b, c} = require('./abc.js');

const obj = {
  "a": 1,
  "b": true,
  c: "hello",
  d: {x: "hey", y: false, z: 0},
  e: [3, 2, 1, 0],
};

console.log({"k1": obj, "k2": d, "k3": e});

const {d: {x, y}, e } = obj;

const Box = (
    <div x={1} y={true} z="hello">
    box
    </div>
);
```

abc done!
