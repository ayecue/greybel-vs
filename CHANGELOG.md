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
- fix token end for hover tooltip
- support multiple statements at same line for hover tooltips

## [1.2.4] - 12-10-2022

### Changed

- fix parser exception when a combination of block and comment on the same line appears, thanks for reporting to [@xephael](https://github.com/xephael)

## [1.2.5] - 16-10-2022

### Changed

- filter current connected wifi from list which is presented when looking for close wifis
- minor fix in used_ports intrinsic which caused unwanted behavior
- service ports are closer to ingame service port numbers

## [1.2.6] - 26-10-2022

### Changed

- implement super + isa logic
- add super + isa keyword
- support super + isa in highlighting
- exclude super and isa from uglify
- improve function declaration uglify
- improve interpreter map __isa logic

## [1.2.7] - 28-10-2022

### Changed

- update meta

## [1.2.8] - 01-11-2022

### Changed

- use proper context in super call

## [1.2.9] - 04-11-2022

### Changed

- allow empty string in split
- use regexp in split

## [1.3.0] - 05-11-2022

### Changed

- fix state forwarding in context
- interfaces use maps instead of custom interface
- revert regexp in split

## [1.3.1] - 06-11-2022

### Changed

- fix router intrinsics in regards of forwarded ports
- fix bug in meta lib overflow

## [1.3.2] - 27-11-2022

### Changed

- implement definitions provider
- use lru cache
- implement document symbol provider
- implement workspace symbol provider
- fix runtime error when canceling input
- implement pseudo terminal to support colors, bgColors and text formatting
- use correct categories for items in context menu
- add snippet command
- implement color picker
- decrease parse timeout
- fix autocomplete not working in certain cases as expected
- optimized ast document cache

## [1.3.3] - 28-11-2022

- keep terminal open after execution
- add carriage return to format_columns and user_input
- add carriage return to any prints by user

## [1.3.4] - 13-03-2023

- use any type as initial autocomplete type
- disable diagnostics for files inside greyscript project which are not gs
- look for all definitions even in nested imported/included files
- fix error on trailing comma in maps and lists
- add check for metaxploit if file exists to prevent error
- change autocomplete to only trigger after dot
- add support for import_code code completion [#26](https://github.com/ayecue/greybel-vs/issues/26), thanks for suggesting [@Patrick-van-Halm](https://github.com/Patrick-van-Halm)
- add support for accessing within scope after instantiation code completion [#27](https://github.com/ayecue/greybel-vs/issues/27), thanks for suggesting [@Patrick-van-Halm](https://github.com/Patrick-van-Halm)
- add type-manager for improved type resolving

## [1.3.5] - 26-03-2023

- fix nested #import in interpreter
- proper json output when map/list gets stringified
- fix refresh interval sometimes not parsing

## [1.3.6] - 26-03-2023

- fix replace intrinsic

## [1.3.7] - 27-03-2023

- fix deep equal via extending max depth from 2 to 10 in interpreter

## [1.3.8] - 05-04-2023

- use correct alpha channel value for color picker
- fix error message in create_user related to invalid password format
- fix acks condition in aireplay
- fix permission check in get_content
- fix current_date format
- fix nslookup error handling
- use proper max files in same folder
- typeof for MetaMail returns now in the right capitalization
- fix power operator handling
- update meta descriptions

## [1.3.9] - 05-04-2023

- remove key interaction on airplay to prevent issue
- fix wifi networks return value
- minor fixes for meta examples

## [1.4.0] - 07-04-2023

- update meta version

## [1.4.1] - 08-04-2023

- update meta version
- update readme

## [1.4.2] - 09-04-2023

- fix potential crash in debugger

## [1.4.3] - 15-04-2023

- use regex in split intrinsic
- fix list insert behaviour, return mutated list now
- update meta descriptions
- update meta performance

## [1.4.4] - 15-04-2023

- escape dot in split intrinsic

## [1.4.5] - 21-04-2023

- fix output format of show_procs in intrinsics
- fix EOL character in format_columns intrinsics
- update meta descriptions

## [1.4.6] - 24-04-2023

- use mac and wifi name for bssid and essid to emulate ingame intrinsic
- fix potential crash caused by meta due to not using hasOwnProperty
- support customizable seed in interpreter
- support customizable environment variables in interpreter
- add build command in file context menu
- support circular dependencies for interpreter
- add circular dependency check for build

## [1.4.7] - 28.04.2023

- support gh intrinsic references
- support program to launch itself
- add test-lib for setting up envs and debugging - [read more](https://github.com/ayecue/greybel-js#testlib)

## [1.4.8] - 28.04.2023

- returning proper library type names when using typeof
- time now returns elapsed time in seconds

## [1.4.9] - 30.04.2023

- replace newline in print with actual newline
- refactor output handler enabling user_input not forcing newline

## [1.5.0] - 01.05.2023

- fix potential crash in device_ports
- fix return value of name intrinsic for top file
- fix bug in regards of return getting swallowed in while/for iteration causing infinite loops
- improved error logging with actual stack trace on failure

## [1.5.1] - 01.05.2023

- fix bug in regards of return getting ignored in wrapping while/for

## [1.5.2] - 02.05.2023

- support behaviour of self in arguments
- expose join, split, to_int and replace functions in general namespace
- support map and list in replace
- update meta
- fix faulty mock data which could potentially cause crash