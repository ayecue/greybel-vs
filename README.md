# greybel-vs

GreyScript toolkit for [Grey Hack](https://greyhackgame.com). Includes highlighting and interpreter among other features. Checkout the [changelog](https://github.com/ayecue/greybel-vs/blob/main/CHANGELOG.md) to get information on the latest changes.

Based on [greybel-js](https://github.com/ayecue/greybel-js).

If you need some GreyScript API information you can also checkout [greyscript-meta](https://greyscript-meta.netlify.app/).

## Usage

Automatically detects `.gs` and `.src` files.

Commands available (`CTRL+SHIFT+P`):
- `Greybel: Build` - [info](#build)
- `Greybel: Goto Error` - [info](#goto-error)
- `Greybel: Transform` - [info](#transform)
- `Greybel: Minify` - Shortcut for [info](#transform). Will use minifiy as build type.
- `Greybel: Beautify` - Shortcut for [info](#transform). Will use beautify as build type.
- `Greybel: Refresh` - [info](#refresh)
- `Greybel: API` - [info](#api-browser)

Do not forget to setup your plugin to your needs. Following settings are available:

- Activate/Deactivate
    - Autocomplete
    - Hoverdocs
    - Installer
- Transpiler specific
    - Build type
    - Disable literals optimization
    - Disable namespaces optimization
    - Environment variables
    - Excluded namespaces when optimizing

## Features

- Syntax Highlighting
- [Goto Error](#goto-error)
- [Transform](#transform)
- [Build](#build)
- [Interpreter](#interpreter)
- [Debugger](#debugger)
- [Autocompletion](#autocompletion)
- [Hover Tooltips](#hover-tooltips)
- [Diagnostics](#diagnostics)
- [API Browser](#api-browser)

### Goto Error

Highlights the next existing syntax error.

### Refresh

Refresh AST cache.

### Transform

Transform output depends on build type. Currently available types:
- Default (active by default): Nothing special
- Uglify: Minifies code
- Beautify: Beautifies code

You can also define environment variables which you can use via `#envar environmentVariableName`.

More details [here](https://github.com/ayecue/greybel-js#features).

### Build

Build your files and put them into a `build` folder.

Building output depends on build type. Currently available types:
- Default (active by default): Nothing special
- Uglify: Minifies code
- Beautify: Beautifies code

You can also define environment variables which you can use via `#envar environmentVariableName`.

More details [here](https://github.com/ayecue/greybel-js#transpiler).

### Interpreter

Enables you to execute code, it includes all intrinsics Grey Hack would too (DISCLAIMER: Don't expect 1:1 behaviour since this is a custom implementation, more information [here](https://github.com/ayecue/greybel-js#interpreter), if you notice unexpected behaviour please report it)

### Debugger

Enables you to set breakpoints, run code in a breakpoint context, jump to the next line of execution etc. Generally helpful if you want to debug your code. More details [here](https://github.com/ayecue/greybel-js#debugger).

### Autocompletion

Figures out the current context and tries to give suggestions accordingly.

### Hover Tooltips

Gives you informations about functions/types.

### Diagnostics

Gives you information about syntax errors in your code.

### API Browser

API Browser for GreyScript. Version of [greyscript-meta](https://greyscript-meta.netlify.app/) in Visual Studio Code.

## Copyright

[Sloth icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/sloth)