[@lubusin/wp-frappe-data-store](../index.md) / getResourceKey

# Function: getResourceKey()

> **getResourceKey**(`doctype`, `name`): `string`

Defined in: [src/utils.ts:54](https://github.com/lubusIN/wp-frappe-data-store/blob/9ee6bbc044f2a455368bef2eef01b972f4b0f186/src/utils.ts#L54)

Generates a deterministic cache key for a single resource document.

## Parameters

### doctype

`string`

The Frappe DocType name.

### name

`string`

The unique document name/identifier.

## Returns

`string`

Combined string key formatted as `doctype:name`.
