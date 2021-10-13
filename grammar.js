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
        program: $ => repeat($.statement),
        statement: $ => seq(repeat($.decorator), $._declaration),
        _declaration: $ => choice($.targetScope, $.variableDeclaration, $.resourceDeclaration, $.parameterDeclaration, $.outputDeclaration, $.moduleDeclaration, $.importDeclaration),
        targetScope: $ => seq("targetScope", $._assignment, $._expression),
        parameterDeclaration: $ => seq("param", $.identifier, $.type, optional($.parameterDefaultValue)),
        parameterDefaultValue: $ => seq($._assignment, $._expression),
        variableDeclaration: $ => seq("var", $.identifier, $._assignment, $._expression),
        outputDeclaration: $ => seq("output", $.identifier, $.type, $._assignment, $._expression),
        resourceDeclaration: $ => seq("resource", $.identifier, $.string, optional("existing"), $._assignment, choice($.ifCondition, $.object, $.for)),
        moduleDeclaration: $ => seq('module', $.identifier, $.string, $._assignment, choice($.ifCondition, $.object, $.for)),
        importDeclaration: $ => seq('import', $.identifier, 'from', $.identifier, $.object),
        type: $ => $.identifier,

        _assignment: $ => "=",
        _expression: $ => choice(
            $._primaryExpression,
            $._memberExpression,
            $.unaryOperation,
            $.binaryOperation,
            $.ternaryOperation,
        ),
        _primaryExpression: $ => choice($._literalValue, $.string, alias($.multilineString, $.string), $.object, $.for, $.array, $.parenthesizedExpression, $.functionCall, $.variableAccess),
        variableAccess: $ => $.identifier,
        localVariable: $ => $.identifier,
        functionCall: $ => prec.left(110, seq($._expression, '(', optional($._arguments), ')')),
        _arguments: $ => seq($.functionArgument, repeat(seq(',', $.functionArgument))),
        functionArgument: $ => $._expression,
        parenthesizedExpression: $ => seq('(', $._expression, ')'),
        _literalValue: $ => choice($.nullLiteral, $.booleanLiteral, $.integerLiteral),
        nullLiteral: $ => "null",
        booleanLiteral: $ => choice("true", "false"),
        integerLiteral: $ => /-?[0-9]+/,
        identifier: $ => choice('resource', /[a-zA-Z_][a-zA-Z0-9_]*/), // TODO support unicode, namespaces
        object: $ => seq('{', repeat(choice($.objectProperty, $.resourceDeclaration)), '}'),
        objectProperty: $ => seq(choice($.identifier, $.string), ':', $._expression),
        ifCondition: $ => seq('if', $.parenthesizedExpression, $.object),
        array: $ => seq('[', repeat(seq($.arrayItem, "\n")), ']'),
        arrayItem: $ => $._expression,

        string: $ => seq("'", optional($._stringContent), "'"),
        _stringContent: $ => seq(repeat1(choice($.escapeSequence, $._interpolation, $.stringLiteral)), optional('$')),
        escapeSequence: $ => token.immediate(choice('\\\\', '\\\'', '\\n', '\\r', '\\t', '\\$', seq('\\u{', /[0-9A-Fa-f]+/, '}'))),
        _interpolation: $ => seq('${', $._expression, '}'),
        stringLiteral: $ => token.immediate(prec(1, /([^'$\\]|\$+[^'{])+/)),
        multilineString: $ => seq("'''", alias($.multilineStringLiteral, $.stringLiteral), /'''+/),
        multilineStringLiteral: $ => token.immediate(prec(1, /([^']*('[^'])?(''[^'])?)+/)),
        for: $ => seq('[', 'for', optional(choice($.forVariableBlock, $.localVariable)), 'in', $._expression, ':', $._forBody, ']'),
        _forBody: $ => choice($._expression, $.ifCondition),
        forVariableBlock: $ => seq('(', $.localVariable, ',', $.localVariable, ')'),
        decorator: $ => seq('@', $.functionCall),

        binaryOperation: $ => choice($._multiplication,
            $._modulo,
            $._division,
            $._addition,
            $._subtraction,
            $._greaterThan,
            $._greaterThanOrEqual,
            $._lessThan,
            $._lessThanOrEqual,
            $._equals,
            $._notEquals,
            $._equalsInsensitive,
            $._notEqualsInsensitive,
            $._logicalAnd,
            $._logicalOr,
            $._coalesce,
        ),            
        _memberExpression: $ => choice($.propertyAccess, $.arrayAccess, $.resourceAccess),
        propertyAccess: $ => prec.left(120, seq($._expression, '.', $.identifier)),
        arrayAccess: $ => prec.left(120, seq($._expression, '[', $._expression, ']')),
        resourceAccess: $ => prec.left(120, seq($._expression, '::', $.identifier)),

        _multiplication: $ => prec.left(100, seq($._expression, '*', $._expression)),
        _modulo: $ => prec.left(100, seq($._expression, '%', $._expression)),
        _division: $ => prec.left(100, seq($._expression, '/', $._expression)),

        _addition: $ => prec.left(90, seq($._expression, '+', $._expression)),
        _subtraction: $ => prec.left(90, seq($._expression, '-', $._expression)),

        _greaterThan: $ => prec.left(80, seq($._expression, '>', $._expression)),
        _greaterThanOrEqual: $ => prec.left(80, seq($._expression, '>=', $._expression)),
        _lessThan: $ => prec.left(80, seq($._expression, '<', $._expression)),
        _lessThanOrEqual: $ => prec.left(80, seq($._expression, '<=', $._expression)),

        _equals: $ => prec.left(70, seq($._expression, '==', $._expression)),
        _notEquals: $ => prec.left(70, seq($._expression, '!=', $._expression)),
        _equalsInsensitive: $ => prec.left(70, seq($._expression, '=~', $._expression)),
        _notEqualsInsensitive: $ => prec.left(70, seq($._expression, '!~', $._expression)),

        _logicalAnd: $ => prec.left(50, seq($._expression, '&&', $._expression)),
        _logicalOr: $ => prec.left(40, seq($._expression, '||', $._expression)),
        _coalesce: $ => prec.left(30, seq($._expression, '??', $._expression)),
        
        ternaryOperation: $ => $._conditionalExpression,
        _conditionalExpression: $ => prec.right(35, seq($._expression, '?', $._expression, ':', $._expression)),

        unaryOperation: $ => choice($._negation, $._minus),
        _negation: $ => prec.right(110, seq('!', $._expression)),
        _minus: $ => prec.right(110, seq('-', $._expression)),

        comment: $ => choice(/\/\/[^\r\n]*/, seq(
            '/*',
            /[^*]*\*+([^/*][^*]*\*+)*/,
            '/'
          ))

    }
})