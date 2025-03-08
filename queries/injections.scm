;((text) @injection.content
; (#set! injection.language "html")
; (#set! injection.combined))
((text) @injection.content
    (#not-has-ancestor? @injection.content "envoy")
    (#set! injection.combined)
    (#set! injection.language php))
