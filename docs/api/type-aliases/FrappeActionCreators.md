[@lubusin/wp-frappe-data-store](../index.md) / FrappeActionCreators

# Type Alias: FrappeActionCreators

> **FrappeActionCreators** = `object`

Defined in: [src/types.ts:93](https://github.com/lubusIN/wp-frappe-data-store/blob/main/src/types.ts#L93)

## Properties

### deleteResource

> **deleteResource**: (`doctype`, `name`) => (`context`) => `Promise`\<`void`\>

Defined in: [src/types.ts:109](https://github.com/lubusIN/wp-frappe-data-store/blob/main/src/types.ts#L109)

#### Parameters

##### doctype

`string`

##### name

`string`

#### Returns

(`context`) => `Promise`\<`void`\>

***

### fetchDocTypeDefinition

> **fetchDocTypeDefinition**: (`doctype`) => (`context`) => `Promise`\<[`DocTypeDefinition`](DocTypeDefinition.md)\>

Defined in: [src/types.ts:94](https://github.com/lubusIN/wp-frappe-data-store/blob/main/src/types.ts#L94)

#### Parameters

##### doctype

`string`

#### Returns

(`context`) => `Promise`\<[`DocTypeDefinition`](DocTypeDefinition.md)\>

***

### fetchResource

> **fetchResource**: (`doctype`, `name`) => (`context`) => `Promise`\<[`FrappeResource`](FrappeResource.md)\>

Defined in: [src/types.ts:97](https://github.com/lubusIN/wp-frappe-data-store/blob/main/src/types.ts#L97)

#### Parameters

##### doctype

`string`

##### name

`string`

#### Returns

(`context`) => `Promise`\<[`FrappeResource`](FrappeResource.md)\>

***

### fetchResourceList

> **fetchResourceList**: (`doctype`, `query?`) => (`context`) => `Promise`\<[`FrappeResource`](FrappeResource.md)[]\>

Defined in: [src/types.ts:101](https://github.com/lubusIN/wp-frappe-data-store/blob/main/src/types.ts#L101)

#### Parameters

##### doctype

`string`

##### query?

[`FrappeListQuery`](FrappeListQuery.md)

#### Returns

(`context`) => `Promise`\<[`FrappeResource`](FrappeResource.md)[]\>

***

### invalidateResourceLists

> **invalidateResourceLists**: (`doctype`) => `object`

Defined in: [src/types.ts:113](https://github.com/lubusIN/wp-frappe-data-store/blob/main/src/types.ts#L113)

#### Parameters

##### doctype

`string`

#### Returns

`object`

##### doctype

> **doctype**: `string`

##### type

> **type**: `string`

***

### saveResource

> **saveResource**: (`doctype`, `values`) => (`context`) => `Promise`\<[`FrappeResource`](FrappeResource.md)\>

Defined in: [src/types.ts:105](https://github.com/lubusIN/wp-frappe-data-store/blob/main/src/types.ts#L105)

#### Parameters

##### doctype

`string`

##### values

`Partial`\<[`FrappeResource`](FrappeResource.md)\> & `Record`\<`string`, `unknown`\>

#### Returns

(`context`) => `Promise`\<[`FrappeResource`](FrappeResource.md)\>
