/*
 * @file Dynamic templating and scripting language for Go. Ideal for embedding dynamic content with Go applications
 * @author Serhii Cho <serhiicho@protonmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  QUESTION: 1,
  EQ: 2,
  NOT_EQ: 2,
  LTHAN: 3,
  GTHAN: 3,
  LTHAN_EQ: 3,
  GTHAN_EQ: 3,
  ADD: 4,
  SUB: 4,
  DIV: 4,
  MOD: 5,
  MUL: 5,
  DOT: 6,
  CALL: 7,
  PREFIX: 8,
  LPAREN: 9,
  LBRACKET: 10,
  INC: 11,
  DEC: 11,
}

module.exports = grammar({
  name: 'textwire',

  // the name of a token that will match keywords to the
  // keyword extraction optimization
  word: $ => $.identifier,

  externals: $ => [$.text],

  extras: $ => [/\s/, $.comment],

  rules: {
    program: $ => repeat($._definition),

    _definition: $ =>
      choice(
        $.text,
        choice(
          $.brace_statement,
          $.dump_statement,
          $.component_statement,
          $.insert_statement,
          $.each_statement,
          $.if_statement,
        ),
      ),

    brace_statement: $ =>
      seq('{{', $.statement, optional(seq(';', $.statement)), '}}'),

    statement: $ => choice($.assign_statement, $.expression_statement),

    expression_statement: $ => $._expression,

    assign_statement: $ =>
      seq(field('name', $.identifier), '=', field('value', $._expression)),

    block_statement: $ => repeat1($._definition),

    control_flow_block_statement: $ =>
      repeat1(
        choice(
          $.break_statement,
          $.continue_statement,
          $.break_if_statement,
          $.continue_if_statement,
          $._definition,
        ),
      ),

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
        optional(seq(',', field('argument', $.object_literal))),
        ')',
      ),

    insert_statement: $ =>
      seq(
        '@insert',
        '(',
        field('name', $._expression),
        optional(seq(',', field('value', $._expression))),
        ')',
      ),

    dump_statement: $ =>
      seq('@dump', '(', field('arguments', $.argument_list), ')'),

    each_statement: $ =>
      seq(
        '@each',
        '(',
        field('var', $.identifier),
        'in',
        field('array', $._expression),
        ')',
        optional(field('block', $.control_flow_block_statement)),
        optional(
          seq('@else', field('alternative', $.control_flow_block_statement)),
        ),
        '@end',
      ),

    else_if_statement: $ =>
      seq(
        '@elseif',
        '(',
        field('condition', $._expression),
        ')',
        field('consequence', $.block_statement),
      ),

    else_statement: $ => seq('@else', $.block_statement),

    if_statement: $ =>
      seq(
        '@if',
        '(',
        field('condition', $._expression),
        ')',
        optional(field('consequence', $.block_statement)),
        repeat(field('alternative', $.else_if_statement)),
        optional(field('alternative', $.else_statement)),
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
        $.dot_expression,
        $.object_literal,
        $.array_literal,
      ),

    prefix_expression: $ =>
      prec(PREC.PREFIX, choice($.prefix_minus, $.prefix_not)),

    prefix_minus: $ => prec(PREC.PREFIX + 1, seq('-', $._expression)),
    prefix_not: $ => prec(PREC.PREFIX + 1, seq('!', $._expression)),

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
        PREC.CALL,
        seq(
          field('receiver', $._expression),
          '.',
          field('function', $.identifier),
          '(',
          optional(field('arguments', $.argument_list)),
          ')',
        ),
      ),

    dot_expression: $ =>
      prec(
        PREC.DOT,
        seq(field('left', $._expression), '.', field('key', $._expression)),
      ),

    number_int: _ => /\d+/,
    number_float: _ => /\d+\.\d+/,
    boolean_literal: _ => choice('true', 'false'),
    nil_literal: _ => 'nil',

    array_literal: $ =>
      seq(
        '[',
        optional(seq($._expression, repeat(seq(',', $._expression)))),
        ']',
      ),

    pair: $ =>
      choice(
        seq(field('key', $.string_literal), ':', field('value', $._expression)),
        field('key', $.identifier),
      ),

    pairs: $ => seq($.pair, optional(repeat(seq(',', $.pair)))),

    object_literal: $ => seq('{', optional($.pairs), '}'),

    comment: _ => token(choice(seq('//', /.*/))),
  },
})
