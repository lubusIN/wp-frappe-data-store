[@lubusin/wp-frappe-data-store](../index.md) / createFrappeDataStore

# Function: createFrappeDataStore()

> **createFrappeDataStore**(`config?`): [`FrappeDataStore`](../type-aliases/FrappeDataStore.md)

Defined in: [src/store/index.ts:16](https://github.com/lubusIN/wp-frappe-data-store/blob/main/src/store/index.ts#L16)

Creates a standalone `@wordpress/data` Redux store descriptor configured for Frappe APIs.
Does not automatically register the store with the default global data registry.

## Parameters

### config?

[`FrappeStoreConfig`](../type-aliases/FrappeStoreConfig.md) = `{}`

Configuration options specifying `storeName`, `baseUrl`, `apiPath`, or custom `request` transport.

## Returns

[`FrappeDataStore`](../type-aliases/FrappeDataStore.md)

Store descriptor object ready for registration.
