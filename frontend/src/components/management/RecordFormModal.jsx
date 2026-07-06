import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Alert from '../ui/Alert.jsx';
import useForm from '../../hooks/useForm.js';
import DynamicFormFields from './DynamicFormFields.jsx';

/**
 * Generic create/edit form modal, driven entirely by a resource's
 * `fields` config (see features/<resource>/*.config.js) and
 * `emptyValues`. Every management page's create/edit modal is this one
 * component — mount it with a `key` tied to the editing record's id
 * (or 'create') so switching records gets fresh form state for free.
 */
export default function RecordFormModal({
  isOpen,
  mode,
  fields,
  emptyValues,
  initialValues,
  resourceLabel,
  onClose,
  onSubmit,
}) {
  const { values, errors, isSubmitting, handleChange, setFieldValue, handleSubmit } = useForm(
    initialValues || emptyValues,
  );

  const submit = handleSubmit(async (formValues) => {
    await onSubmit(formValues);
    onClose();
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? `Edit ${resourceLabel}` : `Add ${resourceLabel}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={submit} isLoading={isSubmitting}>
            {mode === 'edit' ? 'Save changes' : 'Create'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-3">
        {errors._form && <Alert variant="error">{errors._form}</Alert>}
        <DynamicFormFields
          fields={fields}
          values={values}
          errors={errors}
          handleChange={handleChange}
          setFieldValue={setFieldValue}
        />
      </form>
    </Modal>
  );
}
