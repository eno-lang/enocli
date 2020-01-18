# enocli

An experimental eno command line interface, for now with the initial goal of enabling generation of boilerplate deserialization code by analyzing a document and inferring a schema from its content.

The project will likely be renamed into something like `enogen`, given that the above described functionality is actually also available through
an API, not just via the command line interface.

```
Usage: node bin/enocli.js [DOCUMENT_PATH] [TARGET_1] [TARGET_2] ...

DOCUMENT_PATH: Required, e.g. path/to/document.eno
TARGET_N: E.g. javascript=output_path.js (Currently only javascript is supported, in the future python=output_path.py, etc. will be available as well)
```

## Proper explanation

*Written for the current implementation state in the javascript/node environment, both more features and more languages will follow shortly, this is just a prototypical explanation.*

Suppose we have an eno document `shopping_list.eno` we want to parse for a project:

```eno
# Shopping list

Items:
- Chickpeas
- Rice
- Salad
```

We can use `enocli` to auto-generate parser code for it:

```
enocli shopping_list.eno javascript=shopping_list_parser.js
```

In our project we can now require and use the generated parser:

```javascript
const { parse } = require('./shopping_list_parser.js');

parse('shopping_list.eno');

// ... which returns:
// {
//   shoppingList: {
//     items: ['Chickpeas', 'Rice', 'Salad']
//   }
// }
```

Below you can see the parser module code that was automagically generated; It uses the fully documented `enolib` library, which means you can freely alter the parsing code, customizing for instance the internal variable names used, the locale of error messages when a document contains errors, the format (plain text, colored terminal output, html) of generated error messages and so on.

```javascript
const enolib = require('enolib');
const fs = require('fs');

exports.parse = path => {
  const input = fs.readFileSync(path, 'utf-8');
  const _document = enolib.parse(input, { source: path });

  const document = {};
  {
    document.shoppingList = {};
    const _shoppingList = _document.requiredSection('Shopping list');
    const shoppingList = document.shoppingList;
    shoppingList.items = _shoppingList.requiredList('Items').requiredStringValues();
  }

  return document;
};
```
