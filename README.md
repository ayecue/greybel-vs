# greybel-vs

GreyScript toolkit for [Grey Hack](https://greyhackgame.com). Includes highlighting, interpreter and among other features.

Based on [greybel-js](https://github.com/ayecue/greybel-js).

If you need some GreyScript API information you can also checkout [greyscript-meta](https://greyscript-meta.netlify.app/).

## Usage

Automatically detects `.gs` and `.src` files.

Commands available (`CTRL+SHIFT+P`):
- `Greybel: Build` - [info](#build)
- `Greybel: Goto Error` - [info](#goto-error)
- `Greybel: Minify` - [info](#minify)
- `Greybel: Refresh` - [info](#refresh)

## Features

- Syntax Highlighting
- [Goto Error](#goto-error)
- [Minify](#minify)
- [Build](#build)
- [Interpreter](#interpreter)
- [Debugger](#debugger)
- [Autocompletion](#autocompletion)
- [Hover Tooltips](#hover-tooltips)
- [Diagnostics](#diagnostics)

### Goto Error

Highlights the next existing syntax error.

### Refresh

Refresh AST cache.

### Minify

Minifies file. More details [here](https://github.com/ayecue/greybel-js#features).

### Build

Build your files and put them into a `build` folder. It's also able to minfiy and bundle your files. More details [here](https://github.com/ayecue/greybel-js#transpiler).

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

## Copyright

[Sloth icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/sloth)