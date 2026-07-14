[@lubusin/wp-frappe-data-store](../index.md) / useFrappeResource

# Function: useFrappeResource()

> **useFrappeResource**(`store`, `doctype`, `name`): `object` & [`RequestStatus`](../type-aliases/RequestStatus.md)

Defined in: [src/hooks.ts:22](https://github.com/lubusIN/wp-frappe-data-store/blob/9ee6bbc044f2a455368bef2eef01b972f4b0f186/src/hooks.ts#L22)

React hook to subscribe to a single Frappe document by DocType and name.
Automatically triggers background fetching via store resolvers if not already cached.

## Parameters

### store

[`FrappeDataStore`](../type-aliases/FrappeDataStore.md)

The registered Frappe `@wordpress/data` store descriptor.

### doctype

`string`

The Frappe DocType name (e.g., `'Task'`).

### name

`string`

The unique document identifier.

## Returns

`object` & [`RequestStatus`](../type-aliases/RequestStatus.md)

Object containing the document `resource`, `isResolving` loading state, and any request `error`.
