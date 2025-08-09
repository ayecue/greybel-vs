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

## [1.9.11] - 27.10.2023

- add sequence for insert, home, end, page down, page up and delete - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#124](https://github.com/ayecue/greybel-vs/issues/124)

## [1.9.12] - 28.10.2023

- bump proxy version due to latest GreyHack update

## [1.9.13] - 28.10.2023

- remove lower case transform on key press - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#130](https://github.com/ayecue/greybel-vs/issues/130)

## [1.9.14] - 28.10.2023

- update to latest steam-user version which includes fix for refresh token

## [1.9.15] - 30.10.2023

- fix for user_input, changed switch statement to differentiate between specific chars and other input - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#134](https://github.com/ayecue/greybel-vs/issues/134)

## [1.9.16] - 31.10.2023

- bump proxy version due to latest GreyHack update
- bind context of owning map to super instead of the call context - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#136](https://github.com/ayecue/greybel-vs/issues/136)

## [1.9.17] - 31.10.2023

- add hideUnsupportedTextMeshProRichTextTags flag - thanks to [@Olipro](https://github.com/Olipro) for the suggestion - related to [#139](https://github.com/ayecue/greybel-vs/issues/139)

## [1.10.0] - 03.11.2023

- expose all GreyHack intrinsics in global scope and also add signatures to meta - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#142](https://github.com/ayecue/greybel-vs/issues/142)
- add aptclient and blockhain vulnerability generation in mock env - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#141](https://github.com/ayecue/greybel-vs/issues/141)

## [1.10.1] - 04.11.2023

- fix super behavior in certain edge cases
- change approach on exposing map, list, number, string and funcRef objects
- bump proxy version due to latest GreyHack update
- pass stacktrace to child interpreter via launch in order to enable to receive the correct stacktrace

## [1.10.2] - 05.11.2023

- add snippets
- fix exit within call args and if condition - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#145](https://github.com/ayecue/greybel-vs/issues/145)

## [1.10.3] - 09.11.2023

- bump proxy version due to latest GreyHack update
- improve file importer feedback when files couldn't be imported

## [2.0.0] - 15.11.2023

- update dependencies to next major version
- add %= and ^= operators
- support else after return in single-line if
- support multiline comparisons
- fix issue with call statement without parentheses and first negative arg
- add missing pull instrinsic from meta info of map
- fix numeric logical expression
- fix failing cases for hasIndex and indexOf (test suite)
- fix failing cases for insert (test suite)
- fix failing cases for remove (test suite)
- fix failing cases for round (test suite)
- fix failing cases for pop (test suite)
- fix failing cases for sort (test suite)
- change hashing and deep equal approach
- fix failing cases for replace (test suite)

## [2.0.1] - 15.11.2023

- fix meta map pull signature
- fix typeof + toString behavior of maps with classID
- add file icon

## [2.0.2] - 16.11.2023

- fix failure when sortKey was not existing
- support detection of all single line comments above function declaration

## [2.1.0] - 22.11.2023

- replacing recursive interpreter with bytecode generator + vm to improve performance
- due to the new interpreter the stacktrace should be more accurate - thanks for reporting to [@Olipro](https://github.com/Olipro) - related to [#109](https://github.com/ayecue/greybel-vs/issues/109)

## [2.1.1] - 23.11.2023

- fix error message popup when instruction is internal

## [2.1.2] - 23.11.2023

- add support for text mesh tags to close on newline

## [2.1.3] - 24.11.2023

- fix prepare error on execute not showing line
- add preview grey hack output (WIP)
- do not allow frame pop on global frame

## [2.1.4] - 26.11.2023

- fix for iterations combined with returns causing the iterator stack not to pop

## [2.1.5] - 30.11.2023

- fix self not being reassignable within frame
- bump proxy version due to latest GreyHack update

## [2.1.6] - 14.12.2023

- use dot as resolve trigger for autocompletion handler + minor adjustments - related to [#158](https://github.com/ayecue/greybel-vs/issues/158)
- bump proxy version due to latest GreyHack update
- transform several text editor commands into normal commands - thanks for reporting to [@MadbHatter](https://github.com/MadbHatter) - related to [#157](https://github.com/ayecue/greybel-vs/issues/157)
- update meta to improve autocomplete

## [2.1.7] - 14.12.2023

- use active document for build, refresh, import and share if there is no event uri available - thanks for the suggestion to [@MadbHatter](https://github.com/MadbHatter) - related to [#157](https://github.com/ayecue/greybel-vs/issues/157)
- make gotoError and transforms invisible in command palette since those require the context of an editor

## [2.1.8] - 19.12.2023

- bump proxy version due to latest GreyHack update

## [2.1.9] - 29.12.2023

- minor fixes to meta descriptions
- fix missing fallback value for allow import for file entities in mock environment
- update steam client

## [2.1.10] - 31.12.2023

- minor fixes to meta descriptions
- fix connect_ethernet intrinsic ip check
- fix airmon intrinsic stop option
- fix missing boot folder in generated computers
- improve preview output - thanks for the suggestion to [@Olipro](https://github.com/Olipro) - related to [#139](https://github.com/ayecue/greybel-vs/issues/139)

## [2.1.11] - 31.12.2023

- use proper sprite set for preview output

## [2.1.12] - 01.01.2024

- add pointer for current active instruction for stacktrace

## [2.1.13] - 02.01.2024

- use proper font weight map

## [2.1.14] - 03.01.2024

- bump proxy version due to latest GreyHack update

## [2.1.15] - 04.01.2024

- exclude params from optimization in transpiler
- add all optimization excludes used in build to transform as well

## [2.1.16] - 05.01.2024

- add myprogram as process when script is getting executed
- while minimizing check if hasIndex value exists in namespaces otherwise falls back to not otimized value

## [2.1.17] - 06.01.2024

- automatically saves target file on build if file is in a dirty state - thanks for the suggestion to [@gatekeeper258](https://github.com/gatekeeper258) - related to [#155](https://github.com/ayecue/greybel-js/issues/155)

## [2.1.18] - 07.01.2024

- bump proxy version due to server change

## [2.2.0] - 27.01.2024

- fix index expression to replicate [#89](https://github.com/JoeStrout/miniscript/issues/89) behavior of MiniScript
- add frame limit to interpreter to prevent crashing VSCode due to infinite recursion caused by a script - related to [#172](https://github.com/ayecue/greybel-vs/issues/172)
- prevent error when stopping script execution while waiting for key input
- enable to change background color of terminal preview view
- enable some commands for VSCode web version - related to [#173](https://github.com/ayecue/greybel-vs/issues/173) - thanks for reporting to [@almostSouji](https://github.com/almostSouji)
- add message-hook agent to enable a smoother workflow when importing files in-game

## [2.2.1] - 27.01.2024

- fix instruction in readme for message-hook agent

## [2.2.2] - 28.01.2024

- update GreyHackMessageHook.dll version to 0.3 adding an auto close - thanks to [@stevenklar](https://github.com/stevenklar) - related to [#159](https://github.com/ayecue/greybel-js/issues/159)
- add auto compile option for create in-game feature - thanks for the suggestion to [@stevenklar](https://github.com/stevenklar) - related to [#160](https://github.com/ayecue/greybel-js/issues/160)
- add function definition to signature helper - thanks for the suggestion to [@stevenklar](https://github.com/stevenklar)

## [2.2.3] - 29.01.2024

- decrease cooldown between agent messages to speed up building process

## [2.2.4] - 30.01.2024

- add jsdoc syntax parser to comment to modify signatures that are shown - thanks for the suggestion to [@stevenklar](https://github.com/stevenklar)

## [2.2.5] - 31.01.2024

- fix bytecode generator passing noInvoke flag to sub nodes causing issues when using addressOf on expression with more than two members

## [2.2.6] - 01.01.2024

- improve error output for user when in-game import feature fails to import
- update GreyHackMessageHook.dll version to 0.4 to use unity thread for closing terminal

## [2.2.7] - 03.01.2024

- fix message handling in headless agent causing connection to get dropped under certain conditions - thanks for reporting [SkidMall](https://github.com/cantemizyurek)
- fix general sort description
- fix list sort signature

## [2.2.8] - 03.01.2024

- change window handle for agents to prevent partial import error - thanks for reporting [@gatekeeper258](https://github.com/gatekeeper258)

## [2.2.9] - 04.01.2024

- improve file removal step on auto-compile to instant

## [2.2.10] - 07.01.2024

- allow super being reassigned
- fix super not using proper origin when calling a function of parent - thanks for reporting apparatusdeus
- set super to null if there is no parent class

## [2.2.11] - 10.01.2024

- add ms file extension to be detected as GreyScript file
- fix shell.launch layer counter to decrease on nested script end - thanks for reporting [@stevenklar](https://github.com/stevenklar)

## [2.2.12] - 13.01.2024

- add highlighting, signature and description for new reset_password_coin and reset_ctf_password
- add missing descriptions for reverse, lastIndexOf and trim in general
- add placeholders for new intrinsics
- update headless agent to work with latest version

## [2.2.13] - 13.01.2024

- add missing steam-user packages to .vscodeignore causing extension to fail loading - thanks for reporting [SkidMall](https://github.com/cantemizyurek)

## [2.2.14] - 19.01.2024

- improve parser recovery from invalid syntax
- use backpatching to enable similar MiniScript parsing of blocks, this may cause previous valid greybel syntax to be invalid especially when it comes to function blocks

## [2.2.15] - 01.03.2024

- introduce #line and #filename keyword for debugging
- fix import_code behaviour in interpreter so it's content is only executed once

## [2.2.16] - 02.03.2024

- add @description and @example tag to comment docs
- fix an issue with scp where the function would try to get the groups via the wrong property potentially causing a crash - thanks for reporting [@stevenklar](https://github.com/stevenklar)

## [2.2.17] - 10.03.2024

- add logic to automatically clean up after auto-compile (including folders)
- update share functionality with new web editor service url

## [2.2.18] - 14.03.2024

- update meta package which contains fix for rename description regarding return value on failure
- fix issue with headless agent when refreshToken was expired causing the follow up queries to timeout
- update steam client

## [2.2.19] - 16.03.2024

- fix certain cases of open blocks causing errors in unsafe parsing mode
- exclude greybel-agent from bundle

## [2.2.20] - 30.03.2024

- fix format of library version
- fix build not setting allow_import
- fix permissions when assigned them via chmod intrinsic
- fix typeof intrinsic to not check for parent classID
- fix matches regexp intrinsic causing infinite loop

## [2.2.21] - 02.04.2024

- add NaN check for numeric literal scan in order to show syntax errors on invalid numbers - thanks for reporting c1ph3r
- include lexer exceptions in diagnostics

## [2.2.22] - 05.04.2024

- ignore return statement when it's not within function scope
- remove any limitations from the vscode web version since everything seems to be compatible with code serve-web
- fix hover import and includes with missing extension
- fix document-manager for includes and imports without file extension

## [2.2.23] - 06.04.2024

- add reason to output when build in auto compile failed

## [2.3.0] - 21.04.2024

- still execute method which is called in return statement within global scope
- major improvement of interpreter in regards of performance by rewriting and optimizing parts of the bytecode-generator, internal hash-map, hashing and more
- improve multiline input via pseudo terminal
- allow key-press input mode to take value from clipboard when copy and pasting - thanks for  reporting to [@Olipro](https://github.com/Olipro) - related to [#160](https://github.com/ayecue/greybel-js/issues/139)
- fix parsing of add sub expression while being a command
- fix connect_service intrinsic - thanks for reporting to Zicore

## [2.3.1] - 25.04.2024

- when building files automatically transform CRLF to LF - thanks for reporting to Zicore and [@Stiffi136](https://github.com/Stiffi136)
- fix bytecode generator source assignment which caused the interpreter to show the wrong file when using imports - thanks for reporting to [@Stiffi136](https://github.com/Stiffi136)

## [2.3.2] - 03.05.2024

- update headless client due to latest Grey Hack update
- improve tcp client stability
- rename minify transform to uglify transform to prevent confusion

## [2.3.3] - 11.05.2024

- add link to BepInEx 5.x.x plugin
- updated description for BepInEx

## [2.3.4] - 21.05.2024

- fix is_valid_ip description example - thanks for the contribution to [@Wombynator](https://github.com/Wombynator)
- fix error message handling to avoid unintended navigation - thanks for the contribution to [@Wombynator](https://github.com/Wombynator)
- move terminal preview into external package in order to decrease size of extension
- update rnd method to only return the first generated value of a seed and not continuously generate new values of one seed to properly resemble the original MiniScript behaviour
- fix matches logic which caused skipping of results

## [2.3.5] - 26.05.2024

- fix behaviour of to_int intrinsic, only parses integers instead of floating numbers
- fix behaviour of val intrinsic, properly parse strings which have commas prior to dot

## [2.3.6] - 27.05.2024

- fix lexer which could for certain character under certain conditions cause inifinite loops

## [2.3.7] - 18.06.2024

- improve beautifier formatting - related to [#176](https://github.com/ayecue/greybel-vs/issues/176)
- add formatter - related to [#176](https://github.com/ayecue/greybel-vs/issues/176)
- separate webview from greyscript-meta
- fix behavior of val intrinsic on leading comma
- support funcRef intrinsic
- add repeat keyword - related to [#213](https://github.com/ayecue/greybel-vs/issues/213) - thanks for reporting to [@sornii](https://github.com/sornii)
- implement new type manager which keeps better track of types and properties
- fix and improve documentation regarding intrinsics
- support defining argument and return types for functions through comments to which the hover and auto complete features will react accordingly

## [2.3.8] - 20.06.2024

- add parenthesis for compound assignment - related to [#197](https://github.com/ayecue/greybel-js/issues/197) - thanks for reporting to [@sornii](https://github.com/sornii)
- add transpiler beautifier option to keep parentheses - thanks for the suggestion to [@stevenklar](https://github.com/stevenklar)
- add transpiler beautifier option to set indendation by either tab or whitespace
- add transpiler beautifier option to set amount of whitespaces for indentation

## [2.3.9] - 20.06.2024

- add dev mode for transpiler so that it won't transpile code into production ready code, meaning that for example includes or imports won't be transpiled via formatter but rather by build command

## [2.3.10] - 26.06.2024

- minor optimizations regarding type resolver such as resolving types through parentheses, keeping api definitions apart from custom definitions preventing unwanted merged definitions, using a proxy container for signature definitions and fixing line overriding for identifier causing to use wrong start lines

## [2.3.11] - 01.07.2024

- add super keyword to type-analyzer
- fix member expression containing new unary when resolving type
- only use shallow copy when copying entity to avoid memory exhaustion for type-analyzer
- properly resolve members of scope variables and api definitions for type-analyzer

## [2.3.12] - 14.07.2024

- fix resolving of namespaces
- optimize deep-hash and deep-equal
- improve error message when path not found in type
- fix typo in len meta description
- use gs instead of ms interpreter in launch intrinsic
- improve definition provider

## [2.3.13] - 15.07.2024

- add missing map intrinsic description
- fix autocomplete including map related intrinsics in general

## [2.3.14] - 15.07.2024

- properly check in type-analyzer if string in index is valid identifier
- let type-analyzer resolve isa expressions as number

## [2.3.15] - 17.07.2024

- enforce LF in import functionality just as in the build feature - related to [#222](https://github.com/ayecue/greybel-vs/issues/222) - thanks for reporting to Ren 
- let type-analyzer resolve logical expressions as number
- let type-analyzer set proper label for binary expression

## [2.3.16] - 18.07.2024

- keep multiline comments in devMode when beautifying
- fix beautify regarding multiline comments
- fix beautify when having multiple commands in one line via semicolon
- fix signature parser for multiline comments
- add support for envar, file and line in type-analyzer

## [2.3.17] - 18.07.2024

- fix misplacement of colorpicker in multiline strings
- fix launch_path meta example
- improve launch_path, program_path and launch meta descriptions

## [2.3.18] - 19.07.2024

- automatically save dirty files on build, including imports - thanks for the suggestion [@midsubspace](https://github.com/midsubspace)

## [2.3.19] - 20.07.2024

- use encoding for links in imports tooltip
- optimize build size

## [2.3.20] - 22.07.2024

- optimize interpreter task schedule, resulting in faster execution

## [2.4.0] - 24.07.2024

- fix beautify indent on shorthand if else
- make installer code more verbose, including more error messages
- update message-hook agent to version 0.5, being able to properly sync windows between the two clients (NOTE: you'll need download the newest dll manually)
- add while snippet - thanks for the suggestion Angelic
- add postCommand option to build - thanks for the suggestion [@midsubspace](https://github.com/midsubspace)
- add inject expression - related to [#218](https://github.com/ayecue/greybel-vs/issues/218) - thanks for the suggestion [@midsubspace](https://github.com/midsubspace)

## [2.4.1] - 26.07.2024

- fix folder import on workspaces - thanks for reporting to [@midsubspace](https://github.com/midsubspace)

## [2.4.2] - 01.08.2024

- show proper error message when trying to call propery from null value instead of throwing ".getWithOrigin is not a function"
- replace usage of fs paths with vscode uris to prepare for language server port

## [2.4.3] - 05.08.2024

- fix "Error: EINVAL: invalid argument, mkdir" error on build - related to [#232](https://github.com/ayecue/greybel-vs/issues/232) - thanks for reporting Pungent Bonfire

## [2.4.4] - 07.08.2024

- fix "Edit is only valid while callback runs" on transform - thanks for reporting Pungent Bonfire

## [2.4.5] - 10.08.2024

- fix bytecode generator to properly add negative numbers as default parameters, `function myFunc(index = -1)` works now
- fix handling of non literal comparisons such as biggerThan, biggerThanOrEqual, lessThan or lessThanEqual, `"23" < [42]` now correctly returns null
- properly support grouped comparisons, `"0" <= numberStr <= "9"` works now
- properly parse shorthands if those are containing a block
- fix metaxploit load not checking if returned entity is actually a file
- fix beautify not handling multiline expressions in block openers correctly resulting in unwanted new lines
- fix beautify not properly appending comment if keepParentheses option is active
- fix beautify not handling if shorthands with function blocks in them correctly resulting in unwanted new lines
- minor performance improvements in parser

## [2.4.6] - 10.08.2024

- fix beautify not properly appending comment to index expression

## [2.4.7] - 11.08.2024

- fix beautify for if shorthand clause with comment
- fix beautify adding an unwanted new line to empty blocks
- fix beautify adding unwanted new lines for if shorthands with multiline expression towards end of block

## [2.4.8] - 11.08.2024

- fix goto error functionality not working due to latest uri changes

## [2.4.9] - 17.08.2024

- move IntelliSense functionality into greybel-languageserver
- fix IntelliSense of web version of extension
- fix beautify causing misbehaviour when list/map one-liners had comment at end

## [2.4.10] - 19.08.2024

- allow binary expression to be executed as statement
- cleanup open handles of binary/logical expression that are statements

## [2.4.11] - 19.08.2024

- reduce lsp document manager tick frequency

## [2.4.12] - 19.08.2024

- properly handle missing files in ls - related to [#243](https://github.com/ayecue/greybel-vs/issues/243) - thanks for reporting to [@linuxgruven](https://github.com/linuxgruven)

## [2.4.13] - 20.08.2024

- fix handling textDocument/documentSymbol failed error in ls, which was caused when there was invalid syntax at some point - related to [#243](https://github.com/ayecue/greybel-vs/issues/243) - thanks for reporting to [@linuxgruven](https://github.com/linuxgruven)

## [2.4.14] - 29.08.2024

- update set_content tooltip to include lacking permissions as reason to return 0

## [2.4.15] - 31.08.2024

- fix tooltip formatting logic which could potentially cause "Cannot read properties of null"

## [2.4.16] - 31.08.2024

- properly handle if workspaces are null which could potentially cause "Cannot read properties of null" - thanks for reporting to Unlisted_dev

## [2.4.17] - 02.09.2024

- improve handling of workspaces in extension and lsp

## [2.4.18] - 02.09.2024

- fix error related to type analyzer that could cause "Cannot read properties of undefined (reading 'start')" in lsp - thanks for reporting to serdartpkl

## [2.4.19] - 03.09.2024

- fix beautify for parentheses and comments where a comment would be right after closing parenthese
- fix function argument recovery if invalid syntax was provided in function arguments
- rather fallback than throw error if leading slash is used but workpace is not available

## [2.5.0] - 13.09.2024

- refactor transformer in transpiler to improve transformations
- fix conflict with comments on beautify - related to [#53](https://github.com/ayecue/miniscript-vs/issues/53) - thanks for reporting to [@Xisec](https://github.com/Xisec)
- fix edge cases for variable optimizations on uglify
- fix edge cases for literal optimizations on uglify

## [2.5.1] - 16.09.2024

- fix globals shorthand identifier not getting injected when no literal optimization were happening - related to [#157](https://github.com/ayecue/greybel-js/issues/157) - thanks for reporting to [@smiley8D](https://github.com/smiley8D)
- fix behaviour of import op in runtime which caused it's payload to be called every time it was imported, instead it's only getting executed once now - related to [#222](https://github.com/ayecue/greybel-js/issues/222) - thanks for reporting to [@smiley8D](https://github.com/smiley8D)

## [2.5.2] - 27.10.2024

- properly handle values that cannot be iterated through on for loop
- fix type analyzer failing if slice expression was used after expression - related to [#255](https://github.com/ayecue/greybel-vs/issues/255) - thanks for reporting to [@ide1ta](https://github.com/ide1ta)
- add meta description for intrinsics of current nightly version
- update textmate with methods and types of current nightly version

## [2.5.3] - 28.10.2024

- add custom types handling in type analyzer - related to [#198](https://github.com/ayecue/greybel-vs/issues/198)
- fix issue related to building of larger projects which could lead to maximum call stack size exceeded error to be thrown - thanks for reporting to [@ide1ta](https://github.com/ide1ta)
- add option to enable prompt for every import to enter ingame directory - thanks for the suggestion to Phreaker

## [2.5.4] - 29.10.2024

- improve type resolve performance

## [2.5.5] - 03.11.2024

- improve type document merger performance

## [2.5.6] - 04.11.2024

- extend custom types with virtual properties
- allow "custom type" type docs above new statements
- show inherited properties of custom types properly in autocomplete

## [2.5.7] - 09.11.2024

- improve definition provider
- fix hover cache issue which resulted in tooltips not showing up
- improve autocompletion logic to use type analyzer merged document

## [2.5.8] - 10.11.2024

- properly handle cyclic isa defintions in type analyzer

## [2.5.9] - 10.11.2024

- include all custom type definitions of entities with multiple types

## [2.5.10] - 14.11.2024

- update extension readme with introductions for Linux

## [2.5.11] - 14.11.2024

- fix readme in regards of projects

## [2.5.12] - 16.11.2024

- add check in symbol provider to filter map key values out
- fix mock env folder deletion behaviour - thanks for reporting to [@ide1ta](https://github.com/ide1ta)

## [2.5.13] - 24.11.2024

- forbid keywords in uglify namespaces optimization - thanks for reporting to [@linuxgruven](https://github.com/linuxgruven)
- fix for iteration namespace optimization of __i_idx variables - thanks for reporting to [@linuxgruven](https://github.com/linuxgruven)

## [2.5.14] - 24.11.2024

- fix literal optimization for negative numeric values - thanks for reporting to [@linuxgruven](https://github.com/linuxgruven)

## [2.5.15] - 28.11.2024

- fix rnd intrinsic seed behaviour - thanks for reporting to GSQ
- fix bitwise intrinsic to properly do 64bit bitwise operations - thanks for reporting to GSQ
- extend type analyzer with workspace strategy

## [2.5.16] - 29.11.2024

- fix file resolve in workspace strategy

## [2.5.17] - 01.12.2024

- minor improvement to assumption logic of non existing properties

## [2.5.18] - 06.12.2024

- remove map and list properties from assignment registry resulting in less noise within the symbol provider
- include full namespace in symbol provider
- add new entity kinds to improve visibility of internal intrinsics in auto complete

## [2.5.19] - 07.12.2024

- fix file extension handling in build intrinsic - related to [#271](https://github.com/ayecue/greybel-vs/issues/271) - thanks for reporting to [@ide1ta](https://github.com/ide1ta)
- improve error reporting on file imports - should make it more clear what the reason for failure is

## [2.5.20] - 07.12.2024

- change type analyzer to only assume on define
- when merging internal definitions take first entity kind instead of using internal kind

## [2.5.21] - 14.12.2024

- prevent the transpiler from using special patterns when inserting transformed code - this fix resolves issues with code combinations that include special patterns such as `$$`, `$&`, `$'`, `$n`, and `$<name>`
- update hashing method in interpreter in favor of lower collision but worse performance
- add allowImport option for both installer and create ingame flow
- fix line registry in parser which could potentially mess up auto complete items within block openers - thanks for reporting to [@ide1ta](https://github.com/ide1ta)
- improve beautifier transformation in regards of comments within lists and maps

## [2.5.22] - 15.12.2024

- add open vsx to deployments

## [2.5.23] - 19.12.2024

- fix parsing of file path for breakpoints in windows - would cause breakpoints not getting triggered - thanks for reporting to foskon

## [2.5.24] - 02.01.2025

- support nested type signatures for maps and lists such as `map<string,number>` or `list<string>`
- add support to resolve type of for-in iterator
- add support to resolve type of #import namespace correctly
- resolve all possible value types if `any` type is existing in index expression

## [2.5.25] - 03.01.2025

- support nested type signatures for maps and lists in property comment docs

## [2.5.26] - 04.01.2025

- fix index expression behaviour within statement

## [2.5.27] - 05.01.2025

- fix comment docs not recognising comments in nested functions - thanks for reporting to [@redit0](https://github.com/redit0)

## [2.5.28] - 06.01.2025

- fix index expression behaviour within statement
- fix type resolve of index expression

## [2.5.29] - 06.01.2025

- fix invalid line positions of clauses when resolving type

## [2.5.30] - 06.01.2025

- improve type resolve of index expression

## [2.5.31] - 08.01.2025

- use temporary folder to use "dddd.src" as file name when building to force smallest possible binary size - thanks for the suggestion to [@redit0](https://github.com/redit0)

## [2.5.32] - 08.01.2025

- move final binary after deleting files in auto compile - thanks for reporting to [@redit0](https://github.com/redit0)

## [2.5.33] - 11.01.2025

- fix comment doc parsing swallowing first asterisk - thanks for reporting to [@redit0](https://github.com/redit0)
- fix overflow optional arg - thanks for reporting to Stigma
- automatically stringify env vars if value is an object - thanks for the suggestion to [@redit0](https://github.com/redit0)

## [2.5.34] - 12.01.2025

- escape env vars for transpiler - thanks for reporting to [@redit0](https://github.com/redit0)
- fix documentation example for move intrinsic
- fix documentation description for range - thanks for reporting to Stigma
- fix beautify transpilation handling of call expressions with arguments that have new lines - thanks for reporting to Stigma

## [2.5.35] - 18.01.2025

- show error when continue or break are used if there is no wrapping iterator block - related to [#289](https://github.com/ayecue/greybel-vs/issues/289) - thanks for reporting to Stigma
- fix lib_name not appending `.so` - thanks for reporting to Stigma
- fix decipher regarding bank passwords - thanks for reporting to Stigma
- add another new line at end of passwd - thanks for reporting to Stigma

## [2.5.36] - 26.01.2025

- fix rename intrinsic - thanks for reporting to [@ide1ta](https://github.com/ide1ta)

## [2.5.37] - 26.01.2025

- fix aireplay cap creation using wrong value - related to [#292](https://github.com/ayecue/greybel-vs/issues/292) - thanks for reporting to [@Patrick-van-Halm](https://github.com/Patrick-van-Halm)

## [2.5.38] - 30.01.2025

- raise client version in headless client to latest public Grey Hack version

## [2.5.39] - 03.02.2025

- update language server to latest version

## [2.5.40] - 05.02.2025

- update language server to latest version
- update meta descriptions

## [2.5.41] - 19.02.2025

- deprecate post command feature due to exploiting
- deprecate headless client due no further support

## [2.6.0] - 21.02.2025

- decrease extension size
- auto resolve file extensions
- update BepInEx plugin dependencies - should be now compatible with latest 6.0.0 version
- use new client package in preparation of new message-hook version

## [2.6.1] - 22.02.2025

- fix browser file auto extension resolve

## [2.6.2] - 22.02.2025

- support meta tags for import_code

## [2.6.3] - 23.02.2025

- fixed issue with documentation comments where omitting the return type but including other tags resulted in no type being assigned


## [2.6.4] - 23.02.2025

- fixed behaviour of path resolve if path points to non existing file

## [2.6.5] - 25.02.2025

- update aireplay documentation
- fixed issue with documentation comments where @description was still visible after the recent changes

## [2.6.6] - 01.03.2025

- update api docs to use optimised version
- fixed issue with documentation comments where @example was still visible after the recent changes - thanks for reporting to [@redit0](https://github.com/redit0)

## [2.6.7] - 02.03.2025

- fixed issue with workspace strategy which resulted in errors due to toposort not being able to handle unknown nodes - thanks for reporting to [@Tofferbear](https://github.com/Tofferbear)

## [2.6.8] - 02.03.2025

- enable self and super to be overriden in type analyzer if context is not available

## [2.6.9] - 07.03.2025

- fixed behaviour in interpreter for comparison of functions, should now properly detect if an intrinsics function is the same as the one in the general namespace
- update meta description with new is_patched method
- update textmate definitions
- update internal api view to latest version

## [2.6.10] - 15.03.2025

- fixed is_closed meta description - thanks for reporting to Ephy

## [2.6.11] - 24.03.2025

- fixed program_path to return current program path
- fixed launch_path to return original program path

## [2.6.12] - 12.04.2025

- fixed values to return identical instance of list
- fixed sort ascending and descending

## [2.6.13] - 03.05.2025

- add new debugger which is able to interact with game environment (message-hook has to be updated)
- make upload agent port configurable
- make interpreter agent port configurable

## [2.6.14] - 04.05.2025

- use compression for large message related to in-game debugging

## [2.6.15] - 04.05.2025

- wait for context disposal when disconnecting in order to get process properly killed in game

## [2.6.16] - 04.05.2025

- fix decipher process for in-game runtime

## [2.6.17] - 08.05.2025

- show proper error in case file reference cannot be resolved due to parsing error, related to in-game env

## [2.6.18] - 09.05.2025

- properly handle namespace import when used in files imported via native import_code - thanks for reporting to [@Dixeet](https://github.com/Dixeet)
- properly support #import behaviour for in-game runtime

## [2.6.19] - 10.05.2025

- fix bottleneck in parser, was specifically noticable with big files exceeding 1mil characters
- fix null pointer exception in breakpoint implementation for in-game runtime
- ignore disabled breakpoints

## [2.6.20] - 11.05.2025

- improve message-hook version checker
- fix interpreter location context naming for default interpreter

## [2.6.21] - 11.05.2025

- fix file transfer process for in-game runtime
- add programName setting for in-game runtime

## [2.6.22] - 11.05.2025

- fix terminal going wild in a certain scenario when switching from mock to in-game env

## [2.6.23] - 11.05.2025

- fix error response in message-hook for BepInEx 5.x.x.x version
- minor optimizations in message-hook

## [2.6.24] - 14.05.2025

- support clear message in handler for in-game runtime
- properly send keyCode for keys such as arrow keys, space, enter etc for in-game runtime
- support env files

## [2.6.25] - 14.05.2025

- handle undefined environmentFile variable, prevents possible issues after update due to addition of env file option

## [2.6.26] - 15.05.2025

- fixed a sporadic NullPointerException in the parser occurring during the auto-compile phase of the create-ingame process on Windows
- improved reliability of the auto-compile script in the create-ingame process on Windows by implementing retry logic for temporary file detection - this addresses premature exits in the file copy operation that caused occasional desynchronization

## [2.6.27] - 16.05.2025

- added option to define additional file extensions considered during file extension auto-resolution - thanks for the suggestion to [@EntitySeaker](https://github.com/EntitySeaker)
- added ability to specify a root file that is built or run regardless of the current execution context
- added watch functionality to automatically build when files change - has to be activated
- added option to define the name of the main output file - thanks for the suggestion to [@EntitySeaker](https://github.com/EntitySeaker)
- add categories to extension settings to get a better overview

## [2.6.28] - 17.05.2025

- split build and run commands into separate commands, tailored to the root file and contextual files - thanks for the suggestion to [@midsubspace](https://github.com/midsubspace)
- introduce command categories for better organization and discovery
- run message handling in message-hook on the Unity main thread to prevent Mono-related crashes - fixes rare, seemingly random crashes caused by background task execution

## [2.6.29] - 26.05.2025

- add more safety and suppress log in exit process handler for app controller in message-hook related to in-game runtime
- update assembly to latest version

## [2.6.30] - 27.05.2025

- maintain parser behaviour for native builds without imports in-game related to message-hook

## [2.6.31] - 28.05.2025

- fix textmate definition for meta-typing pattern

## [2.6.32] - 29.05.2025

- fix potential desync in client message forwarder related to message-hook

## [2.6.33] - 29.05.2025

- use BepInEx threading helper instead of directly accessing the Unity thread to prevent race conditions in the message hook
- update assembly to latest version

## [2.6.34] - 03.06.2025

- fix issue that resulted in debugMode option not being properly forwarded, causing breakpoints to not work - related to [#337](https://github.com/ayecue/greybel-vs/issues/337) - thanks for reporting to [dukeofsussex](https://github.com/dukeofsussex)
- use fs path instead of uri path for the debugger to ensure resources are correctly found on Windows - related to [#337](https://github.com/ayecue/greybel-vs/issues/337) - thanks for reporting to [dukeofsussex](https://github.com/dukeofsussex)
- add timeout to watcher to prevent watcher being blocked in case of no response

## [2.6.35] - 03.06.2025

- use fs path in in-game environment debugger as well to ensure resources are correctly found on Windows - related to [#337](https://github.com/ayecue/greybel-vs/issues/337)

## [2.6.36] - 10.06.2025

- update current_path description to make it clear that it returns a folder
- update get_custom_object example to show a more common usecase
- update typeof description to include partial object types
- update preview to support several resolutions

## [2.6.37] - 12.06.2025

- forcefully terminate the execution thread to prevent lingering background processes in the in-game environment - requires the message-hook to be updated

## [2.6.38] - 14.06.2025

- fixed display of type definitions for exported namespaces when using #import (applies to both type analyzer strategies)
- resolved issues with nested #import statements failing to recognize exported namespaces (applies to both type analyzer strategies)
- updated LRU cache dependency

## [2.6.39] - 28.06.2025

- use bepinex traverse to retrieve helperImport property in interpreter patch to prevent randomly occuring crashes - requires the message-hook to be updated

## [2.6.40] - 06.07.2025

- added tutorial video on setting up the extension and installing the message-hook plugin - huge thanks to [@redit0](https://github.com/redit0)

## [2.6.41] - 11.07.2025

- fixed script crashing on user_input due to missing cpu usage instance initialisation, related to in-game env - requires the message-hook to be updated

## [2.6.42] - 18.07.2025

- updated message-hook to use latest assembly and unity version - the prior message-hook version seems to work fine with the latest Grey Hack patch, therefore this update is rather optional
- updated message-hook-client regarding login payload
- significantly reduced build time, for projects with a lot of small files, by caching I/O operations - thanks for reporting to IDelta
- prevented unnecessary deletion retries during auto-compile - thanks for reporting to Dough San and IDelta

## [2.6.43] - 20.07.2025

- separated resource loading from dependency tree creation in transpiler
- run resource loading for transpiler in parallel for better performance
- optimized the transpiler to fetch metadata only when needed

## [2.6.44] - 08.08.2025

- show location of faulty import line when building failed due to an invalid dependency
- refactored document management in the LSP to eliminate redundant file operations
- refactored type map merging in the LSP to avoid unnecessary merges and resolve inconsistencies caused by improperly handled type maps
- refactored static code analyser resulting in better performance and more precise types

## [2.6.45] - 09.08.2025

- fix default params element type in type analyser
- fix doubled occurrences of globals, outer, params and locals in autocomplete

## [2.6.46] - 09.08.2025

- resolve union types properly if only one variant is available in type analyser

## [2.6.47] - 09.08.2025

- assume self type correctly when used in arguments and context is available (related to type analyser)
- auto create map type if path does not yet have a map defined via virtual properties (related to type analyser)