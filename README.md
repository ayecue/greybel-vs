# greybel-vs

GreyScript toolkit for [Grey Hack](https://greyhackgame.com). Includes highlighting, code execution, bundling and minifying among other features. Check out the [changelog](https://github.com/ayecue/greybel-vs/blob/main/CHANGELOG.md) to get information on the latest changes.

Based on [greybel-js](https://github.com/ayecue/greybel-js).

If you need some GreyScript API information you can also look into this [GreyScript Documentation](https://documentation.greyscript.org).

## Usage

Automatically detects `.gs` and `.src` files.

Commands available (`CTRL+SHIFT+P`):
- `Greybel: Build` - [info](#build)
- `Greybel: Goto Error` - [info](#goto-error)
- `Greybel: Transform to clipboard` - [info](#transform)
- `Greybel: Transform` - [info](#transform)
- `Greybel: Minify` - Shortcut for [info](#transform). Will use minify as build type.
- `Greybel: Beautify` - Shortcut for [info](#transform). Will use beautify as build type.
- `Greybel: Share` - [info](#share)
- `Greybel: Refresh` - [info](#refresh)
- `Greybel: API` - [info](#api-browser)
- `Greybel: Snippets` - [info](#snippets)

You can also access most of the commands via the context menu:

![Context Menu](https://github.com/ayecue/greybel-vs/blob/main/assets/context-menu.png?raw=true "ContextMenu")

Do not forget to set up your plugin to your needs. The following settings are available:

- Activate/Deactivate
    - Autocomplete
    - Hoverdocs
    - Installer
- Transpiler specific
    - Ingame directory
    - Build type
    - Disable literals optimization
    - Disable namespaces optimization
    - Environment variables
    - Excluded namespaces when optimizing
    - Obfuscation
- Interpreter specific
    - Define seed
    - Environment variables
- Installer specific
    - Define max characters per file

## Features

- Syntax Highlighting
- [Transform](#transform)
- [Build](#build)
- [Interpreter](#interpreter)
- [Debugger](#debugger)
- [API Browser](#api-browser)
- [Snippets](#snippets)
- [Share](#share)
- [Goto Error](#goto-error)
- [Providers](#supporting-providers)
    - [Autocompletion](#autocompletion-provider)
    - [Hover Tooltips](#hover-tooltips-provider)
    - [Diagnostics](#diagnostics-provider)
    - [Symbol](#symbol-provider)
    - [Definition](#definition-provider)
    - [Colorpicker](#colorpicker-provider)

### Transform

Transforms the content of the active text document into one of three possible output types:
- Default (active by default): Minor optimizations
- Uglify: Minified
- Beautify: Beautified
  
**Important**: Transforms will ignore any [include](https://github.com/ayecue/greybel-js#include), [import](https://github.com/ayecue/greybel-js#import) or [import_code](https://github.com/ayecue/greybel-js#import_code) line. Use the [build](#build) functionality instead.

![Minified File](https://github.com/ayecue/greybel-vs/blob/main/assets/minified.png?raw=true "Minified file")

Environment values will be injected while transforming. Environment values can be configurated in the options of the Greybel-VS extension.

![Env Settings](https://github.com/ayecue/greybel-vs/blob/main/assets/settings-env.png?raw=true "Env Settings")

Additionally, there is an option to define which namespaces should be excluded from getting transformed or optimized.

![Exclude namespaces](https://github.com/ayecue/greybel-vs/blob/main/assets/settings-exclude-namespaces.png?raw=true "Exclude namespaces")

More details [here](https://github.com/ayecue/greybel-js#transpiler).

### Build

Transforms and bundles your files which makes it easier to import them into GreyHack. As described in the [transform section](#transform) it has three possible transformation types and supports environment variables as well.

![Build output](https://github.com/ayecue/greybel-vs/blob/main/assets/build.png?raw=true "Build output")

Keep in mind to enable the installer option in case you want to bundle your files which are using `import_code`. While building, installer files will get generated now. The amount of files depends on the size of your project. These installer files will essentially contain all different code files and logic to create all files in the game. So basically you just need to copy and paste the code of the installer files into the game and then compile + execute them.

You also have the option to set the characters limit for each installer file.

![Max chars](https://github.com/ayecue/greybel-vs/blob/main/assets/settings-max-chars.png?raw=true "Max chars")

More details [here](https://github.com/ayecue/greybel-js#transpiler).

### Interpreter

Executes GreyScript code. Almost all intrinsics are fully supported. To get more information on which intrinsics are supported [click here](https://github.com/ayecue/greybel-js#greyscript-api-support).

It also features a [mock environment](https://github.com/ayecue/greybel-js#local-environment) and [debugger](#debugger).

![Start debug](https://github.com/ayecue/greybel-vs/blob/main/assets/start-debug.png?raw=true "Start debug")

After you pressed run a prompt will appear to input the parameters for the execution.

![Enter params](https://github.com/ayecue/greybel-vs/blob/main/assets/params.png?raw=true "Enter params")

Supports colors in the console via a pseudo-terminal. Also inputting data is much more convenient now since there won't be any popups anymore instead you can use the pseudo-terminal.

![Pseudo Terminal](https://github.com/ayecue/greybel-vs/blob/main/assets/pseudo-terminal.png?raw=true "Pseudo Terminal")

More details [here](https://github.com/ayecue/greybel-js#interpreter).

### Debugger

Enables you to set breakpoints, run code in a breakpoint context, jump to the next line of execution etc. Generally helpful if you want to debug your code. More details [here](https://github.com/ayecue/greybel-js#debugger-cli).

![Breakpoint](https://github.com/ayecue/greybel-vs/blob/main/assets/breakpoint.png?raw=true "Breakpoint")

Keep in mind to set the breakpoint on a none empty line. Otherwise, it will just skip that breakpoint.

![Active breakpoint](https://github.com/ayecue/greybel-vs/blob/main/assets/active-breakpoint.png?raw=true "Active breakpoint")

A REPL is also available while executing the script or having an active breakpoint.

![REPL](https://github.com/ayecue/greybel-vs/blob/main/assets/repl.png?raw=true "REPL")

### API Browser

API Browser for GreyScript. Basically a version of the [GreyScript API Documentation](https://documentation.greyscript.org) page within Visual Studio Code.

![API Browser](https://github.com/ayecue/greybel-vs/blob/main/assets/api-browser.png?raw=true "API Browser")

### Share

Shares your code via [editor.greyscript.org](https://github.com/ayecue/greybel-js#save-code). The related link will be written into the clipboard.

### Refresh

Will refresh the AST Cache which is used for diagnostics, hover tooltips and autocompletion.

### Snippets

Will return a list of available GreyHack snippets. Such as `ls`, `mkdir` and more.

![Snippets](https://github.com/ayecue/greybel-vs/blob/main/assets/snippets.png?raw=true "Snippets")

### Goto Error

Jumps to the next existing syntax error.

### Supporting providers

#### Autocompletion Provider

Figures out the current context and provides suggestions accordingly.

#### Hover Tooltips Provider

Returns information about functions/types.

#### Diagnostics Provider

Returns information about syntax errors in your code.

#### Symbol Provider

Returns list of all available symbols in the active file.

![Symbol](https://github.com/ayecue/greybel-vs/blob/main/assets/symbols.png?raw=true "Symbol")

#### Definition Provider

Shows definitions in the currently active file and its dependencies.

![Definition](https://github.com/ayecue/greybel-vs/blob/main/assets/definition-provider.png?raw=true "Definition")

#### Colorpicker Provider

Shows the color picker if you got color or mark tags.

## Copyright

[Sloth icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/sloth)