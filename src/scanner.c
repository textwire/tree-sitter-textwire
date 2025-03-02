/*
Tree Sitter Documentation:
https://tree-sitter.github.io/tree-sitter/creating-parsers/4-external-scanners.html
*/

#include "tree_sitter/parser.h"
#include <string.h>

enum TokenType {
    TEXT,
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

static int the_longest_directive() {
    int longest = 0;

    for (int i = 0; directives[i]; i++) {
        int len = strlen(directives[i]);

        if (len > longest) {
            longest = len;
        }
    }

    return longest;
}

static bool is_directive_end(char ch) {
    return ch == ' ' || ch == '\t' || ch == '\n' || ch == '\r' || ch == '(';
}

static bool is_directive(char ch, TSLexer *lexer) {
    if (ch != '@') {
        return false;
    }

    lexer->advance(lexer, false); // skip "@"

    int longest = the_longest_directive();

    char buffer[longest + 1]; // +1 for null-terminator
    int i = 0;

    while (!lexer->eof(lexer) && i < longest) {
        char ch = lexer->lookahead;

        if (is_directive_end(ch)) {
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

static bool is_double_brace(char ch, TSLexer *lexer) {
    lexer->advance(lexer, false);
    return ch == '{' && lexer->lookahead == '{';
}

static bool handle_double_brace(TSLexer *lexer, bool consumed_anything) {
    if (consumed_anything) {
        lexer->result_symbol = TEXT;
        return true;
    }

    // No text consumed—return false so parser can match '{{'
    return false;
}

static bool read_text_token(TSLexer *lexer) {
    bool consumed_anything = false;
    char prev_ch = 0;

    while (!lexer->eof(lexer)) {
        char ch = lexer->lookahead;

        // Stop at '@' unless it's escaped
        if (is_directive(ch, lexer) && prev_ch != '\\') {
            if (consumed_anything) {
                lexer->result_symbol = TEXT;
                return true;
            }

            return false;
        }

        if (is_double_brace(ch, lexer) && prev_ch != '\\') {
            return handle_double_brace(lexer, consumed_anything);
        }

        // Otherwise, keep consuming TEXT
        prev_ch = ch;
        lexer->advance(lexer, false);
        lexer->mark_end(lexer);
        consumed_anything = true;
    }

    // At EOF, emit TEXT if anything was consumed
    if (consumed_anything) {
        lexer->result_symbol = TEXT;
    }

    return consumed_anything;
}

bool tree_sitter_textwire_external_scanner_scan(
    void *payload,
    TSLexer *lexer,
    const bool *valid_symbols
) {
    if (valid_symbols[TEXT]) {
        return read_text_token(lexer);
    }

    return false;
}
