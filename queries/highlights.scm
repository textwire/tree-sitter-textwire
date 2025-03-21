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

; Keywords
[
  "@end"
  "@dump"
  "@breakIf"
  "@continueIf"
  "@if"
  "@elseif"
  "@else"
  "@else"
  "@each"
  "@for"
  "@component"
  "@insert"
  "@reserve"
  "@slot"
  "@use"
 ] @keyword

; Statements
(break_statement) @keyword
(continue_statement) @keyword

; Highlight parentheses in the named slot
"(" @punctuation.bracket
")" @punctuation.bracket
