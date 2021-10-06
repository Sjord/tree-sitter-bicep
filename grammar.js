module.exports = grammar({
    name: 'bicep',
    extras: $ => [
        /[\s]/
    ],
    conflicts: $ => [
        [$.variableAccess, $.functionCall]
    ],
    rules: {
        program: $ => repeat($.declarationOrToken),
        declarationOrToken: $ => choice($.declaration), // or newline, or eof
        declaration: $ => choice($.targetScope, $.variableDeclaration, $.resourceDeclaration),// $.parameterDeclaration, $.outputDeclaration, $.moduleDeclaration,  $.importDeclaration), // handle decorators 
        targetScope: $ => seq("targetScope", $.assignment, $.expression),
        // parameterDeclaration: $ => seq("param", $.identifier, $.parameterType, optional($.parameterDefaultValue)),
        // parameterDefaultValue: $ => seq($.assignment, $.expression),
        variableDeclaration: $ => seq("var", $.identifier, $.assignment, $.expression),
        // outputDeclaration: $ => seq("output", $.identifier, $.outputType, $.assignment, $.expression),
        resourceDeclaration: $ => seq("resource", $.identifier, $.interpolableString, optional("existing"), $.assignment, choice($.ifCondition, $.object, $.forExpression)), 

        assignment: $ => "=",
        expression: $ => $.primaryExpression,
        primaryExpression: $ => choice($.literalValue, $.interpolableString, $.multilineString, $.object, $.forExpression, $.array, $.parenthesizedExpression, $.functionCall, $.variableAccess),
        variableAccess: $ => $.identifier,
        functionCall: $ => seq($.identifier, '(', /* $.functionCallArguments,*/ ')'),
        parenthesizedExpression: $ => seq('(', $.expression, ')'),
        literalValue: $ => choice("null", "true", "false", /[0-9]/),
        identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/, // TODO support unicode
        object: $ => seq('{', repeat($.objectProperty), '}'),
        objectProperty: $ => seq($.identifier, ':', $.expression),
        ifCondition: $ => seq('if', $.parenthesizedExpression, $.object),
        array: $ => seq('[', repeat($.expression), ']'),
        interpolableString: $ => seq("'", /[^']*/, "'"), // TODO
        multilineString: $ => seq("'''", /[^']*/, "'''"), // TODO
        forExpression: $ => seq('[', 'for', optional(choice($.forVariableBlock, $.identifier)), 'in', $.expression, ':', $.forBody, ']'),
        forVariableBlock: $ => seq('(', $.identifier, ',', $.identifier, ')'),
        forBody: $ => $.expression, // TODO
    }
})