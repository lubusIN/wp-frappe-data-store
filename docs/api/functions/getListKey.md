[@lubusin/wp-frappe-data-store](../index.md) / getListKey

# Function: getListKey()

> **getListKey**(`doctype`, `query?`): `string`

Defined in: [src/utils.ts:40](https://github.com/lubusIN/wp-frappe-data-store/blob/9ee6bbc044f2a455368bef2eef01b972f4b0f186/src/utils.ts#L40)

Generates a deterministic cache key for a queried resource list.

## Parameters

### doctype

`string`

The Frappe DocType name.

### query?

[`FrappeListQuery`](../type-aliases/FrappeListQuery.md) = `{}`

The list query options.

## Returns

`string`

Combined string key formatted as `doctype:stringify(query)`.
