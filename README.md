# greybel-vs

This toolkit provides essential tools for developing in GreyScript, the scripting language used in [Grey Hack](https://greyhackgame.com). The extension offers syntax highlighting, code execution, bundling, minification, and more to streamline GreyScript development in VSCode.

**Prefer a different editor?** The [GreyScript Language Server](https://github.com/ayecue/greybel-languageserver/blob/main/packages/node/README.md) is also available and compatible with IDEs like Sublime Text, IntelliJ, nvim and more. Examples for setting up these editors are included in the repository.

# Links

**Project Resources**
- [Changelog](https://github.com/ayecue/greybel-vs/blob/main/CHANGELOG.md): View the latest changes and updates.
- [greybel-js CLI](https://github.com/ayecue/greybel-js): Command-line interface for Greybel.
- [GreyScript Documentation](https://documentation.greyscript.org): API documentation for GreyScript.

**Demo Projects Using Greybel**
- [Viper 3.0](https://github.com/cantemizyurek/viper-3.0): Example project demonstrating Greybel.
- [Minesweeper](https://github.com/ayecue/minesweeper-gs): A Minesweeper game created in GreyScript.
- [JSON Parser](https://github.com/ayecue/json): JSON parsing functionality.
- [TEdit](https://github.com/ayecue/tedit): Text editor built with GreyScript.

**Grey Hack Tools**
- [Image Transformer](https://github.com/ayecue/gh-image-transformer): Tool for transforming images in Grey Hack.
- [Website Image Generator](https://github.com/ayecue/gh-website-image-generator): Tool for generating Grey Hack website images.

**Community**
- [Greybel Discord](https://discord.gg/q8tR8F8u2M): Join the community on Discord for support and discussion.

# Usage

This extension automatically detects `.gs`, `.src`, and `.ms` files and provides convenient commands to streamline your workflow.

Commands available (`CTRL+SHIFT+P`):
- `Greybel: Build` - Transpile your GreyScript code. [More info](#build)
- `Greybel: Share` - Share your code with others easily. [More info](#share)
- `Greybel: API` - Open the API browser for quick reference. [More info](#api-browser)
- `Greybel: Snippets` - Insert GreyScript snippets into your code. [More info](#snippets)
- `Greybel: Preview output` – View a preview of the ingame like output. [More info](#preview-output)
- `Greybel: Import file into the game` – Upload files into the game. [More info](#upload)

You can also access these commands through the context menu for quick right-click access:

![Context Menu](https://github.com/ayecue/greybel-vs/blob/main/assets/context-menu.png?raw=true "ContextMenu")

**Tip**: Make sure to [configure settings](#settings) to customize Greybel to your preferences.

# Settings

- Autocomplete: Activate/Deactivate
- Create in-game
  - Active: Activate/Deactivate
  - Agent: headless, message-hook
  - Mode: local, public
  - Steam User: Steam username
  - Auto Compile: Auto compile and delete source files
- Diagnostic: Activate/Deactivate
- Hoverdocs: Activate/Deactivate
- Interpreter
  - Default Args: Default call arguments
  - Environment Variables: JSON which can be used to define ENVs
  - Hide Unsupported Text Mesh Pro Rich Text Tags: Hides none supported rich tags in pseudo-terminal
  - Seed: Seed is used to generate the testing environment
  - Silence Error Popups: Silences any error popups that might show up due to execution failure
- Transpiler
  - Build Type: Default, Uglify, Beautify
  - Literals optimizations: Activate/Deactivate
  - Namespaces optimizations: Activate/Deactivate
  - Environment Variables: JSON which can be used to define ENVs
  - Excluded Namespaces: List which defines namespaces which should not be optimized
  - Ingame directory: Destination folder which should be used in the game
  - Installer
    - Active: Activate/Deactivate
    - Auto Compile: Adds boilerplate code to the installer which enables the script to delete itself after execution
    - Max chars: Define the amount characters by which the installer should be split
  - Obfuscation: Enables the transpiler to use special characters for minification of namespaces

# Features

- Syntax Highlighting
- [Transform](#transform)
- [Build](#build)
- [Upload](#upload)
- [Interpreter](#interpreter)
- [Debugger](#debugger)
- [API Browser](#api-browser)
- [Comment Docs](#comment-docs)
- [Snippets](#snippets)
- [Share](#share)
- [Goto Error](#goto-error)
- [Preview output](#preview-output)
- [Providers](#supporting-providers)
    - [Autocompletion](#autocompletion-provider)
    - [Hover Tooltips](#hover-tooltips-provider)
    - [Diagnostics](#diagnostics-provider)
    - [Symbol](#symbol-provider)
    - [Definition](#definition-provider)
    - [Colorpicker](#colorpicker-provider)

## Transform

Transpiles your code into a certain format. Remember to select your desired output in the settings. The build type "Default" is selected from the start.

### Output modes

There are three different modes "Default", "Uglify" and "Beautify". Depending on which you select the output will be different.

As the name already says "Default" will not have any special behavior such as optimization or formatting. If in doubt this format is probably the best allrounder.

"Uglify" will not only minify your code but also do literals and namespace optimization. Both of the features can be turned off as well since certain code may require namespace optimization to be turned off since namespaces may need to remain exactly named as they are since the code depends on it. Alternatively, you can also exclude namespaces from optimization.

![Exclude namespaces](https://github.com/ayecue/greybel-vs/blob/main/assets/settings-exclude-namespaces.png?raw=true "Exclude namespaces")

"Beautify" is the complete opposite of "Uglify" and will instead try to format your code in a way to improve readability. As of right now, there is currently no customizability available which may restrict its use case.

### Imports (Transform)
  
**Important**: Unlike building transforms will ignore any [#include](#import), [#import](#import) or [import_code](#import_code) line. Use the [build](#build) functionality instead.

![Minified File](https://github.com/ayecue/greybel-vs/blob/main/assets/minified.png?raw=true "Minified file")

### Environment (Transform)

Greybel enables you to inject environment variables when transforming. These environment variables can be configured in the extension settings.

![Env Settings](https://github.com/ayecue/greybel-vs/blob/main/assets/settings-env.png?raw=true "Env Settings")

## Build

Building will transform and bundle your scripts in a way that makes it easy to import into the [Grey Hack](https://greyhackgame.com). Just as mentioned in the [transform section](#transform) building provides [three different output modes](#output-modes) as well. These output modes are "Default", "Uglify" and "Beautify". If you want to know more about them please take a look at the [output-modes section](#output-modes).

### Auto create files in-game

It is possible to automatically create transpiled files in the game. This can be activated by enabling the create-ingame option. Additionally, you can choose between two agents. Depending on the agent there are certain prerequisites to fulfill or behaviors to watch out for.

#### Headless

When you are using headless you are essentially connecting to the game without using the actual native game client. Depending on which mode you selected, either `local` or `public` the agent will import the files into either singleplayer or multiplayer.

By default `local` is selected. Keep in mind that the game needs to have a single-player session running for `local` to work. For `public` there is no need to have the game client running.

A minor caveat is that a Steam account and password need to be provided. The refresh token will be cached so no continued providing of credentials is required. You can delete the refresh token at any time by using the "Clear secrets" command.

**Note**: This agent will potentially log you out of Grey Hack since Grey Hack only allows one active game session.

#### Message Hook

The message-hook agent will essentially send messages to the game server through the game client. For that to work you'll have to install [BepInEx](https://github.com/BepInEx/BepInEx) first and then the plugin second. You can find a description for both versions of BepInEx below.

##### BepInEx 5.x.x
1. **Download BepInEx 5.x.x**: [BepInEx v5.4.23.2](https://github.com/BepInEx/BepInEx/releases/tag/v5.4.23.2)
    - Install by extracting BepInEx files into your Grey Hack game folder (location of the game executable). See the [Installation Guide](https://docs.bepinex.dev/articles/user_guide/installation/index.html) if needed.
2. **Add the Plugin**: Download [GreyHackMessageHook5.dll](https://gist.github.com/ayecue/b45998fa9a8869e4bbfff0f448ac98f9/raw/af926c972880e331ec0c9d7f0cce1bea055c02bc/GreyHackMessageHook5.dll) and move it to the plugins folder in BepInEx.
3. **Configure Launch Options (macOS/Linux Only)**:
    - Go to Steam Library > Grey Hack > Properties > Launch Options.
      - **macOS**: "/path/to/Steam/steamapps/common/Grey Hack/run_bepinex.sh" %command%
      - **Linux**: "/path/to/.steam/steam/steamapps/common/Grey Hack/run_bepinex.sh" %command%
4. **Launch Grey Hack** via Steam to load BepInEx 5 with the plugin.

##### BepInEx 6.x.x
1. **Download BepInEx 6.x.x**: [BepInEx version 6.0.0-pre.1 UnityMono](https://github.com/BepInEx/BepInEx/releases/tag/v6.0.0-pre.1)
    - Install by extracting BepInEx files into your Grey Hack game folder (location of the game executable). See the [Installation Guide](https://docs.bepinex.dev/master/articles/user_guide/installation/unity_mono.html) if needed.
2. **Add the Plugin**: Download [GreyHackMessageHook.dll](https://gist.github.com/ayecue/b45998fa9a8869e4bbfff0f448ac98f9/raw/af926c972880e331ec0c9d7f0cce1bea055c02bc/GreyHackMessageHook.dll) and move it to the plugins folder in BepInEx.
3. **Configure Launch Options (macOS/Linux Only)**:
    - Go to Steam Library > Grey Hack > Properties > Launch Options.
      - **macOS**: "/path/to/Steam/steamapps/common/Grey Hack/run_bepinex.sh" %command%
      - **Linux**: "/path/to/.steam/steam/steamapps/common/Grey Hack/run_bepinex.sh" %command%
4. **Launch Grey Hack** via Steam to load BepInEx 6 with the plugin.

With all that done you can now start the game and start either a single-player or multiplayer session. You'll be now able to sync files with the game without getting disconnected.

Also, keep in mind that if you use BepInEx 6.x.x you'll use bleeding edge meaning that it won't be as stable as BepInEx 5.x.x leading to potential crashes. If you suffer too many crashes with 6.x.x may try out version 5.x.x!

Additionally, you won't need to provide any Steam credentials nor do you need to select a mode.

**Note**: For this agent to work you **have to have Grey Hack running**.

### Imports on building

Scripting in Grey Hack can be hell. Especially when you have files that import each other or any kind of bigger project where you have to copy-paste each file by hand into the game every time. Greybel tries to aid you so you spend less time copy-pasting and more time coding and playing.

![Build output](https://github.com/ayecue/greybel-vs/blob/main/assets/build.png?raw=true "Build output")

#### Dependency Management (Transpiler)

Greybel enables you to split your code into different files which is useful to keep readability and also to make reusable code.

It is recommended to use [include](#include) and [import](#import) for small or medium-sized projects.

For big projects, [import_code](#import_code) should be used instead since the transpiler will bundle your files in a way that makes full use of the [import_code](#import_code) capabilities in the game to avoid exceeding the maximum character limit of **160.000**.

Cyclic dependencies will be detected as well. In case there is one an error will be thrown indicating which file is causing it.

A step by step guide is available [here](https://main.greyscript.org/manuals/useful-tools-for-greyscript.html#manage-your-dependencies) as well.

##### Import

Used to import exported namespaces from a file. Features of this import functionality:
- supports relative imports
- only loads code when required
- does not pollute global scope
- only gets imported once regardless of how many times it got imported
- only exports what you want
- code will be appended to the root file which may cause exceeding the character limit of GreyHack, use [import_code](#import_code) instead if that is an issue

You can take a look at the [example code](https://github.com/ayecue/greybel-js/blob/master/example/import) to get a better idea of how to use this feature.

##### Include

Used to import the content of a file. Features of this import functionality:
- supports relative includes
- very easy to use
- will pollute global scope
- will include the content of a file every time, which may cause redundant code
- may cause exceeding the character limit of GreyHack, use [import_code](#import_code) instead if that is an issue

To get a better idea you can take a look at the following [example code](https://github.com/ayecue/greybel-js/blob/master/example/include).

##### import_code

Used to import code from a file. Features of this import functionality:
- keeps files separate in-game, which is useful to avoid the character limit
- supports nested `import_code`
- supports relative imports

Here is some [example code](https://github.com/ayecue/greybel-js/blob/master/example/import-code).

By having the installer option active Greybel will create one or more installer files depending on the size of your project. These installer files will essentially contain all different code files and logic to create all files in the game. So basically you just need to copy and paste the code of the installer files into the game and then compile + execute them. By using the `--auto-compile` flag additional logic will be appended that will automatically compile the project and remove all source files.

![Max chars](https://github.com/ayecue/greybel-vs/blob/main/assets/settings-max-chars.png?raw=true "Max chars")

By setting up the in-game directory in the settings you can also define to which in-game space you want to import the files. By default `/root/` will be used.

Additionally, it is important to mention that **nested** `import_code` is supported as well. This is made possible by moving all imports into the entry file depending on their usage throughout the project. It is recommended to only use `import_code` at the head of the file since the import locations of nested files cannot be guaranteed.

### Syntax

Any valid MiniScript or GreyScript syntax is supported. Additionally, some minor syntax sugar is added to those languages. If you use those keep in mind to transpile your code first. Using these is completely optional though.

### No trailing comma is required in maps or lists
```
myList = [
	false,
	null
]

myMap = {
	"test": {
		"level2": {
			"bar": true
		}
	}
}
```

### Math - shorthand
```
a /= b
a *= b
a -= b
a += b
```

### Bitwise - shorthand
```
a = b << c
a = b >> c
a = b >>> c
a = b | c
a = b & c
```

### Block comment
```
/*
	My block comment
*/
print("test")
```

### Filename expression
```
print(#filename)
```
The filename expression will be replaced with the string literal containing the name of the file before transpiling. Can be useful for debugging.

### Line expression
```
print(#line)
```
The line expression will be replaced with the number literal containing the line of the expression before transpiling. Can be useful for debugging.

### Envar expression
```
print(#envar MY_TEST_VAR)
```
The envar expression will be replaced with the value of the provided environment variable. Make sure you defined an environment variable for the provided namespace if there is no value found it will instead use `null`.

### Inject expression
```
print(#inject "path/to/file";)
```
The inject expression will be replaced with the content of whatever file exists at the provided path. In case the file does not exist it will be replaced with `null`. Content that gets injected will automatically be escaped.

## Upload

In case you are not interested at all in the build functionality or require to upload a lot of files into the game you can also use the "Import files into game" command. It will pretty much have the same behavior as the [create-ingame build feature](#auto-create-files-in-game) just without building.

This feature will also use the transpiler "Ingame directory" setting as the in-game destination.

## Interpreter

Greybel comes with its own GreyScript interpreter. Which enables you to test and debug your code outside of the game. This is partly also due to the test environment which gets generated on the fly trying to emulate the games API.

### Dependency Management (Interpreter)

Dependencies will be dynamically loaded into the execution without any limitations. Cyclic dependencies are supported as well.

### Environment Variables (Interpreter)

Greybel supports the injection of environment variables for the interpreter as well. These environment variables can be configured in the extension settings.

### Local environment

[Greybel GreyHack Intrinsics](https://github.com/ayecue/greybel-gh-mock-intrinsics) will automatically generate a local environment. It will also generate other computers, networks, filesystems etc on the fly. Generating is by default based on a seed called `test`. The seed can be modified with the seed option. While using the same seed-generated entities should stay consistent.

The local computer setup is hard coded. The admin credentials are `root:test`. You will also have `crypto.so` and `metaxploit.so` on your local computer available.

Examples:
```
metax = include_lib("/lib/metaxploit.so") //returns metaxploit interface
print(metax) //prints metaxploit

myShell = get_shell("root", "test") //get local root shell
```

### Greyscript API support

The intrinsics to support the Greyscript API are provided by [Greybel Intrinsics](https://github.com/ayecue/greybel-intrinsics) and [Greybel GreyHack Intrinsics](https://github.com/ayecue/greybel-gh-mock-intrinsics). Keep in mind that not all of these functions are completely mocked. Also, only API that is available in the stable build will be implemented.

Not yet supported:
- `AptClient` - only polyfill which "returns not yet supported"
- `Blockchain` - only polyfill which "returns not yet supported"
- `Wallet` - only polyfill which "returns not yet supported"
- `SubWallet` - only polyfill which "returns not yet supported"
- `Coin` - only polyfill which "returns not yet supported"

### TextMesh Pro Rich Text support

[TextMesh Pro Rich Text](http://digitalnativestudios.com/textmeshpro/docs/rich-text/) is partially supported. 

**Note**: For the pseudo-terminal Greybel will try to transform TextMesh Pro Rich-Text tags into ANSI-Codes. Due to the nature of TextMesh Pro Rich-Text tags some formatting will get lost. If you are looking for a proper preview of your output in Grey Hack please check out [the preview output feature](#preview-output).

### Debugger

Enables you to set breakpoints, run code in a breakpoint context, jump to the next line of execution etc. Generally helpful if you want to debug your code.

![Breakpoint](https://github.com/ayecue/greybel-vs/blob/main/assets/breakpoint.png?raw=true "Breakpoint")

Keep in mind to set the breakpoint on a none empty line. Otherwise, it will just skip that breakpoint.

![Active breakpoint](https://github.com/ayecue/greybel-vs/blob/main/assets/active-breakpoint.png?raw=true "Active breakpoint")

A REPL is also available while executing the script or having an active breakpoint.

![REPL](https://github.com/ayecue/greybel-vs/blob/main/assets/repl.png?raw=true "REPL")

## Preview output

Will create a web view that will render actual TextMesh Pro Rich-Text tags in your VSCode. Main purpose of this feature is to emulate the actual output of the game. So in case you want to draw images or do fancy prompts this might be useful.

![Preview Demo](https://github.com/ayecue/greybel-vs/blob/main/assets/preview.gif?raw=true)

## API Browser

API Browser for GreyScript. Basically a version of the [GreyScript API Documentation](https://documentation.greyscript.org) page within Visual Studio Code.

![API Browser](https://github.com/ayecue/greybel-vs/blob/main/assets/api-browser.png?raw=true "API Browser")

## Comment Docs

Provide signatures for your functions to show better hover tooltips. Additionally, the provided return value will be recognized by the implemented type system and thus result in context-sensitive auto-complete suggestions.
```js
// Hello world
// I am **bold**
// @description Alternative description
// @example test("title", 123)
// @param {string} title - The title of the book.
// @param {string|number} author - The author of the book.
// @return {crypto} - Some info about return
test = function(test, abc)
  print(test)
end function
```
There is also the possibility of custom types. Here an example:
```js
// @type Bar
// @property {string} virtualMoo
// @property {string} nested.virtalMoo
Bar = {}
Bar.moo = ""

// Hello world
// I am **bold**
// @description Alternative description
// @example test("title", 123)
// @param {string} title - The title of the book.
// @param {string|number} author - The author of the book.
// @return {Bar} - Some info about return
Bar.test = function(test, abc)
	print("test")
	return self
end function

// @type Foo
Foo = new Bar
// @return {Foo}
Foo.New = function(message)
	result = new Foo
	return result
end function

myVar = Foo.New

myVar.test // shows defined signature of Bar.test on hover
myVar.virtualMoo // shows virtual property of type string on hover
myVar.nested.virtalMoo // shows nested virtual property of type string on hover
```

## Share

Shares your code via [editor.greyscript.org](https://github.com/ayecue/greybel-js#save-code). The related link will be written into the clipboard.

## Refresh

Will refresh the AST Cache which is used for diagnostics, hover tooltips and autocompletion.

## Snippets

Will return a list of available GreyHack snippets. Such as `ls`, `mkdir` and more.

![Snippets](https://github.com/ayecue/greybel-vs/blob/main/assets/snippets.png?raw=true "Snippets")

## Goto Error

Jumps to the next existing syntax error.

## Supporting providers

### Autocompletion Provider

Figures out the current context and provides suggestions accordingly.

### Hover Tooltips Provider

Returns information about functions/types.

### Diagnostics Provider

Returns information about syntax errors in your code.

### Symbol Provider

Returns list of all available symbols in the active file.

![Symbol](https://github.com/ayecue/greybel-vs/blob/main/assets/symbols.png?raw=true "Symbol")

### Definition Provider

Shows definitions in the currently active file and its dependencies.

![Definition](https://github.com/ayecue/greybel-vs/blob/main/assets/definition-provider.png?raw=true "Definition")

### Colorpicker Provider

Shows the color picker if you got color or mark tags.

# Copyright

[Sloth icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/sloth)

# Todo

* implement missing intrinsics
* improve mock environment

# Contact

If you have any questions, feature requests or need help feel free to join the [dedicated Greybel Discord](https://discord.gg/q8tR8F8u2M).