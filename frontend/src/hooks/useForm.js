import { useCallback, useState } from 'react';

/**
 * Generic controlled-form state: values, per-field errors, change
 * handler, and a submit wrapper that clears errors and reports
 * thrown/returned validation errors back onto the right fields.
 * Every future create/edit form (once real entities exist) builds on
 * this instead of hand-rolling useState per field.
 *
 * Usage:
 *   const { values, errors, handleChange, handleSubmit } = useForm({ email: '' });
 *   <form onSubmit={handleSubmit(async (values) => { ...submit... })}>
 */
export default function useForm(initialValues = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }, []);

  const setFieldValue = useCallback((name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (onSubmit) => async (event) => {
    event?.preventDefault?.();
    setErrors({});
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      // Expects err.details as [{ field, message }] (matches backend ApiError shape)
      if (Array.isArray(err.details) && err.details.length > 0) {
        const fieldErrors = {};
        err.details.forEach((detail) => {
          if (detail.field) fieldErrors[detail.field] = detail.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ _form: err.message || 'Something went wrong' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return { values, errors, isSubmitting, handleChange, setFieldValue, handleSubmit, reset };
}
