#include <tree_sitter/parser.h>
#include <string.h>
#include <wctype.h>

enum TokenType {
  SKIP_HTML,
};

void *tree_sitter_textwire_external_scanner_create() {
    return NULL;
}

void tree_sitter_textwire_external_scanner_destroy(void *payload) {
    //
}

unsigned tree_sitter_textwire_external_scanner_serialize(
    void *payload,
    char *buffer
) {
    return 0;
}

void tree_sitter_textwire_external_scanner_deserialize(
    void *payload,
    const char *buffer,
    unsigned length
) {
    //
}

bool skip_over_html(TSLexer *lexer, const bool *valid_symbols) {
    char last_char = 0;

    while (!lexer->eof(lexer)) {
        char c = lexer->lookahead;
        bool is_escaped = (last_char == '\\');

        // Stop at '@' if not escaped
        if (c == '@' && !is_escaped && valid_symbols[SKIP_HTML]) {
          lexer->mark_end(lexer);
          lexer->result_symbol = SKIP_HTML;
          return true;
        }

        // Stop at '{{' if not escaped
        if (c == '{' && !is_escaped) {
          lexer->advance(lexer, false);
          if (lexer->lookahead == '{') {
            lexer->mark_end(lexer);
            lexer->result_symbol = SKIP_HTML;
            return true;
          }

          continue;
        }

        // Advance and remember this char
        last_char = c;
        lexer->advance(lexer, false);
        lexer->mark_end(lexer);
    }

    return false;
}

bool tree_sitter_textwire_external_scanner_scan(
    void *payload,
    TSLexer *lexer,
    const bool *valid_symbols
) {
    return skip_over_html(lexer, valid_symbols);
}
