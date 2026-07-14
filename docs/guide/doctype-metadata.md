# DocType Metadata & Forms

Frappe stores all field definitions inside the `DocType` system. `@lubusin/wp-frappe-data-store` can automatically inspect and fetch that definition (`/api/resource/DocType/{doctype}`), and normalize it into a clean UI-oriented schema suitable for generating dynamic React forms, DataViews columns, filters, and labels.

## `useDocTypeDefinition` Hook

Pass the registered store (or store descriptor) and DocType name to `useDocTypeDefinition`. The hook loads the definition when needed, caches it, and updates your component as the request resolves:

```tsx
import { useDocTypeDefinition } from '@lubusin/wp-frappe-data-store';
import { frappeStore } from './store';

export function LeadForm() {
  const { docTypeDefinition, isResolving, error } = useDocTypeDefinition(frappeStore, 'CRM Lead');

  if (isResolving && !docTypeDefinition) {
    return <p>Loading fields…</p>;
  }

  if (error) {
    return <p>Could not load DocType schema.</p>;
  }

  if (!docTypeDefinition) {
    return null;
  }

  return (
    <form className="space-y-4">
      <h3 className="text-lg font-bold">New {docTypeDefinition.name}</h3>
      {docTypeDefinition.fields.map((field) => (
        <div key={field.id} className="form-group">
          <label className="block font-medium">
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </label>
          
          {field.type === 'select' ? (
            <select
              name={field.id}
              required={field.required}
              disabled={field.readOnly}
              className="border p-2 w-full"
            >
              <option value="">Select an option...</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type === 'number' ? 'number' : 'text'}
              name={field.id}
              required={field.required}
              readOnly={field.readOnly}
              placeholder={field.placeholder || `Enter ${field.label}...`}
              className="border p-2 w-full"
            />
          )}
          {field.description && <p className="text-sm text-gray-500">{field.description}</p>}
        </div>
      ))}
    </form>
  );
}
```

## Normalized Schema Shape

When loading succeeds, `useDocTypeDefinition` exposes the normalized definition inside `docTypeDefinition`:

```ts
type DocTypeDefinition = {
  name: string;
  titleField: string;
  fields: ResourceFieldDefinition[];
};

type ResourceFieldDefinition = {
  id: string;
  label: string;
  description?: string;
  placeholder?: string;
  type?: 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'datetime' | 'number';
  options?: string[];
  required?: boolean;
  readOnly?: boolean;
};
```

## How Normalization Works

Behind the scenes, `@lubusin/wp-frappe-data-store` processes raw Frappe DocType metadata with intelligent defaults:

- **Title Field**: Uses Frappe's `title_field`, falling back to the first visible data field and then `name`.
- **Field Type Mapping**: Converts over 20 raw Frappe field types (`Data`, `Link`, `Small Text`, `Int`, `Currency`, `Date`, etc.) into a clean UI-friendly subset (`text`, `textarea`, `select`, `checkbox`, `date`, `datetime`, `number`).
- **Options Parsing**: Splits newline-delimited `Select` option strings into a clean JavaScript `string[]` array.
- **UI Clean-up**: Excludes hidden fields and non-data layout controls (`Section Break`, `Column Break`, `Button`, `HTML`, `Table`).
- **Human Labels**: Generates a title-cased label from `fieldname` if `label` is missing.

### Example Transformation

**Input (Raw Frappe Field):**
```json
{
  "fieldname": "lead_name",
  "label": "Lead name",
  "fieldtype": "Data",
  "reqd": 1,
  "description": "The person or organization entering the pipeline"
}
```

**Output (Normalized `ResourceFieldDefinition`):**
```json
{
  "id": "lead_name",
  "label": "Lead name",
  "type": "text",
  "required": true,
  "readOnly": false,
  "description": "The person or organization entering the pipeline"
}
```

## Using Metadata Outside React

If you need DocType metadata inside a Redux action or outside a React component (for example, in a background sync task or initial router load), use `resolveSelect` from `@wordpress/data`:

```ts
import { resolveSelect } from '@wordpress/data';
import { frappeStore } from './store';

const definition = await resolveSelect(frappeStore).getDocTypeDefinition('CRM Lead');
console.log('Fields:', definition?.fields);
```

Both the hook and the selector share the exact same underlying `@wordpress/data` cache. Once fetched, the definition is cached for the lifetime of the session.

For low-level transport without a registered Redux store, use `loadDocTypeDefinition(request, doctype)`.
