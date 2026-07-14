[@lubusin/wp-frappe-data-store](../index.md) / FrappeResourceActions

# Type Alias: FrappeResourceActions

> **FrappeResourceActions** = `object`

Defined in: [src/types.ts:149](https://github.com/lubusIN/wp-frappe-data-store/blob/9ee6bbc044f2a455368bef2eef01b972f4b0f186/src/types.ts#L149)

Bound actions exposed by `useFrappeResourceActions` or registry dispatchers.

## Properties

### deleteResource

> **deleteResource**: (`doctype`, `name`) => `Promise`\<`void`\>

Defined in: [src/types.ts:160](https://github.com/lubusIN/wp-frappe-data-store/blob/9ee6bbc044f2a455368bef2eef01b972f4b0f186/src/types.ts#L160)

#### Parameters

##### doctype

`string`

##### name

`string`

#### Returns

`Promise`\<`void`\>

***

### fetchDocTypeDefinition

> **fetchDocTypeDefinition**: (`doctype`) => `Promise`\<[`DocTypeDefinition`](DocTypeDefinition.md)\>

Defined in: [src/types.ts:150](https://github.com/lubusIN/wp-frappe-data-store/blob/9ee6bbc044f2a455368bef2eef01b972f4b0f186/src/types.ts#L150)

#### Parameters

##### doctype

`string`

#### Returns

`Promise`\<[`DocTypeDefinition`](DocTypeDefinition.md)\>

***

### fetchResource

> **fetchResource**: (`doctype`, `name`) => `Promise`\<[`FrappeResource`](FrappeResource.md)\>

Defined in: [src/types.ts:151](https://github.com/lubusIN/wp-frappe-data-store/blob/9ee6bbc044f2a455368bef2eef01b972f4b0f186/src/types.ts#L151)

#### Parameters

##### doctype

`string`

##### name

`string`

#### Returns

`Promise`\<[`FrappeResource`](FrappeResource.md)\>

***

### fetchResourceList

> **fetchResourceList**: (`doctype`, `query?`) => `Promise`\<[`FrappeResource`](FrappeResource.md)[]\>

Defined in: [src/types.ts:152](https://github.com/lubusIN/wp-frappe-data-store/blob/9ee6bbc044f2a455368bef2eef01b972f4b0f186/src/types.ts#L152)

#### Parameters

##### doctype

`string`

##### query?

[`FrappeListQuery`](FrappeListQuery.md)

#### Returns

`Promise`\<[`FrappeResource`](FrappeResource.md)[]\>

***

### invalidateResourceLists

> **invalidateResourceLists**: (`doctype`) => `void`

Defined in: [src/types.ts:161](https://github.com/lubusIN/wp-frappe-data-store/blob/9ee6bbc044f2a455368bef2eef01b972f4b0f186/src/types.ts#L161)

#### Parameters

##### doctype

`string`

#### Returns

`void`

***

### saveResource

> **saveResource**: (`doctype`, `values`) => `Promise`\<[`FrappeResource`](FrappeResource.md)\>

Defined in: [src/types.ts:156](https://github.com/lubusIN/wp-frappe-data-store/blob/9ee6bbc044f2a455368bef2eef01b972f4b0f186/src/types.ts#L156)

#### Parameters

##### doctype

`string`

##### values

`Partial`\<[`FrappeResource`](FrappeResource.md)\> & `Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<[`FrappeResource`](FrappeResource.md)\>
