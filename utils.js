const fs = require("fs");
const path = require("path");
const recast = require("recast");
const flow_parser = require("flow-parser");
const {ArgumentParser} = require("argparse");

const JSX_ATTRIBUTE = "JSXAttribute";
const LITERAL = "Literal";
const IMPORT_SPECIFIER = "ImportSpecifier";
const NULL = "NullLiteralTypeAnnotation";
const GENERIC = "GenericTypeAnnotation";
const NUMBER_LITERAL = "NumberLiteralTypeAnnotation";
const BOOLEAN_LITERAL = "BooleanLiteralTypeAnnotation";
const UNDEFINED = "undefined";
const IDENTIFIER = "Identifier";
const SWITCH_CASE = "SwitchCase";

const {version} = require("./package.json");

function walk_ast(ast, token, required, callback) {
  if (required) {
    recast.types.visit(ast, {
      [token]: function(path) {
        this.traverse(path);
        callback(path);
      },
    });
  }
}

function is_undefined_literal(a) {
  const {type: kind = null, id: {type = null, name = null} = {}} = a || {};
  if (kind === null || type === null || name === null) {
    return false;
  }

  return kind === GENERIC && type === IDENTIFIER && name === UNDEFINED;
}

function compare_by_name(a_name, b_name) {
  const a_len = a_name == null ? 0 : a_name.length;
  const b_len = b_name == null ? 0 : b_name.length;

  for (let a_i = 0, b_i = 0; a_i < a_len && b_i < b_len; a_i++, b_i++) {
    const a_num = a_name != null ? a_name[a_i].charCodeAt(0) : 0;
    const b_num = b_name != null ? b_name[b_i].charCodeAt(0) : 0;
    if (a_num !== b_num) {
      return a_num - b_num;
    }
  }
  return a_len - b_len;
}

function compare_by_union(a, b) {
  if (is_undefined_literal(a)) {
    return -1;
  } else if (is_undefined_literal(b)) {
    return 1;
  } else if (a.type === NULL) {
    return -1;
  } else if (b.type === NULL) {
    return 1;
  } else if (a.type === BOOLEAN_LITERAL && b.type === BOOLEAN_LITERAL) {
    return compare_by_name(a.raw, b.raw);
  } else if (a.type === BOOLEAN_LITERAL) {
    return -1;
  } else if (b.type === BOOLEAN_LITERAL) {
    return 1;
  } else if (a.type === NUMBER_LITERAL && b.type === NUMBER_LITERAL) {
    return a.value - b.value;
  } else if (a.type === NUMBER_LITERAL) {
    return -1;
  } else if (b.type === NUMBER_LITERAL) {
    return 1;
  } else {
    return compare_by_name(a.raw, b.raw);
  }
}

function compare_by_object(a, b) {
  const a_name =
    a.key.type === IDENTIFIER
      ? a.key.name
      : a.key.type === LITERAL ? a.key.value : null;
  const b_name =
    b.key.type === IDENTIFIER
      ? b.key.name
      : b.key.type === LITERAL ? b.key.value : null;
  return compare_by_name(a_name, b_name);
}

function compare_by_imported(a, b) {
  const a_name = a.type === IMPORT_SPECIFIER ? a.imported.name : null;
  const b_name = b.type === IMPORT_SPECIFIER ? b.imported.name : null;

  return compare_by_name(a_name, b_name);
}

function compare_by_attribute(a, b) {
  const a_name = a.type === JSX_ATTRIBUTE ? a.name.name : null;
  const b_name = b.type === JSX_ATTRIBUTE ? b.name.name : null;

  return compare_by_name(a_name, b_name);
}

function compare_by_case(a, b) {
  if (a.type !== SWITCH_CASE || b.type !== SWITCH_CASE) {
    return 0;
  }
  if (a === null || a.test === undefined) {
    return 1;
  } else if (b === null || b.test === undefined) {
    return -1;
  } else if (a === null || a.test === null) {
    return 1;
  } else if (b === null || b.test === null) {
    return -1;
  } else if (typeof a.test.value !== typeof b.test.value) {
    if (typeof a.test.value === "boolean") {
      return -1;
    } else if (typeof b.test.value === "boolean") {
      return 1;
    } else if (typeof a.test.value === "number") {
      return -1;
    } else if (typeof b.test.value === "number") {
      return 1;
    }
  } else if (typeof a.test.value === typeof b.test.value) {
    if (typeof a.test.value === "boolean") {
      if (a.test.value === b.test.value) {
        return 0;
      } else if (a.test.value < b.test.value) {
        return -1;
      } else {
        return 1;
      }
    } else if (typeof a.test.value === "number") {
      return a.test.value - b.test.value;
    } else {
      return compare_by_name(a.test.value, b.test.value);
    }
  } else {
    return compare_by_name(a.test.value, b.test.value);
  }
}

function read_file(filepath) {
  if (!fs.existsSync(filepath)) {
    console.warn(`WARNING: ${filepath} does not exist`);
    return null;
  }
  const source_code = fs.readFileSync(filepath, "utf8");
  if (!source_code) {
    return null;
  }
  return source_code;
}

function parse_cmd_args() {
  const parser = new ArgumentParser({
    version: version,
    addHelp: true,
    description: "Abcify sort commutative expression",
  });

  parser.addArgument("--save", {
    help: "save the output to the input",
    defaultValue: 0,
    action: "storeTrue",
    type: "int",
    nargs: 0,
  });
  parser.addArgument("--imports", {
    help: "sort import object destructuring by name",
    defaultValue: 1,
    action: "store",
    type: "int",
    nargs: "?",
  });
  parser.addArgument("--objects", {
    help: "sort object literal by key",
    defaultValue: 1,
    action: "store",
    type: "int",
    nargs: "?",
  });
  parser.addArgument("--destructures", {
    help: "sort object destructuring by key",
    defaultValue: 1,
    action: "store",
    type: "int",
    nargs: "?",
  });
  parser.addArgument("--attributes", {
    help: "sort jsx attribute by name",
    defaultValue: 1,
    action: "store",
    type: "int",
    nargs: "?",
  });
  parser.addArgument("--shapes", {
    help: "sort flow object type (shapes)",
    defaultValue: 1,
    action: "store",
    type: "int",
    nargs: "?",
  });
  parser.addArgument("--enums", {
    help: "sort flow union types (enums)",
    defaultValue: 1,
    action: "store",
    type: "int",
    nargs: "?",
  });
  parser.addArgument("--cases", {
    help: "sort switch case statement",
    defaultValue: 1,
    action: "store",
    type: "int",
    nargs: "?",
  });
  parser.addArgument("filenames", {
    help: "input file names to be sorted",
    type: "string",
    nargs: "+",
  });

  const args = parser.parseArgs();
  return args;
}

function abcify(source_code, cli_args) {
  const ast = recast.parse(source_code, {parser: flow_parser});
  const {imports, objects, destructures, attributes} = cli_args;
  const {shapes, enums, cases} = cli_args;

  walk_ast(ast, "visitImportDeclaration", imports, path => {
    path.value.specifiers.sort(compare_by_imported);
  });

  walk_ast(ast, "visitObjectExpression", objects, path => {
    path.value.properties.sort(compare_by_object);
  });

  walk_ast(ast, "visitObjectPattern", destructures, path => {
    path.value.properties.sort(compare_by_object);
  });

  walk_ast(ast, "visitJSXOpeningElement", attributes, path => {
    path.value.attributes.sort(compare_by_attribute);
  });

  walk_ast(ast, "visitObjectTypeAnnotation", shapes, path => {
    path.value.properties.sort(compare_by_object);
  });

  walk_ast(ast, "visitUnionTypeAnnotation", enums, path => {
    path.value.types.sort(compare_by_union);
  });

  walk_ast(ast, "visitSwitchStatement", cases, path => {
    const groups_of_cases = split_switch_cases(path.value.cases);
    const sorted_groups_of_cases = sort_switch_cases(groups_of_cases);
    const sorted_switch_cases = merge_switch_cases(sorted_groups_of_cases);
    path.value.cases = sorted_switch_cases;
  });

  const {code: target_code} = recast.print(ast);
  const sorted_code = target_code.trimRight();
  return sorted_code;
}

function merge_switch_cases(groups_of_cases) {
  const consequent_cases = groups_of_cases
    .map(group => {
      group.cases[group.cases.length - 1].consequent = group.consequent;
      return group.cases;
    })
    .reduce((ans, cases) => {
      ans.push(...cases);
      return ans;
    }, []);
  return consequent_cases;
}

function sort_switch_cases(groups_of_cases) {
  return groups_of_cases.map(group => {
    group.cases.sort(compare_by_case);
    return group;
  });
}

function split_switch_cases(cases) {
  const init = consequent => ({cases: [], consequent});
  const groups_of_cases = cases.reduceRight((ans, switch_case) => {
    const {consequent} = switch_case;
    if (consequent && consequent.length) {
      const last = init(consequent);
      ans.unshift(last);
      switch_case.consequent = [];
    }
    const last = ans[0];
    last.cases.unshift(switch_case);
    return ans;
  }, []);
  return groups_of_cases;
}

function abcify_file(filename, cli_args) {
  const filepath = path.resolve(filename);
  const input = read_file(filepath);
  const output = abcify(input, cli_args);

  const {save} = cli_args;
  if (!save) {
    console.log(output);
  } else {
    fs.writeFileSync(filepath, output);
  }
}

module.exports = {
  BOOLEAN_LITERAL,
  GENERIC,
  IDENTIFIER,
  IMPORT_SPECIFIER,
  JSX_ATTRIBUTE,
  LITERAL,
  NULL,
  NUMBER_LITERAL,
  UNDEFINED,

  abcify,
  abcify_file,
  compare_by_attribute,
  compare_by_imported,
  compare_by_object,
  compare_by_union,
  compare_by_name,
  is_undefined_literal,
  parse_cmd_args,
  read_file,
  walk_ast,
};
