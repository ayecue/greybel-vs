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

## [1.5.2] - 08.05.2023

- support behaviour of self in arguments
- expose join, split, to_int and replace functions in general namespace
- support map and list in replace
- update meta
- fix faulty mock data which could potentially cause crash
- rework parser to emulate greyscript behaviour more accurate

## [1.5.3] - 08.05.2023

- fix text-mesh transformation render for inner children

## [1.5.4] - 09.05.2023

- fix get library type in mock env, potentially fixing crash in netsession intrinsic
- fix paths starting with null resolving to general properties

## [1.5.5] - 10.05.2023

- fix type resolve
- fix firewall_rules intrinsic return value
- fix wait not using seconds but milliseconds
- support refresh in print

## [1.5.6] - 11.05.2023

- fix breakpoints in windows which were caused by file path being inconsistent

## [1.5.7] - 12.05.2023

- forbid literal optimization in default args

## [1.5.8] - 12.05.2023

- fix isa regarding boolean value, boolean now gets recognized by it as a member of number

## [1.5.9] - 21.05.2023

- fix import_code injection in includes and imports
- add ingame directory settings property
- simplify import_code logic by removing second custom argument and allowing to create an installer to whatever ingame directory
- improve autocomplete including keywords, constants and operators
- improve auto increase/decrease indent
- fix hover tooltip for multiline strings
- instant exit on process termination

## [1.6.0] - 06.06.2023

- fix lastIndexOf behaviour, only works with strings now and returns -1 instead of null
- fix return type of indexOf signature
- fix tooltip for lastIndexOf
- remove usage of boolean type in tooltips and signatures to avoid confusion since technically booleans do not exist
- minor improvement to index expression type analyzing
- use modified transformer to get namespace for type
- partialy support type resolve from identifier assigned in imported file
- fix type resolve within slice expression
- improve type resolve for assignments using locals, globals or outer prefix
- extend namespace find method to use assignment instead of namespaces coming from parser
- fix possibly wrong start position of member, index and call expression
- inject map constructor namespaces
- inject list constructor namespaces
- add block comment support
- add comment function description support
- add action to transform to clipboard instead of writing into file
- improve build error output

## [1.6.1] - 07.06.2023

- fix issue related to includes and type resolve

## [1.6.2] - 08.06.2023

- add support for multiply and division on lists

## [1.6.3] - 10.06.2023

- improve support for command_info behavior
- update to latest meta descriptions
- changes regarding performance and style of api view
- optimize meta package size

## [1.6.4] - 11.06.2023

- fix progress bar print not getting replaced in terminal

## [1.6.5] - 14.06.2023

- improve extension node build
- add share logic
- move transforms from context menu into submenu

## [1.6.6] - 14.06.2023

- remove usage of vscode uri for clipboard write in order to prevent encoding

## [1.6.7] - 17.06.2023

- update meta descriptions

## [1.6.8] - 18.06.2023

- improve greyscript syntax

## [1.6.9] - 19.06.2023

- cast null to empty string when concatenation
- fix syntax related to pseudo types
- support function paramter in syntax
- add general functions to support.function syntax
- update meta descriptions

## [1.6.10] - 20.06.2023

- fix syntax grammar files location

## [1.6.11] - 20.06.2023

- fix function textmate syntax

## [1.7.0] - 22.06.2023

- if any is included in types just display any
- support multiline conditions
- support slice type resolve

## [1.7.1] - 23.06.2023

- add debugger keyword to textmate syntax

## [1.7.2] - 25.06.2023

- fix textmate syntax related to strings within functions and pseudo-types
- fix argument types for to_int and insert
- fix super behavior in regards of accessessing direct __isa
- add launch call stack limit
- support minus operator for strings
- fix binary expression order on same precedence
- fix syntax exception in case call expression without paren was in last line
- fix various binary operations on number, list and map operations
- use ordinal comparison on greater and less than operations for strings
- support division on strings
- add modulo operator to textmate syntax
- fix order in operator textmate syntax

## [1.7.3] - 26.06.2023

- use rnd function factory to get properly working rnd with seed

## [1.7.4] - 29.06.2023

- fix various evaluation expression output values

## [1.7.5] - 14.07.2023

- fix replaceText behavior in print by using pseudo terminal directly and not message queue

## [1.8.0] - 19.07.2023

- add c2 agent to support remote file creation in-game
- add support to cache refreshToken for ingame file creation
- change vscode built for node version in order to support the c2 agent and steam
- update meta involving create_folder signature fix

## [1.8.1] - 28.07.2023

- add support for funcRef in syntax highlight and code execution
- add funcRef, list, number, string, params, globals, locals, outer and self to autocomplete constants
- update meta

## [1.8.2] - 29.07.2023

- add support to be able to modify idx variables within for iterations
- fix: set computers list at rshell service install
- support color shorthand in text-mesh
- support quotes in text-mesh tags
- improve pseudo terminal text input, support arrow keys

## [1.8.3] - 30.07.2023

- fix get_router intrinsic when providing lan ip
- allow non literals in function declaration params
- fix issue with call statement without parens
- remove "from" keywords

## [1.8.4] - 30.07.2023

- use setImmediate/setTimeout instead of nextTick to fix stdout issue within iterations

## [1.8.5] - 31.07.2023

- fix issue within import_code dependency management which could cause an invalid order, order should be more accurate now
- improve text mesh transform approach to use queueing instead of recursion preventing exceeding maximum call stack

## [1.8.6] - 03.08.2023

- use static isa objects for grey hack specific intrinsics to enable usage of isa on those types

## [1.8.7] - 13.08.2023

- improve installer logic of generated installer file
- fix issue if line is longer than maxChars allowed in installer - related to [#102](https://github.com/ayecue/greybel-js/issues/102)

## [1.8.8] - 19.08.2023

- implement autocompile feature for installer - thanks for the suggestion to [@stevenklar](https://github.com/stevenklar) - related to [#106](https://github.com/ayecue/greybel-js/issues/106)

## [1.8.9] - 19.08.2023

- add auto delete of installer on every installer not just the last one - related to [#106](https://github.com/ayecue/greybel-js/issues/106)

## [1.8.10] - 15.10.2023

- fix object value delete (fixes remove intrinsic)
- fix globals lookup - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#108](https://github.com/ayecue/greybel-js/issues/108)
- add defaultArgs option - thanks to [@Olipro](https://github.com/Olipro) for the suggestion - related to [#82](https://github.com/ayecue/greybel-vs/issues/82)
- add silence error popups option - thanks to [@Olipro](https://github.com/Olipro) for the suggestion - related to [#82](https://github.com/ayecue/greybel-vs/issues/82)

## [1.8.11] - 15.10.2023

- update remove intrinsic to properly work with object value delete

## [1.8.12] - 16.10.2023

- use vscode workspace directory when using slash at the beginning of import path - thanks to [@Olipro](https://github.com/Olipro) for the suggestion - related to [#84](https://github.com/ayecue/greybel-vs/issues/84)
- allow // as an alternative to # for import and include statement - thanks to [@Olipro](https://github.com/Olipro) for the suggestion - related to [#85](https://github.com/ayecue/greybel-vs/issues/85)

## [1.8.13] - 17.10.2023

- fix multiply and divide string which mistakenly was using list as a default value when the factor was zero - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#88](https://github.com/ayecue/greybel-vs/issues/88)
- more proper to string for function - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#89](https://github.com/ayecue/greybel-vs/issues/89)
- fix async function argument builder
- fix execution continueing in path resolve even though interpreter is in exit state - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#91](https://github.com/ayecue/greybel-vs/issues/91)
- fix isa not working when assigning __isa manually + when merging two maps - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#92](https://github.com/ayecue/greybel-vs/issues/92)

## [1.8.14] - 17.10.2023

- add IS_GREYBEL property to globals - thanks to [@Olipro](https://github.com/Olipro) for the suggestion - related to [#93](https://github.com/ayecue/greybel-vs/issues/93)
- add access to stacktrace via test lib - thanks to [@Olipro](https://github.com/Olipro) for the suggestion - related to [#93](https://github.com/ayecue/greybel-vs/issues/93)
- fix stacktrace reset in testlib when using try_to_execute
- fix breakpoint reset in testlib when using try_to_execute_with_debug

## [1.8.15] - 17.10.2023

- fix errors related to path resolve when stoping script execution via debugger

## [1.8.16] - 18.10.2023

- fix incorrect scope resolution order - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#97](https://github.com/ayecue/greybel-vs/issues/97)
- add .ms file extension - related to [#96](https://github.com/ayecue/greybel-vs/issues/96)

## [1.9.0] - 20.10.2023

- fix lookup to only include locals, outer and globals to properly replicate MiniScript behavior - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#100](https://github.com/ayecue/greybel-vs/issues/100)
- fix self, locals, globals, outer not being implicit in order to properly replicate MiniScript behavior - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#100](https://github.com/ayecue/greybel-vs/issues/100)
- minor optimization when looking up self, locals, globals, outer
- add error when trying to lookup unknown path on number or string
- add error when calling function with too many arguments
- add new line in scan_address intrinsic to properly replicate GreyScript behavior - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#101](https://github.com/ayecue/greybel-vs/issues/101)
- fix scp intrinsic groups lookup
- add more permissions to generated myprogram file - thanks to [@Olipro](https://github.com/Olipro) for the suggestion
- create object for get_custom_object on each env creation - thanks for reporting to [@Olipro](https://github.com/Olipro)

## [1.9.1] - 21.10.2023

- fix lookup prebuild for locals, outer, globals and self - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#100](https://github.com/ayecue/greybel-vs/issues/100)

## [1.9.2] - 21.10.2023

- fix error on passing non-empty lists on non parenthese call expressions - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#104](https://github.com/ayecue/greybel-vs/issues/104)

## [1.9.3] - 23.10.2023

- fix shorthand doesn't work with self, globals, outer and locals - related to [#106](https://github.com/ayecue/greybel-vs/issues/106)
- update proxy version to latest version - related to [#108](https://github.com/ayecue/greybel-vs/issues/108) and maybe [#107](https://github.com/ayecue/greybel-vs/issues/107)
- reset string, number, function, map and list intrinsics each session - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#110](https://github.com/ayecue/greybel-vs/issues/110)

## [1.9.4] - 24.10.2023

- use maps with actual hashing for objects in order to get faster key lookups
- fix hasIndex looking up __isa entries - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#114](https://github.com/ayecue/greybel-vs/issues/114)
- support same behavior related to anonymous functions and outer scope - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#115](https://github.com/ayecue/greybel-vs/issues/115)
- improve iteration performance by batching async iterations

## [1.9.5] - 25.10.2023

- add intrinsics related to regular expressions - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#117](https://github.com/ayecue/greybel-vs/issues/117)
- add maxCount argument to map/list replace intrinsic
- update greybel-proxy to support new version
- update to latest meta which includes signatures and descriptions related to new regex intrinsics, netsession, computer and ctfevent
- update textmate syntax to include new regex intrinsics
- revert iteration performance improvement
- add new netsession intrinsics
- add get_ctf, will always return null for now
- add computer get_name intrinsic
- add markov generator for more accurate usernames, passwords etc.
- erase all previous lines on print replaceText
- fix return value on enter key press - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#121](https://github.com/ayecue/greybel-vs/issues/121)

## [1.9.6] - 26.10.2023

- use globals if outer is not available
- expose trim, lastIndexOf, replace and reverse intrinsic to global scope
- add trim, lastIndexOf, replace and reverse to generic signatures
- add ascending argument to sort intrinsic
- improve function stringify

## [1.9.7] - 26.10.2023

- update meta text - thanks for the contribution to [@Olipro](https://github.com/Olipro)
- fix hangup related to comparisons - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#119](https://github.com/ayecue/greybel-vs/issues/119)
- detect backspace on keypress - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#124](https://github.com/ayecue/greybel-vs/issues/124)
- only pass target from context in launch when file contains original script
- fix overflow password exploit condition - thanks for the contribution to [@Olipro](https://github.com/Olipro)
- fix process state not getting reset in script executed by shell launch intrinsic - thanks for reporting to [@Olipro](https://github.com/Olipro)

## [1.9.8] - 26.10.2023

- override process state into function scope
- fix loading bar in console

## [1.9.9] - 27.10.2023

- add seperate import command - thanks to [@Olipro](https://github.com/Olipro) for the suggestion - related to [#108](https://github.com/ayecue/greybel-vs/issues/108)

## [1.9.10] - 27.10.2023

- bump proxy version due to latest GreyHack update