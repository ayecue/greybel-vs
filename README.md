# greybel-vs

GreyScript toolkit for [Grey Hack](https://greyhackgame.com).

## Usage

Automatically detects `.gs` and `.src` files.

Commands available (`CTRL+SHIFT+P`):
- `Greybel: Build` - [info](#build)
- `Greybel: Goto Error` - [info](#goto-error)
- `Greybel: Minify` - [info](#minify)
- `Greybel: Refresh` - [info](#goto-error)

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

## Additional information

This extension is completly based on [greybel-js](https://github.com/ayecue/greybel-js).