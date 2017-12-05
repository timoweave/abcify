export default transform_commutative_expressions;

function transform_commutative_expressions(babel) {
  const {types: t} = babel;

  return {
    name: "ast-transform",
    visitor: {
      UnionTypeAnnotation(path) {
        path.node.types.sort(ascend([literal]));
      },
      ObjectTypeAnnotation(path) {
        path.node.properties.sort(ascend([identifier, literal]));
      },
      ObjectPattern(path) {
        path.node.properties.sort(ascend([identifier]));
      },
      ObjectExpression(path) {
        path.node.properties.sort(ascend([identifier, literal]));
      },
      JSXOpeningElement(path) {
        path.node.attributes.sort(ascend([identifier]));
      },
      ImportDeclaration(path) {
        path.node.specifiers.sort(ascend([specifier]));
      },
    },
  };
}

function ascend(criterias = []) {
  return (left, right) => {
    const first = obj => (ans, criteria) => {
      const j = ans !== null ? ans : criteria(obj);
      return j;
    };

    const [a, b] = [
      criterias.reduce(first(left), null),
      criterias.reduce(first(right), null),
    ];
    if (a === "undefined") {
      return -1;
    }
    if (b === "undefined") {
      return 1;
    }
    const specials = ["null", "void"];
    if (specials.includes(a)) {
      return -1;
    }
    if (specials.includes(b)) {
      return 1;
    }
    if (typeof a === typeof b) {
      if (typeof a !== "object") {
        return a === b ? 0 : a < b ? -1 : 1;
      }
    }
    if (typeof a === "boolean") {
      return -1;
    }
    if (typeof b === "boolean") {
      return 1;
    }
    if (typeof a === "number") {
      return -1;
    }
    if (typeof b === "number") {
      return 1;
    }
    const x = JSON.stringify(a);
    const y = JSON.stringify(b);
    return x === y ? 0 : x < y ? -1 : 1;
  };
}

function specifier(a = null) {
  const types = ["ImportSpecifier"];
  const {type = null} = a || {};
  if (a === null || !types.includes(type)) {
    return null;
  }

  const {
    imported: {name: imported = null} = {},
    local: {name: local = null} = {},
  } = a;
  return [imported, local];
}

function literal(a = null) {
  const types = [
    "ObjectProperty",
    "StringLiteral",
    "NumericLiteral",
    "BooleanLiteral",
    "NullLiteral",

    "ObjectTypeProperty",
    "StringLiteralTypeAnnotation",
    "NumberLiteralTypeAnnotation",
    "BooleanLiteralTypeAnnotation",
    "NullLiteralTypeAnnotation",

    "GenericTypeAnnotation",
    "VoidTypeAnnotation",
  ];
  const {type = null} = a || {};

  if (a === null || !types.includes(type)) {
    return null;
  } else if (["ObjectProperty", "ObjectTypeProperty"].includes(type)) {
    return literal(a.key);
  } else if (["GenericTypeAnnotation"].includes(type)) {
    return identifier(a.id); // undefined
  } else if (["VoidTypeAnnotation"].includes(type)) {
    return "void";
  } else if (["NullLiteralTypeAnnotation"].includes(type)) {
    return "null";
  }
  const {value = null} = a || {};
  return value;
}

function identifier(a = null) {
  const types = [
    "ObjectProperty",
    "Identifier",
    "JSXIdentifier",
    "JSXAttribute",

    "ObjectTypeProperty",
  ];
  const {type = null} = a || {};

  if (a === null || !types.includes(type)) {
    return null;
  } else if (["ObjectProperty", "ObjectTypeProperty"].includes(type)) {
    return identifier(a.key);
  } else if (type === "JSXAttribute") {
    return identifier(a.name);
  }
  const {name = null, value = null} = a || {};
  return name || value;
}
