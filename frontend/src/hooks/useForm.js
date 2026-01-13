import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for form state management
 */
export default function useForm(initialValues = {}, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(true);

  // Reset form with new initial values
  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Validate all fields
  const validateForm = useCallback(() => {
    if (!validate) return true;
    const validationErrors = validate(values);
    setErrors(validationErrors || {});
    return Object.keys(validationErrors || {}).length === 0;
  }, [values, validate]);

  // Update validity state when values change
  useEffect(() => {
    if (validate) {
      const validationErrors = validate(values);
      setIsValid(Object.keys(validationErrors || {}).length === 0);
    }
  }, [values, validate]);

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked, files } = e.target;
    
    let newValue;
    if (type === 'checkbox') {
      newValue = checked;
    } else if (type === 'file') {
      newValue = files;
    } else {
      newValue = value;
    }

    setValues(prev => ({ ...prev, [name]: newValue }));
    
    // Clear error when field changes
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  // Handle blur event for validation
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (validate) {
      const validationErrors = validate(values);
      if (validationErrors && validationErrors[name]) {
        setErrors(prev => ({ ...prev, [name]: validationErrors[name] }));
      }
    }
  }, [values, validate]);

  // Set single field value
  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  // Set multiple field values
  const setMultipleValues = useCallback((newValues) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  // Set single field error
  const setError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  // Clear single field error
  const clearError = useCallback((name) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  // Submit handler wrapper
  const handleSubmit = useCallback((onSubmit) => async (e) => {
    e?.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate before submit
    if (!validateForm()) {
      return false;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      return true;
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    setMultipleValues,
    setError,
    clearError,
    setValues,
    setErrors,
    reset,
    validateForm
  };
}

/**
 * Hook for managing form field arrays (like phone numbers)
 */
export function useFieldArray(initialArray = []) {
  const [items, setItems] = useState(initialArray);

  const append = useCallback((item) => {
    setItems(prev => [...prev, item]);
  }, []);

  const remove = useCallback((index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const update = useCallback((index, newItem) => {
    setItems(prev => prev.map((item, i) => i === index ? newItem : item));
  }, []);

  const insert = useCallback((index, item) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems.splice(index, 0, item);
      return newItems;
    });
  }, []);

  const move = useCallback((from, to) => {
    setItems(prev => {
      const newItems = [...prev];
      const [item] = newItems.splice(from, 1);
      newItems.splice(to, 0, item);
      return newItems;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const reset = useCallback((newItems = initialArray) => {
    setItems(newItems);
  }, [initialArray]);

  return {
    items,
    append,
    remove,
    update,
    insert,
    move,
    clear,
    reset,
    setItems
  };
}
