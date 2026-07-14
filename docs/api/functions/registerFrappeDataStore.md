[@lubusin/wp-frappe-data-store](../index.md) / registerFrappeDataStore

# Function: registerFrappeDataStore()

> **registerFrappeDataStore**(`config?`): [`FrappeDataStore`](../type-aliases/FrappeDataStore.md)

Defined in: [src/store/index.ts:41](https://github.com/lubusIN/wp-frappe-data-store/blob/9ee6bbc044f2a455368bef2eef01b972f4b0f186/src/store/index.ts#L41)

Creates and immediately registers a Frappe `@wordpress/data` store in the global WordPress data registry.

## Parameters

### config?

[`FrappeStoreConfig`](../type-aliases/FrappeStoreConfig.md) = `{}`

Configuration options specifying `storeName`, `baseUrl`, `apiPath`, or custom `request` transport.

## Returns

[`FrappeDataStore`](../type-aliases/FrappeDataStore.md)

Registered store descriptor object.
