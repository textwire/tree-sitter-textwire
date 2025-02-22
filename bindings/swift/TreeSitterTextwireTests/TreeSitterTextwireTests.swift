import XCTest
import SwiftTreeSitter
import TreeSitterTextwire

final class TreeSitterTextwireTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_textwire())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Textwire grammar")
    }
}
