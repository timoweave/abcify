"use strict";

import {z, y, x} from "./xyz.js";
import type {Y, X} from "./xyz.js";

const {c, b, a} = require("./abc.js");

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

console.log({k3: e, k2: d, k1: obj});

const {e, d: {y, x}} = obj;

const Box = (
    <div z="hello" y={true} x={1}>
        box
    </div>
);
