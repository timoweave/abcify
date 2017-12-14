"use strict";

import {x, y, z} from "./xyz.js";
import type {X, Y} from "./xyz.js";

const {a, b, c} = require("./abc.js");

type Numeric = -1 | 1 | 2 | 10;
type Strange = undefined | null | false | true | -5 | 9 | 400 | "hello" | "yes";
type Sizes = "large" | "medium" | "pettie" | "small";

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

console.log({k1: obj, k2: d, k3: e});

const {d: {x, y}, e} = obj;

const Box = (
  <div x={1} y={true} z="hello">
    <div className="hello" style={{fontSize: "10px", weight: "100%"}}>
      box
    </div>
  </div>
);

function test(a) {
  switch (a) {
    case 1:
    case 2:
    case 3:
    case "5":
      console.log("a is 1 < 2 < 3 < '5'");
      break;
    case 10:
    case "alpha":
    case "beta":
    case "zebra":
      console.log("a is 10 < 'alpha' < 'beta' < 'zebra'");
      break;
    case false:
    case true:
    case 15:
    case 20:
    case "b":
      console.log("a is boolean false < true < 15 < 20 < 'b'");
      break;
    case 100:
    case "200":
    case "a":
    default:
      console.log("a is default 100 < '200' < 'a' < default");
      break;
  }
}
