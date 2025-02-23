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
  word: $ => $.name,

  rules: {
    program: $ => repeat($.definition),

    definition: $ => choice(
      $.brace_statement,
      $.dump_statement,
      $.component_statement,
      $.each_statement,
      //$.html,
    ),

    brace_statement: $ => seq(
      $.open_braces,
      $.statement,
      $.close_braces,
    ),

    html: _ => repeat1(choice(
      token(prec(-1, /</)),
      token(prec(1, /[^\s<][^<]*/)),
    )),

    statement: $ => choice(
      $.assign_statement,
      $.block_statement,
    ),

    assign_statement: $ => seq(
      field('name', $.identifier),
      '=',
      field('value', $.expression),
    ),

    block_statement: $ => $.definition,

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
      optional($.argument_list),
      ')',
    ),

    argument_list: $ => seq(
      $.expression,
      optional(repeat(seq(',', $.expression))),
    ),

    component_statement: $ => seq(
      '@component(',
      field('name', $.string_literal),
      optional(seq(',', $.expression)),
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

    name: _ => {
      // We need to side step around the whitespace characters in the extras array.
      const range = String.raw`\u0080-\u009f\u00a1-\u200a\u200c-\u205f\u2061-\ufefe\uff00-\uffff`;
      return new RegExp(`[_a-zA-Z${range}][_a-zA-Z${range}\\d]*`);
    },

    // TODO: check below =============================
    expression: $ => choice(
      //$.identifier,
      $.number_int,
      //$.number_float,
      //$.binary_expression,
    ),

    binary_expression: $ => choice(
      seq($.expression, '+', $.expression),
      seq($.expression, '-', $.expression),
      seq($.expression, '*', $.expression),
      seq($.expression, '/', $.expression),
      seq($.expression, '%', $.expression),
    ),

    open_braces: _ => '{{',
    close_braces: _ => '}}',

    number_int: _ => /\d+/,
    number_float: _ => /\d+\.\d+/,
  }
});

