# greybel-vs

This toolkit provides essential tools for developing in GreyScript, the scripting language used in [Grey Hack](https://greyhackgame.com). The extension offers syntax highlighting, code execution, bundling, minification, and more to streamline GreyScript development in VSCode.

**Prefer a different editor?** The [GreyScript Language Server](https://github.com/ayecue/greybel-languageserver/blob/main/packages/node/README.md) is also available and compatible with IDEs like Sublime Text, IntelliJ, nvim and more. Examples for setting up these editors are included in the repository.

# Links

[![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/ayecue.greybel-vs?style=for-the-badge&label=VS%20Marketplace&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=ayecue.greybel-vs)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/ayecue.greybel-vs?style=for-the-badge&logo=microsoft)](https://marketplace.visualstudio.com/items?itemName=ayecue.greybel-vs)
[![GitHub Repo stars](https://img.shields.io/github/stars/ayecue/greybel-vs?style=for-the-badge)](https://github.com/ayecue/greybel-vs)
[![License](https://img.shields.io/github/license/ayecue/greybel-vs?style=for-the-badge)](https://github.com/ayecue/greybel-vs/blob/master/LICENSE)
[![OpenVSX Registry](https://img.shields.io/open-vsx/dt/ayecue/greybel-vs?color=purple&label=OpenVSX%20Downloads&style=for-the-badge)](https://open-vsx.org/extension/ayecue/greybel-vs)

**Project Resources**
- [Changelog](https://github.com/ayecue/greybel-vs/blob/main/CHANGELOG.md): View the latest changes and updates.
- [greybel-js CLI](https://github.com/ayecue/greybel-js): Command-line interface for Greybel.
- [GreyScript Documentation](https://documentation.greyscript.org): API documentation for GreyScript.

**Projects Using Greybel**
- [minizod](https://github.com/cantemizyurek/minizod): A lightweight, Zod-inspired validation library for MiniScript.
- [Minesweeper](https://github.com/ayecue/minesweeper-gs): A Minesweeper game created in GreyScript. (Demo project)
- [JSON Parser](https://github.com/ayecue/json): JSON parsing functionality. (Demo project)
- [TEdit](https://github.com/ayecue/tedit): Text editor built with GreyScript. (Demo project)

<small>Do you have a project that uses Greybel? If so, feel free to create a pull request to showcase it here.</small>

**Grey Hack Tools**
- [Image Transformer](https://github.com/ayecue/gh-image-transformer): Tool for transforming images in Grey Hack.
- [Website Image Generator](https://github.com/ayecue/gh-website-image-generator): Tool for generating Grey Hack website images.

**Community**
- [awesome-greyhack](https://github.com/stevenklar/awesome-greyhack): List with several resources related to Grey Hack.
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

- **Autocomplete**: Activate/Deactivate
- **Create in-game**
  - **Active**: Activate/Deactivate
  - **Auto Compile**: Auto compile and delete source files
  - **Allow Import**: Enable allowImport on auto compile
  - **Port**: Select the port of the message-hook server
- **Diagnostic**: Activate/Deactivate
- **Hoverdocs**: Activate/Deactivate
- **Formatter**: Activate/Deactivate
- **Interpreter**
  - **Default Args**: Default call arguments
  - **Environment Variables**: JSON used to define environment variables (ENVs)
  - **Hide Unsupported Text Mesh Pro Rich Text Tags**: Hides unsupported rich tags in the pseudo-terminal
  - **Seed**: Seed used to generate the testing environment
  - **Silence Error Popups**: Silences error popups due to execution failure
  - **Port**: Select the port of the message-hook server
  - **Environment type**: Interpreter environment type
  - **Program name**: Defines program name in runtime
- **Transpiler**
  - **Build Type**: Default, Uglify, Beautify
  - **Beautify**
    - **Indentation**: Tab or whitespace. What should be used for indentation?
    - **Indentation Spaces**: In case whitespace is used this will determine the amount of whitespaces
    - **Keep Parentheses**: Will always use parentheses
  - **Literals Optimizations**: Activate/Deactivate
  - **Namespaces Optimizations**: Activate/Deactivate
  - **Environment Variables**: JSON used to define environment variables (ENVs)
  - **Excluded Namespaces**: List of namespaces that should not be optimized
  - **In-game Directory**: Destination folder used in the game
  - **Installer**
    - **Active**: Activate/Deactivate
    - **Auto Compile**: Adds boilerplate code to the installer for auto-deletion of the script after execution
    - **Allow Import**: Enable allowImport when performing auto compile in installer
    - **Max Chars**: Define the maximum number of characters at which the installer should split the code
  - **Obfuscation**: Enables minification of namespaces using special characters
- **Type Analyzer**
  - **Strategy**: Specifies which files are used for type resolution. The "Dependency" strategy resolves types from all files imported into the current file. Alternatively, the "Workspace" strategy resolves types from all files within the workspace
  - **Exclude**: Specifies files to ignore based on matching glob patterns
 


# Features

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

## Transform

Transpiles your code into a specific format. Be sure to select your desired output in the settings. By default, the "Default" build type is selected.

### Output modes

There are three different modes: "Default", "Uglify", and "Beautify". The output will vary depending on the mode selected.

- **Default**: No special behavior like optimization or formatting. This format is the best all-rounder if you're unsure.
- **Uglify**: Minifies your code and optimizes literals and namespaces. You can disable these features if necessary, especially if namespaces must remain unchanged for your code to function properly. You can also exclude specific namespaces from optimization.

  ![Exclude namespaces](https://github.com/ayecue/greybel-vs/blob/main/assets/settings-exclude-namespaces.png?raw=true "Exclude namespaces")

- **Beautify**: Formats your code to improve readability. There is currently no customizability available in this mode, which might limit its use case.

### Imports (Transform)

**Important**: Unlike the build function, transforms will ignore any [#include](#import), [#import](#import), or [import_code](#import_code) lines. Use the [build](#build) functionality instead.

![Minified File](https://github.com/ayecue/greybel-vs/blob/main/assets/minified.png?raw=true "Minified file")

### Environment (Transform)

Greybel allows you to inject environment variables during transformation. These can be configured in the extension settings.

![Env Settings](https://github.com/ayecue/greybel-vs/blob/main/assets/settings-env.png?raw=true "Env Settings")

## Build

Building transforms and bundles your scripts in a way that makes them easy to import into [Grey Hack](https://greyhackgame.com). As mentioned in the [transform section](#transform), building also provides [three different output modes](#output-modes): "Default", "Uglify", and "Beautify". For more details, check out the [output-modes section](#output-modes).

### Auto create files in-game

You can automatically create transpiled files in the game by enabling the "create-ingame" option.

#### Message Hook

The message-hook agent allows you to send messages to the game server through the game client. To use this feature, you need to first install [BepInEx](https://github.com/BepInEx/BepInEx) and then the plugin. Below, you can find installation instructions for both versions of BepInEx.

##### BepInEx 5.x.x
1. **Download BepInEx 5.x.x**: [BepInEx v5.4.23.2](https://github.com/BepInEx/BepInEx/releases/tag/v5.4.23.2)
    - Install by extracting BepInEx files into your Grey Hack game folder (location of the game executable). See the [Installation Guide](https://docs.bepinex.dev/articles/user_guide/installation/index.html) if needed.
2. **Add the Plugin**: Download [GreyHackMessageHook5.dll](https://gist.github.com/ayecue/b45998fa9a8869e4bbfff0f448ac98f9/raw/ab5e62e12c1c79e70f3b5bd152844f853a1a0925/GreyHackMessageHook5.dll) and move it to the plugins folder in BepInEx.
3. **Configure Launch Options (macOS/Linux Only)**:
    - Go to Steam Library > Grey Hack > Properties > Launch Options.
      - **macOS**: `"/path/to/Steam/steamapps/common/Grey Hack/run_bepinex.sh" %command%`
      - **Linux**: `"/path/to/.steam/steam/steamapps/common/Grey Hack/run_bepinex.sh" || %command%`
4. **Launch Grey Hack** via Steam to load BepInEx 5 with the plugin.

##### BepInEx 6.x.x
1. **Download BepInEx 6.x.x**: [BepInEx version 6.0.0-pre.2 Unity.Mono](https://github.com/BepInEx/BepInEx/releases/tag/v6.0.0-pre.2)
    - Install by extracting BepInEx files into your Grey Hack game folder (location of the game executable). See the [Installation Guide](https://docs.bepinex.dev/master/articles/user_guide/installation/unity_mono.html) if needed.
2. **Add the Plugin**: Download [GreyHackMessageHook.dll](https://gist.github.com/ayecue/b45998fa9a8869e4bbfff0f448ac98f9/raw/ab5e62e12c1c79e70f3b5bd152844f853a1a0925/GreyHackMessageHook.dll) and move it to the plugins folder in BepInEx.
3. **Configure Launch Options (macOS/Linux Only)**:
    - Go to Steam Library > Grey Hack > Properties > Launch Options.
      - **macOS**: `"/path/to/Steam/steamapps/common/Grey Hack/run_bepinex.sh" %command%`
      - **Linux**: `"/path/to/.steam/steam/steamapps/common/Grey Hack/run_bepinex.sh" || %command%`
4. **Launch Grey Hack** via Steam to load BepInEx 6 with the plugin.

With all that done you can now start the game and start either a single-player or multiplayer session. You'll be now able to sync files with the game without getting disconnected.

Also, keep in mind that if you use BepInEx 6.x.x you'll use bleeding edge meaning that it won't be as stable as BepInEx 5.x.x leading to potential crashes. If you suffer too many crashes with 6.x.x may try out version 5.x.x!

**Note**: For this agent to work you **have to have Grey Hack running**.

### Imports on building

Scripting in Grey Hack can be challenging, especially when you have files that import each other or are working on a larger project where you have to copy-paste each file manually into the game every time. Greybel aims to reduce this hassle, allowing you to spend more time coding and playing rather than copy-pasting files repeatedly.

![Build output](https://github.com/ayecue/greybel-vs/blob/main/assets/build.png?raw=true "Build output")

#### Dependency Management (Transpiler)

Greybel enables you to split your code into different files, which helps maintain readability and also makes your code reusable.

It is recommended to use [include](#include) and [import](#import) for small or medium-sized projects.

For larger projects, [import_code](#import_code) should be used instead, as the transpiler will bundle your files in a way that maximizes the use of [import_code](#import_code) in the game, helping to avoid exceeding the maximum character limit of **160,000**.

Cyclic dependencies will also be detected. If a cyclic dependency is found, an error will be thrown, indicating which file is causing it.

A step-by-step guide is available [here](https://main.greyscript.org/manuals/useful-tools-for-greyscript.html#manage-your-dependencies).

##### Import

Used to import exported namespaces from a file. Features:
- Supports relative imports
- Loads code only when required
- Does not pollute global scope
- Only imports once, no matter how many times it’s referenced
- Exports only what you want
- Code is appended to the root file, which may exceed the character limit in GreyHack. If that's an issue, use [import_code](#import_code) instead

You can check out the [example code](https://github.com/ayecue/greybel-js/blob/master/example/import) for a better understanding of how to use this feature.

##### Include

Used to import the content of a file. Features:
- Supports relative includes
- Easy to use
- Pollutes global scope
- Includes the content every time, which may lead to redundant code
- May exceed the character limit of GreyHack, so use [import_code](#import_code) instead if this is a concern

You can review the [example code](https://github.com/ayecue/greybel-js/blob/master/example/include) for more details.

##### import_code

Used to import code from a file. Features:
- Keeps files separate in-game, helping to avoid the character limit
- Supports nested `import_code`
- Supports relative imports

Here’s some [example code](https://github.com/ayecue/greybel-js/blob/master/example/import-code).

When the installer option is enabled, Greybel will create one or more installer files depending on the size of your project. These installer files will contain all the code files and logic to create the files in the game. Essentially, you just need to copy and paste the installer code into the game, then compile and execute it. Using the `--auto-compile` flag adds logic to automatically compile the project and remove all source files.

![Max chars](https://github.com/ayecue/greybel-vs/blob/main/assets/settings-max-chars.png?raw=true "Max chars")

By setting up the in-game directory in the settings, you can define where you want the files to be imported in the game. By default, `/root/` is used.

Additionally, **nested** `import_code` is supported. This is achieved by moving all imports into the entry file based on their usage throughout the project. It’s recommended to only use `import_code` at the head of the file, as the import locations of nested files cannot be guaranteed.

### Syntax

Any valid MiniScript or GreyScript syntax is supported. Additionally, some minor syntax sugar is added to these languages. If you use these features, keep in mind to transpile your code first. Using these is completely optional.

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
The filename expression will be replaced with the string literal containing the name of the file before transpiling. This can be useful for debugging.

### Line expression
```
print(#line)
```
The line expression will be replaced with the number literal containing the line of the expression before transpiling. This can be useful for debugging.

### Envar expression
```
print(#envar MY_TEST_VAR)
```
The envar expression will be replaced with the value of the provided environment variable. Make sure you define an environment variable for the provided namespace. If no value is found, it will instead use `null`.

### Inject expression
```
print(#inject "path/to/file";)
```
The inject expression will be replaced with the content of whatever file exists at the provided path. If the file does not exist, it will be replaced with `null`. Content injected will automatically be escaped.

## Upload

If you're not interested in the build functionality or need to upload many files into the game, you can use the "Import files into game" command. This will behave similarly to the [create-in-game build feature](#auto-create-files-in-game), but without the building step.

This feature will also use the transpiler's "Ingame directory" setting as the in-game destination.

**IMPORTANT**: Please keep in mind that you first need to setup the [message-hook](#message-hook) agent.

## Interpreter

Greybel comes with its own GreyScript interpreter, allowing you to test and debug your code outside of the game. This is partly due to the test environment that gets generated on the fly, attempting to emulate the game's API.

### Dependency Management (Interpreter)

Dependencies are dynamically loaded into the execution without any limitations. Cyclic dependencies are also supported.

### Environment Variables (Interpreter)

Greybel supports the injection of environment variables into the interpreter. These environment variables can be configured in the extension settings.

### Mock Environment

When using this environment, Greybel will automatically generate a local setup, including simulated computers, networks, filesystems, and more—on the fly. By default, generation is based on a seed value called test. You can modify this seed using the appropriate option. Using the same seed consistently will ensure that the generated entities remain stable across sessions.

The local computer configuration is hardcoded, with admin credentials set to root:test. Additionally, your local machine will have crypto.so and metaxploit.so available by default.

Note that the mock environment runs locally and is independent from the actual game. As a result, some intrinsic game behaviors may not be fully supported. If you need highly accurate debugging, consider using the [In-game Environment](#ingame-environment) instead.

#### Examples:
```
metax = include_lib("/lib/metaxploit.so") //returns metaxploit interface
print(metax) //prints metaxploit

myShell = get_shell("root", "test") //get local root shell
```

### Ingame Environment

This environment uses the actual in-game setup. To use it, you must have [message-hook](#message-hook) installed and the game running in singleplayer mode.

The key advantage of the in-game environment is that it mirrors real gameplay behavior exactly—unlike the mock environment, which is an approximation.

![Preview Demo](https://github.com/ayecue/greybel-vs/blob/main/assets/preview-debugger.gif?raw=true)

### TextMesh Pro Rich Text Support

[TextMesh Pro Rich Text](http://digitalnativestudios.com/textmeshpro/docs/rich-text/) is partially supported.

**Note**: For the pseudo-terminal, Greybel will attempt to transform TextMesh Pro Rich-Text tags into ANSI codes. Due to the nature of TextMesh Pro Rich-Text tags, some formatting may be lost. If you're looking for a proper preview of your output in Grey Hack, please check out the [Preview Output feature](#preview-output).

### Debugger

The debugger allows you to set breakpoints, run code in a breakpoint context, and jump to the next line of execution. It's helpful for debugging your code.

![Breakpoint](https://github.com/ayecue/greybel-vs/blob/main/assets/breakpoint.png?raw=true "Breakpoint")

> **Note**: Make sure to set the breakpoint on a non-empty line, or it will be skipped.

![Active Breakpoint](https://github.com/ayecue/greybel-vs/blob/main/assets/active-breakpoint.png?raw=true "Active breakpoint")

A REPL is also available while executing the script or having an active breakpoint.

![REPL](https://github.com/ayecue/greybel-vs/blob/main/assets/repl.png?raw=true "REPL")

## Preview Output

This feature creates a web view that renders actual TextMesh Pro Rich-Text tags within VSCode. Its main purpose is to emulate the actual output of the game, making it useful for drawing images or creating fancy prompts.

![Preview Demo](https://github.com/ayecue/greybel-vs/blob/main/assets/preview.gif?raw=true)

## API Browser

The API Browser for GreyScript brings the [GreyScript API Documentation](https://documentation.greyscript.org) directly into Visual Studio Code.

![API Browser](https://github.com/ayecue/greybel-vs/blob/main/assets/api-browser.png?raw=true "API Browser")

## Comment Docs

Provide signatures for your functions to show better hover tooltips. Additionally, the provided return value will be recognized by the implemented type system, resulting in context-sensitive auto-complete suggestions.
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

Shares your code via [editor.greyscript.org](https://github.com/ayecue/greybel-js#save-code). The related link will be copied to your clipboard.

## Snippets

Provides a list of available GreyHack snippets, such as `ls`, `mkdir`, and more.

![Snippets](https://github.com/ayecue/greybel-vs/blob/main/assets/snippets.png?raw=true "Snippets")

## Goto Error

Jumps to the next existing syntax error.

## Supporting Providers

This extension includes several IntelliSense providers to enhance your coding experience with GreyScript:

- **Autocompletion Provider**  
  Offers context-aware suggestions based on your current position in the code.

- **Signature Helper Provider**  
  Displays function signatures with parameter types and return values as you type, helping you use functions correctly and efficiently without needing to reference documentation.

- **Hover Tooltips Provider**  
  Displays helpful information about functions and types when you hover over them.

- **Diagnostics Provider**  
  Identifies and highlights syntax errors in your code for easier debugging.

- **Symbol Provider**  
  Lists all symbols available in the active file for easy navigation.  
  ![Symbol](https://github.com/ayecue/greybel-vs/blob/main/assets/symbols.png?raw=true "Symbol")

- **Definition Provider**  
  Locates and displays definitions within the active file and its dependencies.  
  ![Definition](https://github.com/ayecue/greybel-vs/blob/main/assets/definition-provider.png?raw=true "Definition")

- **Color Picker Provider**  
  Shows a color picker when you use color or mark tags in your code.

# Copyright

[Sloth icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/sloth)

# Contact

For questions, feature requests, or support, feel free to join the [dedicated Greybel Discord](https://discord.gg/q8tR8F8u2M).