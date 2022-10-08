# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 17-08-2022

### Added

- initial release

## [1.0.1] - 17-08-2022

### Changed

- minor type resolve improvements

## [1.0.2] - 17-08-2022

### Changed

- fix broken scope variables in debugger view
- set variable reference to zero to prevent infinite inheritance

## [1.0.3] - 17-08-2022

### Changed

- fix indexes intrinsic for lists and strings

## [1.0.4] - 21-08-2022

### Changed

- add idx local during for loop
- add placeholders for blockhain, coin, service, wallet, subWallet
- improved meta information
- added methods to sytnax language

## [1.0.5] - 22-08-2022

### Changed

- fix range behavior in case of from > to
- improved meta information

## [1.0.6] - 22-08-2022

### Changed

- minor readme fix

## [1.0.7] - 22-08-2022

### Changed

- rename minify to transform for proper naming

### Added

- add beautify
- add option to define environment variables
- add option to define excluded namespaces

## [1.0.8] - 22-08-2022

### Changed

- change circle ci config
- update readme

## [1.0.9] - 23-08-2022

### Changed

- fix browser rollup build

### Added

- add envar to syntax
- add shortcut for minify and beautify
- add GreyScript API browser

## [1.1.0] - 27-08-2022

### Changed

- use `transpiler.buildType` as for build type
- remove uneccessary whitespaces from build
- use direct transpiler for transform
- change browser bundle type to cjs
- disable build and api command in web

### Added

- add environment variables to settings in README.md
- add more activation events in order to fix web extension

## [1.1.1] - 31-08-2022

### Changed

- find all identifier now only lookups left side in assignment
- fix autocomplete + hoverdocs flag in settings
- update greyscript-meta package, contains updated descriptions + responsive styles
- update parser and interpreter to support any value as map key, thanks for reporting to [@xephael](https://github.com/xephael)
- update parser to improve performance regarding automcompletion and hover, generates map of references per line

### Added

- add `transpiler.installer.maxChars` option to define when the installer should split the file
- add queue for AST parsing to improve CPU usage
- add flag to enable/disable diagnostics

## [1.1.2] - 31-08-2022

### Changed

- fix installer randomly stopping parsing file, [@xephael](https://github.com/xephael)

## [1.1.3] - 31-08-2022

### Changed

- remove wrapper boilerplate from main, thanks for reporting to [@xephael](https://github.com/xephael)

## [1.1.4] - 31-08-2022

### Changed

- update greyscript-meta, added missing general functions
- update core, added missing natives


## [1.1.5] - 31-08-2022

### Changed

- improve automcompletion + hoverdocs after core update
- use unsafe flag on document manager

## [1.1.6] - 08-09-2022

### Changed

- fix line count inside multiline strings, thanks for reporting to [@xephael](https://github.com/xephael)
- fix slice operator parsing, thanks for reporting to [@xephael](https://github.com/xephael)

## [1.1.7] - 10-09-2022

### Changed

- update meta package which involves a few fixed return types and two missing methods in the file type
- transpiler won't add the module boilerplate header if there are no actual modules
- globals declaration in header won't be added if there are no literal optimizations
- fix behavior of pop intrinsic for map
- remove meta_info from file intrinsics
- add allow_import polyfill in file intrinsics
- add default value info in hoverdocs
- add obfuscation flag

## [1.1.8] - 10-09-2022

### Changed

- update meta package, minor fix for run code feature

## [1.1.9] - 29-09-2022

### Changed

- minor fix for file.get_content, return empty string instead of undefined, thanks for reporting [@TopRoupi](https://github.com/TopRoupi)
- add sort key logic in sort intrinsic, thanks for reporting [@TopRoupi](https://github.com/TopRoupi)
- add missing tan intrinsics
- add same errors in basic intrinsics as in ms
- implement format_columns logic
- improve output handler logic
- user_input supports anyKey now
- add proper router intrinsics
- rework shell intriniscs for connect_service + scp
- add shell intriniscs for launch + build + ping
- add ftpShell intrinsics for put
- add computer intrinsics for connect eth + connect wifi
- update computer intrinsics for touch + create_folder
- update file intrinsics for move + copy + chmod + set_content + get_content + set_owner
- add groups to mock env
- update crypo intrinsics
- update metaxploit intrinsics
- update metalib intrinsics
- update netsession intrinsics
- more realistic usernames, passwords, vulnerability zone names
- loading bars are supported now
- deactivate breakpoint for injection during debugging in cli execution
- keep pending state after injection in interpreter
- update meta version with a few corrections
- update parser with removed ";" checks
- support nested import_code
- support outer imports using ".."
- fix [List can be different even if the same](https://github.com/ayecue/greybel-js/issues/32), thanks for reporting [@brahermoon](https://github.com/brahermoon)
- add __isa logic for maps
- minor TextMesh Pro support for output

## [1.2.0] - 01-10-2022

### Changed

- fix shuffle intrinsic for maps
- fix possible overflow in core parser
- fix kernel_version intrinsic
- fix nested unary in core parser

## [1.2.1] - 02-10-2022

### Changed

- update core in env script builder

## [1.2.2] - 07-10-2022

### Changed

- rework parser/lexer to support newest version (might introduced some new bugs, please report if you find anything)
- implement outer, get_custom_object, log, bitXor, bitAnd, bitOr, insert, yield
- optimize transpiler output, removed unnecessary parenthesis
- update meta with new descriptions
- drop support for scuffed if syntax
- drop support for bugged index call

## [1.2.3] - 08-10-2022

### Changed

- fix outer behavior