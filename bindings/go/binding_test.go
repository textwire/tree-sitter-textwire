package tree_sitter_textwire_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_textwire "github.com/textwire/textwire/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_textwire.Language())
	if language == nil {
		t.Errorf("Error loading Textwire grammar")
	}
}
