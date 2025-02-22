/**
 * @file Dynamic templating and scripting language for Go. Ideal for embedding dynamic content with Go applications
 * @author Serhii Cho <serhiicho@protonmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "textwire",

  rules: {
    source_file: $ => repeat($.injection),

    injection: $ => seq(
      '{{',
      $.statement,
      '}}',
    ),

    statement: $ => choice(
      $.assign_statement,
      $.block_statement,
    ),

    assign_statement: $ => seq(
      $.identifier,
      '=',
      $.expression,
    ),

    block_statement: $ => seq(
      '{',
      repeat($.statement),
      '}',
    ),

    break_if_statement: $ => seq(
      '@breakIf(',
      $.expression,
      ')',
    ),

    break_statement: _ => '@break',

    call_expression: $ => seq(
      $.identifier,
      '.(',
      optional($.arguments),
      ')',
    ),

    expression: $ => choice(
      $.identifier,
      $.number_int,
      $.number_float,
      $.binary_expression,
    ),

    binary_expression: $ => choice(
      seq($._expression, '+', $._expression),
      seq($._expression, '-', $._expression),
      seq($._expression, '*', $._expression),
      seq($._expression, '/', $._expression),
      seq($._expression, '%', $._expression),
    ),

    identifier: $ => /[a-z]+/,
    number_int: $ => /\d+/,
    number_float: $ => /\d+\.\d+/,
  }
});

