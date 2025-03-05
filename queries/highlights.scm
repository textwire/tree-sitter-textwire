; Keywords
[
  "true"
  "false"
] @keyword

; Statements
(break_statement) @keyword
(continue_statement) @keyword

(dump_statement
  "@dump" @keyword)

(break_if_statement
  "@breakIf" @keyword)

(continue_if_statement
  "@continueIf" @keyword)

(if_statement
  ["@if" "@else" "@elseif" "@end"] @keyword)

(each_statement
  ["@each" "in" "@else" "@end"] @keyword)

(insert_statement
  "@insert" @keyword)

(component_statement
  ["@component" "@end"] @keyword)

; Variables
(identifier) @variable

; Basic tokens
(boolean_literal) @constant.builtin
(number_int) @number
(comment) @comment
