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
      field('name', $.identifier),
      '=',
      field('value', $.expression),
    ),

    block_statement: $ => seq(
      field('statements', repeat($.statement)),
    ),

    break_if_statement: $ => seq(
      '@breakIf(',
      field('condition', $.expression),
      ')',
    ),

    continue_if_statement: $ => seq(
      '@continueIf(',
      field('condition', $.expression),
      ')',
    ),

    break_statement: _ => '@break',
    continue_statement: _ => '@continue',

    dot_expression: $ => seq(
      $.identifier,
      '.(',
      optional($.arguments),
      ')',
    ),

    arguments: $ => seq(
      $.argument,
      optional(repeat(seq(',', $.argument))),
    ),

    component_statement: $ => seq(
      '@component(',
      field('name', $.string_literal),
      optional(seq(',', $.argument)),
      ')',
    ),

    dump_statement: $ => seq(
      '@dump(',
      $.arguments,
      ')',
    ),

    each_statement: $ => seq(
      '@each(',
      field('var', $.identifier),
      ' in ',
      field('array', $.expression),
      ')',
      $.block_statement,

      optional(
        seq(
          '@else',
          field('alternative', $.block_statement),
        ),
      ),

      '@end',
    ),

    identifier: _ => /[a-z_]+/,

    string_literal: _ => choice(
      seq('"', /[^"]*/, '"'),
      seq("'", /[^']*/, "'"),
    ),

    // TODO: check below =============================
    expression: $ => choice(
      $.identifier,
      $.number_int,
      $.number_float,
      $.binary_expression,
    ),

    argument: $ => $.expression,

    binary_expression: $ => choice(
      seq($._expression, '+', $._expression),
      seq($._expression, '-', $._expression),
      seq($._expression, '*', $._expression),
      seq($._expression, '/', $._expression),
      seq($._expression, '%', $._expression),
    ),

    number_int: $ => /\d+/,
    number_float: $ => /\d+\.\d+/,
  }
});

