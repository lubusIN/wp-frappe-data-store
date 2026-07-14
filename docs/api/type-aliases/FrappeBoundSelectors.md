[@lubusin/wp-frappe-data-store](../index.md) / FrappeBoundSelectors

# Type Alias: FrappeBoundSelectors

> **FrappeBoundSelectors** = `object`

Defined in: [src/types.ts:119](https://github.com/lubusIN/wp-frappe-data-store/blob/9ee6bbc044f2a455368bef2eef01b972f4b0f186/src/types.ts#L119)

Bound store selectors as exposed inside React component hooks or registry selections.

## Properties

### getDocTypeDefinition

> **getDocTypeDefinition**: (`doctype`) => [`DocTypeDefinition`](DocTypeDefinition.md) \| `undefined`

Defined in: [src/types.ts:125](https://github.com/lubusIN/wp-frappe-data-store/blob/9ee6bbc044f2a455368bef2eef01b972f4b0f186/src/types.ts#L125)

#### Parameters

##### doctype

`string`

#### Returns

[`DocTypeDefinition`](DocTypeDefinition.md) \| `undefined`

***

### getRequestError

> **getRequestError**: (`requestKey`) => `unknown`

Defined in: [src/types.ts:129](https://github.com/lubusIN/wp-frappe-data-store/blob/9ee6bbc044f2a455368bef2eef01b972f4b0f186/src/types.ts#L129)

#### Parameters

##### requestKey

`string`

#### Returns

`unknown`

***

### getResource

> **getResource**: (`doctype`, `name`) => [`FrappeResource`](FrappeResource.md) \| `undefined`

Defined in: [src/types.ts:120](https://github.com/lubusIN/wp-frappe-data-store/blob/9ee6bbc044f2a455368bef2eef01b972f4b0f186/src/types.ts#L120)

#### Parameters

##### doctype

`string`

##### name

`string`

#### Returns

[`FrappeResource`](FrappeResource.md) \| `undefined`

***

### getResourceList

> **getResourceList**: (`doctype`, `query?`) => [`FrappeResource`](FrappeResource.md)[] \| `undefined`

Defined in: [src/types.ts:121](https://github.com/lubusIN/wp-frappe-data-store/blob/9ee6bbc044f2a455368bef2eef01b972f4b0f186/src/types.ts#L121)

#### Parameters

##### doctype

`string`

##### query?

[`FrappeListQuery`](FrappeListQuery.md)

#### Returns

[`FrappeResource`](FrappeResource.md)[] \| `undefined`

***

### isRequestPending

> **isRequestPending**: (`requestKey`) => `boolean`

Defined in: [src/types.ts:128](https://github.com/lubusIN/wp-frappe-data-store/blob/9ee6bbc044f2a455368bef2eef01b972f4b0f186/src/types.ts#L128)

#### Parameters

##### requestKey

`string`

#### Returns

`boolean`
