#include <tree_sitter/parser.h>
#include <string.h>
#include <wctype.h>

enum TokenType {
  html_code,
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

static bool is_double_brace(TSLexer *lexer) {
    lexer->advance(lexer, false);
    return lexer->lookahead == '{';
}

static bool handle_double_brace(TSLexer *lexer, bool consumed_anything) {
    if (consumed_anything) {
        lexer->mark_end(lexer);
        lexer->result_symbol = html_code;
        return true;
    }
    // No text consumed—return false so parser can match '{{'
    return false;
}

static bool _skip_over_html(TSLexer *lexer, const bool *valid_symbols) {
    if (!valid_symbols[html_code]) {
        return false;
    }

    bool consumed_anything = false;

    while (!lexer->eof(lexer)) {
        char ch = lexer->lookahead;

        // Stop at '@'
        if (ch == '@') {
            if (consumed_anything) {
                lexer->mark_end(lexer);
                lexer->result_symbol = html_code;
            }

            return consumed_anything;
        }

        // Stop at '{{'
        if (ch == '{' && is_double_brace(lexer)) {
            return handle_double_brace(lexer, consumed_anything);
        }

        // Otherwise, keep consuming HTML
        lexer->advance(lexer, false);
        lexer->mark_end(lexer);
        consumed_anything = true;
    }

    // At EOF, emit html_code if anything was consumed
    if (consumed_anything) {
        lexer->result_symbol = html_code;
    }

    return consumed_anything;
}

bool tree_sitter_textwire_external_scanner_scan(
    void *payload,
    TSLexer *lexer,
    const bool *valid_symbols
) {
    return _skip_over_html(lexer, valid_symbols);
}
