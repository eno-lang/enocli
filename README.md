# enocli

An experimental eno command line interface, for now with the initial goal of enabling generation of boilerplate deserialization code by analyzing a document and inferring a schema from its content.

The project will likely be renamed into something like `enogen`, given that the above described functionality is actually also available through
an API, not just via the command line interface.

```
Usage: node bin/enocli.js [DOCUMENT_PATH] [TARGET_1] [TARGET_2] ...

DOCUMENT_PATH: Required, e.g. path/to/document.eno
TARGET_N: E.g. javascript=output_path.js (Currently only javascript is supported, in the future python=output_path.py, etc. will be available as well)
```
