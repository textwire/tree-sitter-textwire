; Keywords
"@end" @keyword

; Variables
(identifier) @variable

; Basic tokens
(boolean_literal
  ["true" "false"] @constant.builtin)

(integer_literal) @constant.numeric
(float_literal) @constant.numeric
(string_literal) @string
(nil_literal) @constant.builtin
(comment) @comment

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
  "@if" @keyword)

(else_if_statement
  "@elseif" @keyword)

(else_statement
  "@else" @keyword)

(each_statement
  ["@each" "in"] @keyword)

(for_statement
  "@for" @keyword)

(component_statement
  "@component" @keyword)

(insert_statement
  "@insert" @keyword)

(reserve_statement
  "@reserve" @keyword)
