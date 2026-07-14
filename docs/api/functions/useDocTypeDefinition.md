[@lubusin/wp-frappe-data-store](../index.md) / useDocTypeDefinition

# Function: useDocTypeDefinition()

> **useDocTypeDefinition**(`store`, `doctype`): `object` & [`RequestStatus`](../type-aliases/RequestStatus.md)

Defined in: [src/hooks.ts:89](https://github.com/lubusIN/wp-frappe-data-store/blob/9ee6bbc044f2a455368bef2eef01b972f4b0f186/src/hooks.ts#L89)

React hook to retrieve normalized metadata for a Frappe DocType, loading it through the store resolver when needed.

## Parameters

### store

[`FrappeDataStore`](../type-aliases/FrappeDataStore.md)

The registered Frappe `@wordpress/data` store descriptor.

### doctype

`string`

The Frappe DocType name.

## Returns

`object` & [`RequestStatus`](../type-aliases/RequestStatus.md)

The definition and its loading/error state.
