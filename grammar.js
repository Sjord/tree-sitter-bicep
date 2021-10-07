module.exports = grammar({
    name: 'bicep',
    extras: $ => [
        $.comment,
        /[\s]/
    ],
    conflicts: $ => [
        [$.variableAccess, $.functionCall]
    ],
    rules: {
        program: $ => repeat($._decoratedDeclaration),
        _decoratedDeclaration: $ => seq(repeat($.decorator), choice($._declaration)), // or newline, or eof
        _declaration: $ => choice($.targetScope, $.variableDeclaration, $.resourceDeclaration, $.parameterDeclaration, $.outputDeclaration, $.moduleDeclaration, $.importDeclaration), // handle decorators 
        targetScope: $ => seq("targetScope", $.assignment, $._expression),
        parameterDeclaration: $ => seq("param", $.identifier, $.type, optional($.parameterDefaultValue)),
        parameterDefaultValue: $ => seq($.assignment, $._expression),
        variableDeclaration: $ => seq("var", $.identifier, $.assignment, $._expression),
        outputDeclaration: $ => seq("output", $.identifier, $.type, $.assignment, $._expression),
        resourceDeclaration: $ => seq("resource", $.identifier, $.interpolableString, optional("existing"), $.assignment, choice($.ifCondition, $.object, $.for)),
        moduleDeclaration: $ => seq('module', $.identifier, $.interpolableString, $.assignment, choice($.ifCondition, $.object, $.for)),
        importDeclaration: $ => seq('import', $.identifier, 'from', $.identifier, $.object),
        type: $ => $.identifier,

        assignment: $ => "=",
        _expression: $ => choice(
            $._primaryExpression,
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
        _primaryExpression: $ => choice($.literalValue, $.interpolableString, $.multilineString, $.object, $.for, $.array, $.parenthesizedExpression, $.functionCall, $.variableAccess),
        variableAccess: $ => $.identifier,
        functionCall: $ => prec.left(110, seq($._expression, '(', optional($.arguments), ')')),
        arguments: $ => seq($._expression, repeat(seq(',', $._expression))),
        parenthesizedExpression: $ => seq('(', $._expression, ')'),
        literalValue: $ => choice("null", "true", "false", /-?[0-9]+/),
        identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/, // TODO support unicode, namespaces
        object: $ => seq('{', repeat(choice($.objectProperty, $.resourceDeclaration)), '}'),
        objectProperty: $ => seq(choice($.identifier, $.interpolableString), ':', $._expression),
        ifCondition: $ => seq('if', $.parenthesizedExpression, $.object),
        array: $ => seq('[', repeat($._expression), ']'),
        interpolableString: $ => seq("'", optional($._stringContent), "'"), // TODO
        _stringContent: $ => repeat1(choice($.escapeSequence, $.interpolation, $.stringLiteral)), // TODO support empty stirngs
        escapeSequence: $ => choice('\\\\', '\\\'', '\\n', '\\r', '\\t', '\\$', seq('\\u{', /[0-9A-Fa-f]+/, '}')),
        interpolation: $ => seq('${', $._expression, '}'),
        stringLiteral: $ => /[^'$\\]+/,
        multilineString: $ => seq("'''", /[^']*/, "'''"), // TODO
        for: $ => seq('[', 'for', optional(choice($.forVariableBlock, $.identifier)), 'in', $._expression, ':', $._forBody, ']'),
        _forBody: $ => choice($._expression, $.ifCondition),
        forVariableBlock: $ => seq('(', $.identifier, ',', $.identifier, ')'),
        decorator: $ => seq('@', $.functionCall),

        memberExpression: $ => choice($.propertyAccess, $.arrayAccess),
        propertyAccess: $ => prec.left(110, seq($._expression, '.', $.identifier)),
        arrayAccess: $ => prec.left(110, seq($._expression, '[', $._expression, ']')),

        multiplication: $ => prec.left(100, seq($._expression, '*', $._expression)),
        modulo: $ => prec.left(100, seq($._expression, '%', $._expression)),
        division: $ => prec.left(100, seq($._expression, '/', $._expression)),

        addition: $ => prec.left(90, seq($._expression, '+', $._expression)),
        subtraction: $ => prec.left(90, seq($._expression, '-', $._expression)),

        greaterThan: $ => prec.left(80, seq($._expression, '>', $._expression)),
        greaterThanOrEqual: $ => prec.left(80, seq($._expression, '>=', $._expression)),
        lessThan: $ => prec.left(80, seq($._expression, '<', $._expression)),
        lessThanOrEqual: $ => prec.left(80, seq($._expression, '<=', $._expression)),

        equals: $ => prec.left(70, seq($._expression, '==', $._expression)),
        notEquals: $ => prec.left(70, seq($._expression, '!=', $._expression)),
        equalsInsensitive: $ => prec.left(70, seq($._expression, '=~', $._expression)),
        notEqualsInsensitive: $ => prec.left(70, seq($._expression, '!~', $._expression)),

        logicalAnd: $ => prec.left(50, seq($._expression, '&&', $._expression)),
        logicalOr: $ => prec.left(40, seq($._expression, '||', $._expression)),
        conditionalExpression: $ => prec.right(35, seq($._expression, '?', $._expression, ':', $._expression)),
        coalesce: $ => prec.left(30, seq($._expression, '??', $._expression)),

        negation: $ => prec.right(110, seq('!', $._expression)),
        minus: $ => prec.right(110, seq('-', $._expression)),

        comment: $ => choice(/\/\/[^\r\n]*/, seq(
            '/*',
            /[^*]*\*+([^/*][^*]*\*+)*/,
            '/'
          ))

    }
})