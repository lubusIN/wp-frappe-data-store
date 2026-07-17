[@lubusin/wp-frappe-data-store](../index.md) / FrappeSelectors

# Type Alias: FrappeSelectors

> **FrappeSelectors** = `{ [K in keyof FrappeBoundSelectors]: (state: unknown, args: Parameters<FrappeBoundSelectors[K]>) => ReturnType<FrappeBoundSelectors[K]> }`

Defined in: [src/types.ts:132](https://github.com/lubusIN/wp-frappe-data-store/blob/main/src/types.ts#L132)
