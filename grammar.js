/*
 * @file Dynamic templating and scripting language for Go. Ideal for embedding dynamic content with Go applications
 * @author Serhii Cho <serhiicho@protonmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const TERNARY = 1 // a ? b = c
const EQ = 2 // ==
const LESS_GREATER = 3 // > or <
const SUM = 4 // +
const PRODUCT = 5 // *
const MEMBER_ACCESS = 6 // <expr>.<ident>
const PREFIX = 7 // -X or !X
const CALL = 8 // myFunction(X)
const INDEX = 9 // array[index]
const POSTFIX = 10 // X++ or X--

const PREC = {
  QUESTION: TERNARY,
  EQ: EQ,
  NOT_EQ: EQ,
  LTHAN: LESS_GREATER,
  GTHAN: LESS_GREATER,
  LTHAN_EQ: LESS_GREATER,
  GTHAN_EQ: LESS_GREATER,
  ADD: SUM,
  SUB: SUM,
  DIV: PRODUCT,
  MOD: PRODUCT,
  MUL: PRODUCT,
  LPAREN: CALL,
  DOT: MEMBER_ACCESS,
  LBRACKET: INDEX,
  INC: POSTFIX,
  DEC: POSTFIX,
}

module.exports = grammar({
  name: 'textwire',

  // the name of a token that will match keywords to the
  // keyword extraction optimization
  word: $ => $.identifier,

  externals: $ => [$.html],

  rules: {
    program: $ => repeat(choice($.html, $._definition)),

    _definition: $ =>
      choice(
        $.brace_statement,
        $.dump_statement,
        $.component_statement,
        $.insert_statement,
        $.each_statement,
        $.if_statement,
      ),

    brace_statement: $ =>
      seq('{{', $.statement, optional(seq(';', $.statement)), '}}'),

    statement: $ => choice($.assign_statement, $.expression_statement),

    expression_statement: $ => $._expression,

    assign_statement: $ =>
      seq(field('name', $.identifier), '=', field('value', $._expression)),

    block_statement: $ => $._definition,

    break_if_statement: $ =>
      seq('@breakIf', '(', field('condition', $._expression), ')'),

    continue_if_statement: $ =>
      seq('@continueIf', '(', field('condition', $._expression), ')'),

    break_statement: _ => '@break',
    continue_statement: _ => '@continue',

    argument_list: $ =>
      seq($._expression, optional(repeat(seq(',', $._expression)))),

    component_statement: $ =>
      seq(
        '@component',
        '(',
        field('name', $._expression),
        optional(seq(',', $._expression)),
        ')',
      ),

    insert_statement: $ =>
      seq(
        '@insert',
        '(',
        field('name', $._expression),
        optional(field('value', seq(',', $._expression))),
        ')',
      ),

    dump_statement: $ => seq('@dump', '(', $.argument_list, ')'),

    each_statement: $ =>
      seq(
        '@each',
        '(',
        field('var', $.identifier),
        'in',
        field('array', $._expression),
        ')',
        $.block_statement,

        optional(seq('@else', field('alternative', $.block_statement))),

        '@end',
      ),

    if_statement: $ =>
      seq(
        '@if',
        '(',
        field('condition', $._expression),
        ')',
        field('consequence', $.block_statement),
        optional(seq('@else', field('alternative', $.block_statement))),
        '@end',
      ),

    identifier: _ => /[A-Za-z_][A-Za-z_0-9]*/,

    string_literal: _ => choice(seq('"', /[^"]*/, '"'), seq("'", /[^']*/, "'")),

    _expression: $ =>
      choice(
        $.identifier,
        $.number_int,
        $.number_int,
        $.boolean_literal,
        $.prefix_expression,
        $.infix_expression,
        $.string_literal,
        $.array_literal,
        $.call_expression,
      ),

    prefix_expression: $ => prec(PREFIX, choice($.prefix_minus, $.prefix_not)),

    prefix_minus: $ => prec(PREFIX + 1, seq('-', $._expression)),
    prefix_not: $ => prec(PREFIX + 1, seq('!', $._expression)),

    infix_expression: $ =>
      choice($.multiply, $.modulo, $.divide, $.minus, $.plus),

    multiply: $ =>
      prec.left(
        PREC.MUL,
        seq(
          field('left', $._expression),
          field('operator', '*'),
          field('right', $._expression),
        ),
      ),

    modulo: $ =>
      prec.left(
        PREC.MOD,
        seq(
          field('left', $._expression),
          field('operator', '%'),
          field('right', $._expression),
        ),
      ),

    divide: $ =>
      prec.left(
        PREC.DIV,
        seq(
          field('left', $._expression),
          field('operator', '/'),
          field('right', $._expression),
        ),
      ),

    minus: $ =>
      prec.left(
        PREC.SUB,
        seq(
          field('left', $._expression),
          field('operator', '-'),
          field('right', $._expression),
        ),
      ),

    plus: $ =>
      prec.left(
        PREC.ADD,
        seq(
          field('left', $._expression),
          field('operator', '+'),
          field('right', $._expression),
        ),
      ),

    call_expression: $ =>
      prec(
        PREC.DOT,
        seq(
          field('receiver', $._expression),
          '.',
          field('function', $.identifier),
          '(',
          optional(field('arguments', repeat(seq(',', $._expression)))),
          ')',
        ),
      ),

    number_int: _ => /\d+/,
    number_float: _ => /\d+\.\d+/,
    boolean_literal: _ => choice('true', 'false'),

    array_literal: $ =>
      seq(
        '[',
        optional(seq($._expression, repeat(seq(',', $._expression)))),
        ']',
      ),
  },
})
