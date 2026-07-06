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
 */
export default function DynamicFormFields({ fields, values, errors, handleChange, setFieldValue }) {
  return (
    <>
      {fields.map((field) => {
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

        return (
          <Input
            key={field.name}
            {...commonProps}
            type={field.type || 'text'}
            value={values[field.name] ?? ''}
            onChange={handleChange}
            placeholder={field.placeholder}
          />
        );
      })}
    </>
  );
}
