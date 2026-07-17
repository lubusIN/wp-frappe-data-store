[@lubusin/wp-frappe-data-store](../index.md) / useFrappeResourceList

# Function: useFrappeResourceList()

> **useFrappeResourceList**(`store`, `doctype`, `query?`): `object` & [`RequestStatus`](../type-aliases/RequestStatus.md)

Defined in: [src/hooks.ts:50](https://github.com/lubusIN/wp-frappe-data-store/blob/main/src/hooks.ts#L50)

React hook to subscribe to a queried list of Frappe documents.
Automatically triggers background fetching via store resolvers if not already cached.

## Parameters

### store

[`FrappeDataStore`](../type-aliases/FrappeDataStore.md)

The registered Frappe `@wordpress/data` store descriptor.

### doctype

`string`

The Frappe DocType name (e.g., `'Task'`).

### query?

[`FrappeListQuery`](../type-aliases/FrappeListQuery.md) = `{}`

Optional query parameters (filters, order by, limit, fields).

## Returns

`object` & [`RequestStatus`](../type-aliases/RequestStatus.md)

Object containing matching `resources` array, `isResolving` loading state, and any request `error`.
