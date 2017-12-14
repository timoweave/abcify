"use strict";

import {z, y, x} from "./xyz.js";
import type {Y, X} from "./xyz.js";

const {c, b, a} = require("./abc.js");

type Numeric = 10 | 2 | 1 | -1;
type Strange = false | 400 | "hello" | undefined | 9 | "yes" | true | null | -5;
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

console.log({k3: e, k2: d, k1: obj});

const {e, d: {y, x}} = obj;

const Box = (
  <div z="hello" y={true} x={1}>
    <div style={{weight: "100%", fontSize: "10px"}} className="hello">
      box
    </div>
  </div>
);

function test(a) {
  switch (a) {
    case 2:
    case 3:
    case 1:
    case "5":
      console.log("a is 1 < 2 < 3 < '5'");
      break;
    case "zebra":
    case "alpha":
    case "beta":
    case 10:
      console.log("a is 10 < 'alpha' < 'beta' < 'zebra'");
      break;
    case true:
    case false:
    case 20:
    case 15:
    case "b":
      console.log("a is boolean false < true < 15 < 20 < 'b'");
      break;
    case 100:
    case "a":
    case "200":
    default:
      console.log("a is default 100 < '200' < 'a' < default");
      break;
  }
}
