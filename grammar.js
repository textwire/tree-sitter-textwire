/*
 * @file Dynamic templating and scripting language for Go. Ideal for embedding dynamic content with Go applications
 * @author Serhii Cho <serhiicho@protonmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "textwire",

  // the name of a token that will match keywords to the
  // keyword extraction optimization
  word: $ => $.identifier,

  rules: {
    program: $ => repeat($._definition),

    _definition: $ => choice(
      $.brace_statement,
      $.dump_statement,
      $.component_statement,
      $.each_statement,
      //$.html,
    ),

    brace_statement: $ => seq(
      '{{',
      $.statement,
      '}}',
    ),

    html: _ => repeat1(choice(
      token(prec(-1, /</)),
      token(prec(1, /[^\s<][^<]*/)),
    )),

    statement: $ => choice(
      $.assign_statement,
      $.block_statement,
      $.string_literal,
      $.expression_statement,
    ),

    expression_statement: $ => $._expression,

    assign_statement: $ => seq(
      field('name', $.identifier),
      '=',
      field('value', $._expression),
    ),

    block_statement: $ => $._definition,

    break_if_statement: $ => seq(
      '@breakIf(',
      field('condition', $._expression),
      ')',
    ),

    continue_if_statement: $ => seq(
      '@continueIf(',
      field('condition', $._expression),
      ')',
    ),

    break_statement: _ => '@break',
    continue_statement: _ => '@continue',

    dot_expression: $ => seq(
      $.identifier,
      '.(',
      optional($.argument_list),
      ')',
    ),

    argument_list: $ => seq(
      $._expression,
      optional(repeat(seq(',', $._expression))),
    ),

    component_statement: $ => seq(
      '@component(',
      field('name', $.string_literal),
      optional(seq(',', $._expression)),
      ')',
    ),

    dump_statement: $ => seq(
      '@dump(',
      $.argument_list,
      ')',
    ),

    each_statement: $ => seq(
      '@each(',
      field('var', $.identifier),
      'in',
      field('array', $._expression),
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

    identifier: _ => /[A-Za-z_][A-Za-z_0-9]*/,

    string_literal: _ => choice(
      seq('"', /[^"]*/, '"'),
      seq("'", /[^']*/, "'"),
    ),

    _expression: $ => choice(
      $.identifier,
      $.number_int,
      $.number_int,
      $.boolean_literal,
      $.prefix_expression,
      $.infix_expression,
    ),

    prefix_expression: $ => prec(
      7,
      choice(
        $.prefix_minus,
        $.prefix_not,
      ),
    ),

    prefix_minus: $ => prec(8, seq("-", $._expression)),
    prefix_not: $ => prec(8, seq("!", $._expression)),

    infix_expression: $ => choice(
      $.multiply,
      $.modulo,
      $.divide,
      $.minus,
      $.plus,
    ),

    multiply: $ => prec.left(
      6,
      seq(
        $._expression,
        '*',
        $._expression,
      ),
    ),

    modulo: $ => prec.left(
      6,
      seq(
        $._expression,
        '%',
        $._expression,
      ),
    ),

    divide: $ => prec.left(
      6,
      seq(
        $._expression,
        '/',
        $._expression,
      ),
    ),

    minus: $ => prec.left(
      5,
      seq(
        $._expression,
        '-',
        $._expression,
      ),
    ),

    plus: $ => prec.left(
      5,
      seq(
        $._expression,
        '+',
        $._expression,
      ),
    ),

    number_int: _ => /\d+/,
    number_float: _ => /\d+\.\d+/,
    boolean_literal: _ => choice('true', 'false'),
  }
});

