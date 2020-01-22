# enocli

An experimental eno CLI for schema and parser generation.

#### Available functionality
- Analyze an eno document to infer and generate a schema (= outputs another eno document containing schema annotations)
- Generate a ready-to-use javascript parser either directly from a document or from a schema

#### Next steps
- Ability to generate python and ruby parsers (rather trivial as the code generation is already done modularly from an intermediate AST)
- Further develop the schema format specification
- Figuring out a strategy to bring all this functionality (CLI/API) into other languages (i.e. ability to generate python parsers from python, ruby parsers in ruby, etc.)
- Likely renaming this into something like `enogen`, given that the functionality is actually also available through
an API, not just via a command line interface.

## Documentation

*Written for the current implementation state in the javascript/node environment, see above for upcoming features.*

### Install

Some loose ends need to be tied up before this is ready for release, meanwhile you can `git clone https://github.com/eno-lang/enocli.git` the repository and run the CLI from the repository root as described below.

### CLI Usage

```
node bin/enocli.js [DOCUMENT_OR_SCHEMA] [TARGET_1] [TARGET_2] ...
```

- **DOCUMENT_OR_SCHEMA** - e.g. `conf/development_db.eno`

  Note that there is actually no distinction between a document and a schema - you can take a real document and write schema annotations for only a few elements (the rest will be inferred), or generate a schema from a raw document and then make changes to the generated schema, this is quite flexible.

- **TARGET_N** - e.g. `javascript=db_conf_parser.js` or `schema=db_conf_schema.eno`

  Given `javascript=my_parser.js` the javascript parser code for the given document/schema is generated and output into `my_parser.js`.

  Given `schema=my_schema.eno` an eno document is generated that reflects the input document/schema but adds in missing schema annotations that are automatically inferred from the document (variable names, types, required/optional), thereby turning a document or incomplete schema into a fully specified, unambiguous schema.

### Detailed Example

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

We can also use `enocli` to infer and export a full schema for our document:

```
enocli shopping_list.eno schema=shopping_list_schema.eno
```

The exported schema contains schema annotations that we can modify if we need to, and the modified schema can then be used again as input for `enocli` to generate an updated javascript parser.

### Customizing the generated parsers

The generated parser code is built on the fully documented [enolib](https://eno-lang.org/enolib/) library, which means you can freely alter the parsing logic, customizing for instance the iteration strategies, the internal variable names used, the locale of error messages when a document contains errors, the format (plain text, colored terminal output, html) of generated error messages and so on. The bottom line here is that enocli does not generate obscure hieroglyphic machine code, but properly named and formatted code that is utilizing a highly performant and high-level library with an API that was designed for humans to use all the way through.
