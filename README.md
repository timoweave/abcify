# abcify cli

This `abcify` sort the following expressions. It walks an AST with visitors to sort expressions.
1. support: es2015, react, flow,
2. object literal by keys,
3. es2015 object destructing by keys,
4. react jsx properties by names,
5. flow type literal by keys, union by values,

## SETUP

* `npm install abcify`

note:
- if needed, add `--save`, `--save-dev`, xor `--global` flag.
- if dependencies failed run `npm install recast yargs flow-parser`

## EXAMPLE

* `abcify example.js` # to print abcified output to terminal.
* `abcify example.js -s` # to save abcified back to the same file.

where `example.js` is shown below:

```javascript
"use strict";
import {z, y, x} from "./xyz.js";
import type {Y, X} from "./xyz.js";
const {c, b, a} = require('./abc.js');

type Numeric = 10 | 2 | 1 | -1;
type Strange = false | 400 | "hello" | undefined | null;
type Sizes = "pettie" | "small" | "medium" | "large";

type Obj = {
  "b;": boolean,
  "a:": number,
  e: Array<number>,
  d: {y: boolean, z: number, x: string},
  c: string,
};

const obj: Obj = {
  e: [3, 2, 1, 0],
  d: {z: 0, y: false, x: "hey"},
  c: "hello",
  "b;": true,
  "a:": 1,
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

```javascript
"use strict";
import {x, y, z} from "./xyz.js";
import type {X, Y} from "./xyz.js";
const {a, b, c} = require('./abc.js');

type Numeric = 10 | 2 | 1 | -1;
type Strange = false | 400 | "hello" | undefined | null;
type Sizes = "pettie" | "small" | "medium" | "large";

type Obj = {
  "a:": number,
  "b;": boolean,
  c: string,
  d: {x: string, y: boolean, z: number},
  e: Array<number>,
};

const obj: Obj = {
  "a:": 1,
  "b;": true,
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
