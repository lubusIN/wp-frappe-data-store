[@lubusin/wp-frappe-data-store](../index.md) / loadDocTypeDefinition

# Function: loadDocTypeDefinition()

> **loadDocTypeDefinition**(`request`, `doctype`): `Promise`\<[`DocTypeDefinition`](../type-aliases/DocTypeDefinition.md)\>

Defined in: [src/doctype.ts:125](https://github.com/lubusIN/wp-frappe-data-store/blob/9ee6bbc044f2a455368bef2eef01b972f4b0f186/src/doctype.ts#L125)

Asynchronously fetches, normalizes, and caches field metadata for a given Frappe DocType.
Filters out layout breaks/buttons and maps Frappe field types to simple UI widget types (`text`, `select`, `date`, etc.).

## Parameters

### request

[`FrappeRequest`](../type-aliases/FrappeRequest.md)

The Frappe request transport function.

### doctype

`string`

The Frappe DocType name (e.g., `'Task'`).

## Returns

`Promise`\<[`DocTypeDefinition`](../type-aliases/DocTypeDefinition.md)\>

Normalized `DocTypeDefinition` containing fields and title field ID.
