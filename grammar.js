module.exports = grammar({
    name: 'bicep',
    extras: $ => [
        /[\s]/
    ],
    conflicts: $ => [
        [$.variableAccess, $.functionCall]
    ],
    rules: {
        program: $ => repeat($.decoratedDeclaration),
        decoratedDeclaration: $ => seq(repeat($.decorator), choice($.declaration)), // or newline, or eof
        declaration: $ => choice($.targetScope, $.variableDeclaration, $.resourceDeclaration, $.parameterDeclaration, $.outputDeclaration, $.moduleDeclaration, $.importDeclaration), // handle decorators 
        targetScope: $ => seq("targetScope", $.assignment, $.expression),
        parameterDeclaration: $ => seq("param", $.identifier, $.parameterType, optional($.parameterDefaultValue)),
        parameterDefaultValue: $ => seq($.assignment, $.expression),
        variableDeclaration: $ => seq("var", $.identifier, $.assignment, $.expression),
        outputDeclaration: $ => seq("output", $.identifier, $.outputType, $.assignment, $.expression),
        resourceDeclaration: $ => seq("resource", $.identifier, $.interpolableString, optional("existing"), $.assignment, choice($.ifCondition, $.object, $.forExpression)), 
        parameterType: $ => $.identifier, // TODO split this up?
        outputType: $ => $.identifier, // TODO split this up?
        moduleDeclaration: $ => seq('module', $.identifier, $.interpolableString, $.assignment, choice($.ifCondition, $.object, $.forExpression)),
        importDeclaration: $ => seq('import', $.identifier, 'from', $.identifier, $.object),

        assignment: $ => "=",
        expression: $ => choice(
            $.primaryExpression,
            $.memberExpression,
            $.multiplication,
            $.modulo,
            $.division,
            $.addition,
            $.subtraction,
            $.greaterThan,
            $.greaterThanOrEqual,
            $.lessThan,
            $.lessThanOrEqual,
            $.equals,
            $.notEquals,
            $.equalsInsensitive,
            $.notEqualsInsensitive,
            $.logicalAnd,
            $.logicalOr,
            $.conditionalExpression,
            $.coalesce,
            $.negation,
            $.minus
        ),
        primaryExpression: $ => choice($.literalValue, $.interpolableString, $.multilineString, $.object, $.forExpression, $.array, $.parenthesizedExpression, $.functionCall, $.variableAccess),
        variableAccess: $ => $.identifier,
        functionCall: $ => seq($.identifier, '(', repeat($.expression), ')'),
        parenthesizedExpression: $ => seq('(', $.expression, ')'),
        literalValue: $ => choice("null", "true", "false", /-?[0-9]+/),
        identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/, // TODO support unicode, namespaces
        object: $ => seq('{', repeat($.objectProperty), '}'),
        objectProperty: $ => seq($.identifier, ':', $.expression),
        ifCondition: $ => seq('if', $.parenthesizedExpression, $.object),
        array: $ => seq('[', repeat($.expression), ']'),
        interpolableString: $ => seq("'", $._stringContent, "'"), // TODO
        _stringContent: $ => repeat1(choice($.escapeSequence, $.interpolation, $.stringLiteral)), // TODO support empty stirngs
        escapeSequence: $ => choice('\\\\', '\\\'', '\\n', '\\r', '\\t', '\\$'), // TODO add unicode
        interpolation: $ => seq('${', $.expression, '}'),
        stringLiteral: $ => /[^'$]+/,
        multilineString: $ => seq("'''", /[^']*/, "'''"), // TODO
        forExpression: $ => seq('[', 'for', optional(choice($.forVariableBlock, $.identifier)), 'in', $.expression, ':', $.forBody, ']'),
        forVariableBlock: $ => seq('(', $.identifier, ',', $.identifier, ')'),
        forBody: $ => $.expression, // TODO
        decorator: $ => seq('@', $.functionCall),

        memberExpression: $ => choice($.propertyAccess, $.arrayAccess),
        propertyAccess: $ => prec.left(110, seq($.expression, '.', $.identifier)),
        arrayAccess: $ => prec.left(110, seq($.expression, '[', $.expression, ']')),

        multiplication: $ => prec.left(100, seq($.expression, '*', $.expression)),
        modulo: $ => prec.left(100, seq($.expression, '%', $.expression)),
        division: $ => prec.left(100, seq($.expression, '/', $.expression)),

        addition: $ => prec.left(90, seq($.expression, '+', $.expression)),
        subtraction: $ => prec.left(90, seq($.expression, '-', $.expression)),

        greaterThan: $ => prec.left(80, seq($.expression, '>', $.expression)),
        greaterThanOrEqual: $ => prec.left(80, seq($.expression, '>=', $.expression)),
        lessThan: $ => prec.left(80, seq($.expression, '<', $.expression)),
        lessThanOrEqual: $ => prec.left(80, seq($.expression, '<=', $.expression)),

        equals: $ => prec.left(70, seq($.expression, '==', $.expression)),
        notEquals: $ => prec.left(70, seq($.expression, '!=', $.expression)),
        equalsInsensitive: $ => prec.left(70, seq($.expression, '=~', $.expression)),
        notEqualsInsensitive: $ => prec.left(70, seq($.expression, '!~', $.expression)),

        logicalAnd: $ => prec.left(50, seq($.expression, '&&', $.expression)),
        logicalOr: $ => prec.left(40, seq($.expression, '||', $.expression)),
        conditionalExpression: $ => prec.right(35, seq($.expression, '?', $.expression, ':', $.expression)),
        coalesce: $ => prec.left(30, seq($.expression, '??', $.expression)),

        negation: $ => prec.right(110, seq('!', $.expression)),
        minus: $ => prec.right(110, seq('-', $.expression)),

    }
})