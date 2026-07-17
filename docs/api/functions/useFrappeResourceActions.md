[@lubusin/wp-frappe-data-store](../index.md) / useFrappeResourceActions

# Function: useFrappeResourceActions()

> **useFrappeResourceActions**(`store`): [`FrappeResourceActions`](../type-aliases/FrappeResourceActions.md)

Defined in: [src/hooks.ts:76](https://github.com/lubusIN/wp-frappe-data-store/blob/main/src/hooks.ts#L76)

React hook to retrieve bound action dispatchers (`saveResource`, `deleteResource`, etc.) for mutating Frappe data.

## Parameters

### store

[`FrappeDataStore`](../type-aliases/FrappeDataStore.md)

The registered Frappe `@wordpress/data` store descriptor.

## Returns

[`FrappeResourceActions`](../type-aliases/FrappeResourceActions.md)

Bound action methods for creating, updating, or deleting resources.
