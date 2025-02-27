#include <tree_sitter/parser.h>
#include <string.h>
#include <wctype.h>
#include <stdio.h>

enum TokenType {
    HTML,
};

static const char *directives[] = {
    "if",
    "else",
    "elseif",
    "end",
    "for",
    "use",
    "each",
    "breakIf",
    "continueIf",
    "insert",
    "reserve",
    "break",
    "continue",
    "component",
    "slot",
    "dump",
    NULL,
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

static int _the_longest_directory() {
    int longest = 0;

    for (int i = 0; directives[i]; i++) {
        if (!directives[i]) {
            continue;
        }

        int len = strlen(directives[i]);

        if (len > longest) {
            longest = len;
        }
    }

    return longest;
}

static bool _is_directory_end(char ch) {
    return ch == ' ' || ch == '\t' || ch == '\n' || ch == '\r' || ch == '(';
}

static bool _is_directive(char ch, TSLexer *lexer) {
    if (ch != '@') {
        return false;
    }

    lexer->advance(lexer, false); // skip "@"

    int longest = _the_longest_directory();

    char buffer[longest];
    int i = 0;

    while (!lexer->eof(lexer) && i < longest) {
        char ch = lexer->lookahead;

        if (_is_directory_end(ch)) {
            break;
        }

        buffer[i++] = ch;
        lexer->advance(lexer, false);
    }

    buffer[i] = '\0'; // Null-terminate

    // Compare against defined directives
    for (int j = 0; directives[j] != NULL; j++) {
        if (strcmp(buffer, directives[j]) == 0) {
            return true;
        }
    }

    return false;
}

static bool _is_double_brace(char ch, TSLexer *lexer) {
    lexer->advance(lexer, false);
    return ch == '{' && lexer->lookahead == '{';
}

static bool _handle_double_brace(TSLexer *lexer, bool consumed_anything) {
    if (consumed_anything) {
        lexer->mark_end(lexer);
        lexer->result_symbol = HTML;
        return true;
    }

    // No text consumed—return false so parser can match '{{'
    return false;
}

static bool _skip_over_html(TSLexer *lexer, const bool *valid_symbols) {
    if (!valid_symbols[HTML]) {
        return false;
    }

    bool consumed_anything = false;
    char prev_ch = 0;

    while (!lexer->eof(lexer)) {
        char ch = lexer->lookahead;

        // Stop at '@' unless it's escaped
        if (_is_directive(ch, lexer) && prev_ch != '\\') {
            if (consumed_anything) {
                lexer->mark_end(lexer);
                lexer->result_symbol = HTML;
                return true;
            }

            return false;
        }

        if (_is_double_brace(ch, lexer) && prev_ch != '\\') {
            return _handle_double_brace(lexer, consumed_anything);
        }

        // Otherwise, keep consuming HTML
        prev_ch = ch;
        lexer->advance(lexer, false);
        lexer->mark_end(lexer);
        consumed_anything = true;
    }

    // At EOF, emit HTML if anything was consumed
    if (consumed_anything) {
        lexer->result_symbol = HTML;
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
