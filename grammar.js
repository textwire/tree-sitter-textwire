/*
 * @file Dynamic templating and scripting language for Go. Ideal for embedding dynamic content with Go applications
 * @author Serhii Cho <serhiicho@protonmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check
const PREC = {
  TERNARY: 0,
  OR: 1,
  AND: 2,
  EQ: 4,
  NOT_EQ: 4,
  LTHAN: 5,
  GTHAN: 5,
  LTHAN_EQ: 5,
  GTHAN_EQ: 5,
  ADD: 6,
  SUB: 6,
  DIV: 6,
  MOD: 7,
  MUL: 7,
  PREFIX: 10,
  LBRACKET: 12,
  POSTFIX: 13,
  DOT: 15,
  LPAREN: 16,
}

module.exports = grammar({
  name: 'textwire',

  // the name of a token that will match keywords to the
  // keyword extraction optimization
  word: $ => $.ident_expr,

  externals: $ => [$.text, $.open_paren],

  extras: $ => [/\s/, $.comment],

  rules: {
    program: $ => repeat($._chunk),

    _chunk: $ => choice($.embedded, $._directive, $.text),

    _directive: $ =>
      choice(
        $.dump_dir,
        $.comp_dir,
        $.insert_dir,
        $.reserve_dir,
        $.each_dir,
        $.for_dir,
        $.if_dir,
        $.use_dir,
        $._ext_slot_dir,
      ),

    embedded: $ => seq('{{', $._segment, repeat(seq(';', $._segment)), '}}'),

    _segment: $ => choice($._statement, $._expression),

    assign_stmt: $ =>
      seq(field('name', $.ident_expr), '=', field('val', $._expression)),

    block: $ => repeat1($._chunk),

    _comp_slot_dir: $ => choice($.comp_slot_named, $.comp_slot_default_dir),

    _ext_slot_dir: $ => choice($.ext_slot_default, $.ext_slot_named_dir),

    ext_slot_default: _ => '@slot',

    ext_slot_named_dir: $ => seq('@slot', $.open_paren, field('name', $.str_expr), ')'),

    comp_slot_default_dir: $ =>
      seq('@slot', field('block', $.comp_block), '@end'),

    comp_slot_named: $ =>
      seq(
        '@slot',
        $.open_paren,
        field('name', $.str_expr),
        ')',
        field('block', $.comp_block),
        '@end',
      ),

    slotif_dir: $ =>
      seq(
        '@slotif',
        $.open_paren,
        field('cond', $._expression),
        optional(seq(',', field('name', $.str_expr))),
        ')',
        field('block', $.comp_block),
        '@end',
      ),

    comp_block: $ =>
      repeat1(
        choice(
          $.slotif_dir,
          $._comp_slot_dir,
          $.text,
          $.dump_dir,
          $.comp_dir,
          $.insert_dir,
          $.reserve_dir,
          $.each_dir,
          $.for_dir,
          $.if_dir,
          $.use_dir,
        ),
      ),

    control_flow_block: $ =>
      repeat1(
        choice(
          $.break_dir,
          $.continue_dir,
          $.breakif_dir,
          $.continueif_dir,
          $._chunk,
        ),
      ),

    breakif_dir: $ =>
      seq(
        choice('@breakIf', '@breakif'),
        '(',
        field('cond', $._expression),
        ')',
      ),

    continueif_dir: $ =>
      seq(
        choice('@continueIf', '@continueif'),
        '(',
        field('cond', $._expression),
        ')',
      ),

    break_dir: _ => '@break',
    continue_dir: _ => '@continue',

    argument_list: $ =>
      seq($._expression, optional(repeat(seq(',', $._expression)))),

    comp_dir: $ =>
      prec.right(
        seq(
          '@component',
          '(',
          field('name', $._expression),
          optional(seq(',', field('argument', $.obj_expr))),
          ')',
          optional(seq(field('block', $.comp_block), '@end')),
        ),
      ),

    reserve_dir: $ =>
      seq(
        '@reserve',
        '(',
        field('name', $._expression),
        optional(seq(',', field('fallback', $._expression))),
        ')',
      ),

    use_dir: $ => seq('@use', '(', field('name', $.str_expr), ')'),

    _inline_insert_dir: $ =>
      seq(
        '@insert',
        '(',
        field('name', $._expression),
        seq(',', field('val', $._expression)),
        ')',
      ),

    _block_insert_dir: $ =>
      seq(
        '@insert',
        '(',
        field('name', $._expression),
        ')',
        field('block', $.block),
        '@end',
      ),

    insert_dir: $ => choice($._inline_insert_dir, $._block_insert_dir),

    dump_dir: $ => seq('@dump', '(', field('arguments', $.argument_list), ')'),

    each_dir: $ =>
      seq(
        '@each',
        '(',
        field('var', $.ident_expr),
        'in',
        field('array', $._expression),
        ')',
        optional(field('block', $.control_flow_block)),
        optional(seq('@else', field('else_block', $.control_flow_block))),
        '@end',
      ),

    for_dir: $ =>
      seq(
        '@for',
        '(',
        optional(field('init', $._statement)),
        ';',
        optional(field('cond', $._expression)),
        ';',
        optional(field('post', $._statement)),
        ')',
        optional(field('block', $.control_flow_block)),
        optional(seq('@else', field('else_block', $.control_flow_block))),
        '@end',
      ),

    elseif_dir: $ =>
      seq(
        '@elseif',
        '(',
        field('cond', $._expression),
        ')',
        field('if_block', $.block),
      ),

    else_dir: $ => seq('@else', $.block),

    if_dir: $ =>
      seq(
        '@if',
        '(',
        field('cond', $._expression),
        ')',
        optional(field('if_block', $.block)),
        repeat(field('elseif_block', $.elseif_dir)),
        optional(field('else_block', $.else_dir)),
        '@end',
      ),

    ident_expr: _ => /[A-Za-z_][A-Za-z_0-9]*/,

    str_expr: _ => choice(seq('"', /[^"]*/, '"'), seq("'", /[^']*/, "'")),

    ternary_expr: $ =>
      prec.left(
        PREC.TERNARY,
        seq(
          field('cond', $._expression),
          '?',
          field('if_block', $._expression),
          ':',
          field('else_block', $._expression),
        ),
      ),

    _statement: $ => choice($.postfix_stmt, $.assign_stmt),

    _expression: $ =>
      choice(
        $._parenthesized_expr,
        $.ident_expr,
        $.ternary_expr,
        $.int_expr,
        $.float_expr,
        $.nil_expr,
        $.bool_expr,
        $.prefix_expr,
        $.infix_expr,
        $.str_expr,
        $.arr_expr,
        $.global_call_expr,
        $.call_expr,
        $.dot_expr,
        $.index_expr,
        $.obj_expr,
      ),

    _parenthesized_expr: $ => prec(PREC.LPAREN, seq('(', $._expression, ')')),

    prefix_expr: $ => prec(PREC.PREFIX, choice($.prefix_minus, $.prefix_not)),

    prefix_minus: $ => prec(PREC.PREFIX + 1, seq('-', $._expression)),
    prefix_not: $ => prec(PREC.PREFIX + 1, seq('!', $._expression)),

    postfix_stmt: $ =>
      prec(PREC.POSTFIX, seq(field('left', $._expression), choice('++', '--'))),

    infix_expr: $ =>
      choice(
        $.multiply,
        $.modulo,
        $.divide,
        $.minus,
        $.plus,
        $.and,
        $.or,
        $.less,
        $.greater,
        $.eq,
        $.not_eq,
      ),

    eq: $ =>
      prec.left(
        PREC.EQ,
        seq(
          field('left', $._expression),
          field('op', '=='),
          field('right', $._expression),
        ),
      ),

    not_eq: $ =>
      prec.left(
        PREC.NOT_EQ,
        seq(
          field('left', $._expression),
          field('op', '!='),
          field('right', $._expression),
        ),
      ),

    less: $ =>
      prec.left(
        PREC.LTHAN,
        seq(
          field('left', $._expression),
          field('op', '<'),
          field('right', $._expression),
        ),
      ),

    greater: $ =>
      prec.left(
        PREC.GTHAN,
        seq(
          field('left', $._expression),
          field('op', '>'),
          field('right', $._expression),
        ),
      ),

    multiply: $ =>
      prec.left(
        PREC.MUL,
        seq(
          field('left', $._expression),
          field('op', '*'),
          field('right', $._expression),
        ),
      ),

    modulo: $ =>
      prec.left(
        PREC.MOD,
        seq(
          field('left', $._expression),
          field('op', '%'),
          field('right', $._expression),
        ),
      ),

    divide: $ =>
      prec.left(
        PREC.DIV,
        seq(
          field('left', $._expression),
          field('op', '/'),
          field('right', $._expression),
        ),
      ),

    minus: $ =>
      prec.left(
        PREC.SUB,
        seq(
          field('left', $._expression),
          field('op', '-'),
          field('right', $._expression),
        ),
      ),

    plus: $ =>
      prec.left(
        PREC.ADD,
        seq(
          field('left', $._expression),
          field('op', '+'),
          field('right', $._expression),
        ),
      ),

    or: $ =>
      prec.left(
        PREC.OR,
        seq(
          field('left', $._expression),
          field('op', '||'),
          field('right', $._expression),
        ),
      ),

    and: $ =>
      prec.left(
        PREC.AND,
        seq(
          field('left', $._expression),
          field('op', '&&'),
          field('right', $._expression),
        ),
      ),

    global_call_expr: $ =>
      prec(
        PREC.LPAREN,
        seq(
          field('function', $.ident_expr),
          '(',
          optional(field('arguments', $.argument_list)),
          ')',
        ),
      ),

    call_expr: $ =>
      prec(
        // We need to add 1 to precedence because it will confict
        // with global_call_expr.
        PREC.LPAREN + 1,
        seq(
          field('receiver', $._expression),
          '.',
          field('function', $.ident_expr),
          '(',
          optional(field('arguments', $.argument_list)),
          ')',
        ),
      ),

    dot_expr: $ =>
      prec(
        PREC.DOT,
        seq(field('left', $._expression), '.', field('key', $._expression)),
      ),

    index_expr: $ =>
      seq(
        field('left', $._expression),
        '[',
        field('index', $._expression),
        ']',
      ),

    int_expr: _ => /\d+/,
    float_expr: _ => /\d+\.\d+/,
    bool_expr: _ => choice('true', 'false'),
    nil_expr: _ => 'nil',

    arr_expr: $ =>
      seq(
        '[',
        optional(seq($._expression, repeat(seq(',', $._expression)))),
        ']',
      ),

    pair: $ =>
      choice(
        seq(
          field('key', choice($.str_expr, $.ident_expr)),
          ':',
          field('val', $._expression),
        ),
        field('key', $.ident_expr),
      ),

    pairs: $ => seq($.pair, optional(repeat(seq(',', $.pair))), optional(',')),

    obj_expr: $ => seq('{', optional($.pairs), '}'),

    comment: _ => seq(token('{{--'), repeat(token(/./)), token('--}}')),
  },
})
