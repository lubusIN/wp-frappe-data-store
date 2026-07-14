[@lubusin/wp-frappe-data-store](../index.md) / createFrappeRequest

# Function: createFrappeRequest()

> **createFrappeRequest**(`config`): [`FrappeRequest`](../type-aliases/FrappeRequest.md)

Defined in: [src/request.ts:53](https://github.com/lubusIN/wp-frappe-data-store/blob/9ee6bbc044f2a455368bef2eef01b972f4b0f186/src/request.ts#L53)

Creates a default transport function (`FrappeRequest`) using native `fetch` based on store configuration.

## Parameters

### config

[`FrappeStoreConfig`](../type-aliases/FrappeStoreConfig.md)

Store configuration providing `baseUrl`, `headers`, and `credentials`.

## Returns

[`FrappeRequest`](../type-aliases/FrappeRequest.md)

A transport function accepting request options and returning parsed JSON response bodies.
