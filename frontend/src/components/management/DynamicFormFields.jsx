import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';
import CheckboxGroup from '../ui/CheckboxGroup.jsx';

/**
 * Renders a list of form fields from a declarative config -- the piece
 * that makes RecordFormModal generic across resources. Each resource
 * supplies its own `fields` array (see features/<resource>/*.config.js);
 * this component never changes when a new resource is added.
 *
 * Supported field types: text, email, number, date, select, multiselect.
 *
 * A field with `computed: true` is skipped entirely here -- it never
 * renders as an editable input, since a computed value (e.g. CxoTeam's
 * firmExperience/overallExperience/timeInRole, derived server-side --
 * see CxoTeamService.attachExperienceFields) can't be submitted back.
 * `RecordViewModal` reads the same `fields` array but has no such
 * filter, so a `computed` field still shows up there, read-only, the
 * same as every other field.
 */
export default function DynamicFormFields({ fields, values, errors, handleChange, setFieldValue }) {
  return (
    <>
      {fields.map((field) => {
        if (field.computed) return null;

        const commonProps = {
          label: field.label,
          name: field.name,
          error: errors[field.name],
          required: field.required,
        };

        if (field.type === 'select') {
          return (
            <Select
              key={field.name}
              {...commonProps}
              value={values[field.name] ?? ''}
              onChange={handleChange}
              options={field.options || []}
              placeholder={field.placeholder}
            />
          );
        }

        if (field.type === 'multiselect') {
          return (
            <CheckboxGroup
              key={field.name}
              {...commonProps}
              value={values[field.name] || []}
              onChange={(next) => setFieldValue(field.name, next)}
              options={field.options || []}
            />
          );
        }

        // A `date`-type value coming from an existing record's
        // initialValues (see RecordFormModal/useManagementPageState's
        // formInitialValues) is whatever the API returned -- a full ISO
        // datetime string ("2024-05-01T00:00:00.000Z"), since that's how
        // Mongoose Date fields serialize to JSON. `<input type="date">`
        // only accepts the bare 'YYYY-MM-DD' form; anything else and the
        // browser silently renders it blank. Slicing to the first 10
        // characters normalizes either shape (a no-op on a value that's
        // already just 'YYYY-MM-DD') without needing every resource with
        // a date field to pre-format it itself.
        const rawValue = values[field.name];
        const inputValue =
          field.type === 'date' && typeof rawValue === 'string' ? rawValue.slice(0, 10) : rawValue ?? '';

        return (
          <Input
            key={field.name}
            {...commonProps}
            type={field.type || 'text'}
            value={inputValue}
            onChange={handleChange}
            placeholder={field.placeholder}
          />
        );
      })}
    </>
  );
}
