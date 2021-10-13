#nullable enable
using System;
using System.Collections.Generic;
using System.Linq;
using Azure.Deployments.Core.Json;
using Bicep.Core.Parsing;
using Bicep.Core.Syntax;

namespace ConsoleApp1
{
    class Program
    {
        static void Main(string[] args)
        {
            string file = args[0];
            var content = System.IO.File.ReadAllText(file);
            var parser = new Parser(content);
            var ast = parser.Program();
            var testTree = ConvertAst(ast);
            Console.WriteLine("================================================");
            Console.WriteLine(file);
            Console.WriteLine("================================================");
            Console.WriteLine(content);
            Console.WriteLine("------------------------------------------------");
            Console.WriteLine(testTree);
        }

        static string ConvertStringToken(Token t)
        {
            Console.WriteLine($"{t.Text}");
            if (t.Type == TokenType.StringComplete && t.Span.Length == 2)
            {
                // Empty string
                return "";
            }
            if (t.Type == TokenType.StringRightPiece && t.Span.Length == 1)
            {
                // Empty string
                return "";
            }
            if (t.Type == TokenType.StringLeftPiece && t.Span.Length == 1)
            {
                // Empty string
                return "";
            }
            if (t.Type == TokenType.StringMiddlePiece && t.Span.Length == 1)
            {
                // Empty string
                return "";
            }
            return "(stringLiteral)";
        }

        static string ConvertAst(SyntaxBase? node)
        {
            switch (node)
            {
                case null:
                    return "";
                case ImportDeclarationSyntax i:
                    return $"(statement {string.Join("\n", i.Decorators.Select(ConvertAst))} (importDeclaration TODO))";
                case ProgramSyntax p:
                    return $"(program {string.Join("\n", p.Children.Select(ConvertAst))})";
                case Token t:
                    return ConvertTrivia(t.LeadingTrivia) + ConvertTrivia(t.TrailingTrivia);
                case VariableDeclarationSyntax vd:
                    return $"(statement {string.Join("\n", vd.Decorators.Select(ConvertAst))} (variableDeclaration (identifier) {ConvertAst(vd.Value)}))";
                case IdentifierSyntax id:
                    return "(identifier)";
                case StringSyntax s:
                    var parts = new List<string>();
                    for (var i = 0; i < s.SegmentValues.Length; i++)
                    {
                        if (s.SegmentValues[i] != "")
                        {
                            parts.Add("(stringLiteral)");
                        }

                        if (i < s.Expressions.Length)
                        {
                            parts.Add(ConvertAst(s.Expressions[i]));
                        }
                    }
                    return $"(string {string.Join(" ", parts)}) " + ConvertAst(s.StringTokens.Last());
                case FunctionCallSyntax f:
                    return $"(functionCall (variableAccess (identifier)) {string.Join(" ", f.Arguments.Select(ConvertAst))})";
                case InstanceFunctionCallSyntax f:
                    return $"(functionCall (propertyAccess {ConvertAst(f.BaseExpression)} {ConvertAst(f.Name)}) {string.Join(" ", f.Arguments.Select(ConvertAst))})";
                case OutputDeclarationSyntax o:
                    return $"(statement {string.Join("\n", o.Decorators.Select(ConvertAst))} (outputDeclaration (identifier) {ConvertAst(o.Type)} {ConvertAst(o.Value)}))";
                case FunctionArgumentSyntax a:
                    return $"(functionArgument {ConvertAst(a.Expression)})";
                case VariableAccessSyntax v:
                    return "(variableAccess (identifier))";
                case ForSyntax f:
                    return $"(for {ConvertAst(f.VariableSection)} {ConvertAst(f.Expression)} {ConvertAst(f.Body)})";
                case ObjectSyntax o:
                    return $"(object {string.Join(" ", o.Children.Select(ConvertAst))})";
                case ObjectPropertySyntax p:
                    return $"(objectProperty {ConvertAst(p.Key)} {ConvertAst(p.Value)})";
                case TypeSyntax t:
                    return "(type (identifier))";
                case ForVariableBlockSyntax f:
                    return $"(forVariableBlock {ConvertAst(f.IndexVariable)} {ConvertAst(f.ItemVariable)})";
                case ArraySyntax a:
                    return $"(array {string.Join("\n", a.Children.Select(ConvertAst))})";
                case ArrayItemSyntax i:
                    return $"(arrayItem {ConvertAst(i.Value)})";
                case LocalVariableSyntax v:
                    return $"(localVariable (identifier))";
                case ArrayAccessSyntax a:
                    return $"(arrayAccess {ConvertAst(a.BaseExpression)} {ConvertAst(a.IndexExpression)})";
                case ParameterDeclarationSyntax p:
                    return $"(statement {string.Join("\n", p.Decorators.Select(ConvertAst))} (parameterDeclaration {ConvertAst(p.Name)} {ConvertAst(p.Type)} {ConvertAst(p.Modifier)}))";
                case BooleanLiteralSyntax b:
                    return "(booleanLiteral)";
                case PropertyAccessSyntax p:
                    return $"(propertyAccess {ConvertAst(p.BaseExpression)} {ConvertAst(p.PropertyName)})";
                case ParenthesizedExpressionSyntax p:
                    return $"(parenthesizedExpression {ConvertAst(p.Expression)})";
                case BinaryOperationSyntax o:
                    return $"(binaryOperation {ConvertAst(o.LeftExpression)} {ConvertAst(o.RightExpression)})";
                case TernaryOperationSyntax t:
                    return $"(ternaryOperation {ConvertAst(t.ConditionExpression)} {ConvertAst(t.TrueExpression)} {ConvertAst(t.FalseExpression)})";
                case ParameterDefaultValueSyntax p:
                    return $"(parameterDefaultValue {ConvertAst(p.DefaultValue)})";
                case IntegerLiteralSyntax i:
                    return $"(integerLiteral)";
                case ModuleDeclarationSyntax m:
                    return $"(statement {string.Join("\n", m.Decorators.Select(ConvertAst))} (moduleDeclaration {ConvertAst(m.Name)} {ConvertAst(m.Path)} {ConvertAst(m.Value)}))";
                case ResourceDeclarationSyntax r:
                    return $"(statement {string.Join("\n", r.Decorators.Select(ConvertAst))} (resourceDeclaration {ConvertAst(r.Name)} {ConvertAst(r.Type)} {ConvertAst(r.Value)}))";
                case NullLiteralSyntax n:
                    return "(nullLiteral)";
                case TargetScopeSyntax t:
                    return $"(statement {string.Join("\n", t.Decorators.Select(ConvertAst))} (targetScope {ConvertAst(t.Value)}))";
                case DecoratorSyntax d:
                    return $"(decorator {ConvertAst(d.Expression)})";
                case IfConditionSyntax i:
                    return $"(ifCondition {ConvertAst(i.ConditionExpression)} {ConvertAst(i.Body)})";
                case UnaryOperationSyntax u:
                    return $"(unaryOperation {ConvertAst(u.Expression)})";
                case ResourceAccessSyntax r:
                    return $"(resourceAccess {ConvertAst(r.BaseExpression)} {ConvertAst(r.ResourceName)})";
            }

            throw new Exception(node.GetType().ToString());
        }

        static string ConvertTrivia(IEnumerable<SyntaxTrivia> trivia)
        {
            var result = "";
            foreach (var trivium in trivia)
            {
                switch (trivium.Type)
                {
                    case SyntaxTriviaType.MultiLineComment:
                    case SyntaxTriviaType.SingleLineComment:
                        result += " (comment) ";
                        break;
                }
            }

            return result;
        }
    }
}
