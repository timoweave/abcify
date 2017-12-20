const chai = require("chai");
const utils = require("../utils");
const recast = require("recast");
const flow_parser = require("flow-parser");

const {assert} = chai;
const {GENERIC, IDENTIFIER, UNDEFINED} = utils;
const {is_undefined_literal, compare_name, walk_ast, compare_by_object} = utils;

describe("compare_name", function() {
  it("should be able to handle undefined/null", function() {
    assert.equal(compare_name(null, null), 0);
    assert.equal(compare_name(undefined, undefined), 0);
    assert.equal(compare_name("", ""), 0);
    assert.equal(compare_name("1", "2"), -1);
    assert.equal(compare_name("a", "b"), -1);
    assert.equal(compare_name("1", "1a"), -1);
    assert.equal(compare_name("a", "a2"), -1);
  });
});

describe("is_undefined_literal", function() {
  it("should be able to handle right types", function() {
    assert.equal(
      is_undef({type: GENERIC, id: {name: UNDEFINED, type: IDENTIFIER}}),
      true
    );
  });

  it("should be able to handle null/undefined", function() {
    assert.equal(is_undef(null), false);
    assert.equal(is_undef(undefined), false);
    assert.equal(is_undef(2), false);
    assert.equal(is_undef(true), false);
    assert.equal(is_undef("hello"), false);
  });

  it("should be able to handle {}", function() {
    assert.equal(is_undef({}), false);
    assert.equal(is_undef({type: true}), false);
    assert.equal(is_undef({type: true, id: {type: false}}), false);
    assert.equal(
      is_undef({type: true, id: {name: "hello", type: false}}),
      false
    );
    assert.equal(
      is_undef({type: GENERIC, id: {name: "hello", type: false}}),
      false
    );
    assert.equal(
      is_undef({type: GENERIC, id: {name: "hello", type: IDENTIFIER}}),
      false
    );
    assert.equal(
      is_undef({type: GENERIC, id: {name: null, type: IDENTIFIER}}),
      false
    );
    assert.equal(
      is_undef({type: GENERIC, id: {name: undefined, type: IDENTIFIER}}),
      false
    );
  });

  function is_undef(a) {
    return is_undefined_literal(a);
  }
});

describe("sort destructuring object by name", function() {
  it("should sort object by key --> {a: {x, y, z}, b, c}", function() {
    const input = "const {c, b, a: {z, y, x}} = {};";
    const output = "const {a: {x, y, z}, b, c} = {};";
    assert.equal(sort_destructuring_by_key(input), output);
  });

  const should_handle_value =
    "should sort object by key, with value --> " +
    "{a: {x: false, y: null, z: 'hello'}, b: 1, c: true}";
  it(should_handle_value, function() {
    const input =
      "const {c: true, b: 1, a: {z: 'hello', y: null, x: false}} = {a: {}}";
    const output =
      "const {a: {x: false, y: null, z: 'hello'}, b: 1, c: true} = {a: {}}";
    assert.equal(sort_destructuring_by_key(input), output);
  });

  const should_handle_duplicates =
    "should sort object by key, keep dup order ---> " +
    "{a: 1, a: 2, b: {k: 'hello', k: null}, c: true, c: false}";
  it(should_handle_duplicates, function() {
    const input =
      "const {c: true, c: false, b: {k: 'hello', k: null}, a: 1, a: 2} = {b: {}}";
    const output =
      "const {a: 1, a: 2, b: {k: 'hello', k: null}, c: true, c: false} = {b: {}}";
    assert.equal(sort_destructuring_by_key(input), output);
  });

  function sort_destructuring_by_key(input) {
    const ast = recast.parse(input, {parser: flow_parser});
    walk_ast(ast, "visitObjectPattern", true, path => {
      path.value.properties.sort(compare_by_object);
    });
    const {code} = recast.print(ast);
    const trimmed = code.trimRight();
    return trimmed;
  }
});
