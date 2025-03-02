/*
Tree Sitter Documentation:
https://tree-sitter.github.io/tree-sitter/creating-parsers/4-external-scanners.html
*/

#include "tree_sitter/parser.h"
#include <stdio.h>
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

static bool is_letter(char ch) {
    return ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z'));
}

static bool matches_directive_name(char *buffer) {
    for (int i = 0; directives[i] != NULL; i++) {
        if (strcmp(buffer, directives[i]) == 0) {
            return true;
        }
    }

    return false;
}

static bool is_directive(char ch, char prev_ch, TSLexer *lexer) {
    if (ch != '@' || prev_ch == '\\') {
        return false;
    }

    lexer->advance(lexer, false); // skip "@"

    int longest = the_longest_directive();

    char buffer[longest + 1]; // +1 for null-terminator
    int i = 0;

    while (!lexer->eof(lexer) && i < longest) {
        char ch = lexer->lookahead;

        if (!is_letter(ch)) {
            break;
        }

        buffer[i++] = ch;
        lexer->advance(lexer, false);
    }

    buffer[i] = '\0'; // Null-terminate

    return matches_directive_name(buffer);
}

static bool is_double_brace(char ch, char prev_ch, TSLexer *lexer) {
    if (prev_ch == '\\') {
        return false;
    }

    lexer->advance(lexer, false);
    return ch == '{' && lexer->lookahead == '{';
}

// Returns boolean if the text was consumed or not
static bool handle_directive(TSLexer *lexer, bool text_consumed) {
    if (text_consumed) {
        lexer->result_symbol = TEXT;
        return true;
    }

    return false;
}

// Returns boolean if the text was consumed or not
static bool handle_double_brace(TSLexer *lexer, bool text_consumed) {
    if (text_consumed) {
        lexer->result_symbol = TEXT;
        return true;
    }

    return false;
}

// Returns boolean if the text was consumed or not
static bool read_text_token(TSLexer *lexer) {
    bool text_consumed = false;
    char prev_ch = 0;

    while (!lexer->eof(lexer)) {
        char ch = lexer->lookahead;

        printf("char: %c | col: %d\n", ch, lexer->get_column(lexer));

        if (is_directive(ch, prev_ch, lexer)) {
            return handle_directive(lexer, text_consumed);
        }

        if (is_double_brace(ch, prev_ch, lexer)) {
            return handle_double_brace(lexer, text_consumed);
        }

        // keep consuming TEXT
        text_consumed = true;
        prev_ch = ch;
        lexer->mark_end(lexer);
    }

    // At EOF, emit TEXT if anything was consumed
    if (text_consumed) {
        lexer->result_symbol = TEXT;
    }

    return text_consumed;
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
