// swift-tools-version:5.3
import PackageDescription

let package = Package(
    name: "TreeSitterTextwire",
    products: [
        .library(name: "TreeSitterTextwire", targets: ["TreeSitterTextwire"]),
    ],
    dependencies: [
        .package(url: "https://github.com/ChimeHQ/SwiftTreeSitter", from: "0.8.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterTextwire",
            dependencies: [],
            path: ".",
            sources: [
                "src/parser.c",
                // NOTE: if your language has an external scanner, add it here.
            ],
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterTextwireTests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterTextwire",
            ],
            path: "bindings/swift/TreeSitterTextwireTests"
        )
    ],
    cLanguageStandard: .c11
)
