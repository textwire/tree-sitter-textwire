; Keywords
"in" @keyword

; Directories
[
  "@if"
  "@elseif"
  "@for"
  "@use"
  "@each"
  "@breakIf"
  "@continueIf"
  "@insert"
  "@reserve"
  "@component"
  "@slot"
  "@dump"
  "@else"
  "@end"
  "@break"
  "@continue"
  "@slot"
] @directive

; Operators
[
  "+"
  "++"
  "-"
  "--"
  "*"
  "/"
  "%"
  "="
  "=="
  "!="
  ">"
  "<"
  ">="
  "<="
  "!"
] @operator

; Delimeters
[
  "{{"
  "}}"
  "}"
  "{"
  "("
  ")"
  "["
  "]"
  "?"
  ":"
  ","
  "."
  ";"
] @delimeter

; Variables
(identifier) @variable

; Function calls
(call_expression
  function: (selector_expression
    field: (field_identifier) @function.method.call))

; Literals
(string_literal) @string
(escape_sequence) @string.escape
(int_literal) @number
(float_literal) @number.float

[
  (true)
  (false)
] @boolean

"nil" @constant

; Keyed element e.g. key.value
(keyed_element
  .
  (literal_element
    (identifier) @variable.member))

; Comments
(comment) @comment
