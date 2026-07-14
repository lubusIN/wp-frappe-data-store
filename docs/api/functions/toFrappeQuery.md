[@lubusin/wp-frappe-data-store](../index.md) / toFrappeQuery

# Function: toFrappeQuery()

> **toFrappeQuery**(`query?`): `Record`\<`string`, `string`\>

Defined in: [src/utils.ts:76](https://github.com/lubusIN/wp-frappe-data-store/blob/9ee6bbc044f2a455368bef2eef01b972f4b0f186/src/utils.ts#L76)

Serializes a typed `FrappeListQuery` object into flat string query parameters expected by Frappe REST endpoints.
Automatically ensures `name` is present in requested `fields`.

## Parameters

### query?

[`FrappeListQuery`](../type-aliases/FrappeListQuery.md) = `{}`

Typed query parameters.

## Returns

`Record`\<`string`, `string`\>

Record of string key-value pairs suitable for URL search parameters.
