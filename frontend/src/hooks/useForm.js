/**
 * useForm Hook - Form state management for authentication forms
 */
import { useState, useCallback } from 'react';

/**
 * Form validation rules
 */
const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '请输入有效的邮箱地址'
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: '密码必须包含大小写字母和数字，至少8位'
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: '姓名长度为2-50个字符'
  },
  confirmPassword: {
    required: true,
    message: '密码不一致'
  }
};

/**
 * Validate field value
 */
const validateField = (field, value, formData = {}) => {
  const rules = validationRules[field];
  if (!rules) return null;

  // Required validation
  if (rules.required && (!value || value.trim() === '')) {
    return `${getFieldLabel(field)}为必填项`;
  }

  // Skip other validations if empty (for optional fields)
  if (!value || value.trim() === '') {
    return null;
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    return rules.message;
  }

  // Length validation
  if (rules.minLength && value.length < rules.minLength) {
    return `${getFieldLabel(field)}长度不能少于${rules.minLength}个字符`;
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return `${getFieldLabel(field)}长度不能超过${rules.maxLength}个字符`;
  }

  // Confirm password validation
  if (field === 'confirmPassword' && value !== formData.password) {
    return '密码不一致';
  }

  return null;
};

/**
 * Get field label for error messages
 */
const getFieldLabel = (field) => {
  const labels = {
    email: '邮箱',
    password: '密码',
    name: '姓名',
    confirmPassword: '确认密码',
    currentPassword: '当前密码',
    newPassword: '新密码'
  };
  return labels[field] || field;
};

/**
 * useForm Hook
 */
export const useForm = (initialValues = {}, validationFields = []) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update field value
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  }, [errors]);

  // Mark field as touched
  const touchField = useCallback((field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  }, []);

  // Validate single field
  const validateSingleField = useCallback((field) => {
    const error = validateField(field, formData[field], formData);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
    return !error;
  }, [formData]);

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    validationFields.forEach(field => {
      const error = validateField(field, formData[field], formData);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validationFields]);

  // Handle field blur
  const handleBlur = useCallback((field) => {
    touchField(field);
    if (validationFields.includes(field)) {
      validateSingleField(field);
    }
  }, [touchField, validateSingleField, validationFields]);

  // Handle form submission
  const handleSubmit = useCallback(async (onSubmit) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    // Mark all fields as touched
    const newTouched = {};
    validationFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    // Validate form
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, isSubmitting, validationFields]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Check if form is valid
  const isValid = validationFields.every(field => !errors[field] && formData[field]);

  return {
    formData,
    errors,
    touched,
    isSubmitting,
    isValid,
    updateField,
    touchField,
    handleBlur,
    handleSubmit,
    validateForm,
    validateSingleField,
    resetForm
  };
};

/**
 * useLoginForm Hook - Specific hook for login form
 */
export const useLoginForm = () => {
  return useForm(
    {
      email: '',
      password: '',
      rememberMe: false
    },
    ['email', 'password']
  );
};

/**
 * useRegisterForm Hook - Specific hook for register form
 */
export const useRegisterForm = () => {
  return useForm(
    {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    ['name', 'email', 'password', 'confirmPassword']
  );
};

/**
 * useForgotPasswordForm Hook - Specific hook for forgot password form
 */
export const useForgotPasswordForm = () => {
  return useForm(
    {
      email: ''
    },
    ['email']
  );
};

/**
 * useResetPasswordForm Hook - Specific hook for reset password form
 */
export const useResetPasswordForm = () => {
  return useForm(
    {
      password: '',
      confirmPassword: ''
    },
    ['password', 'confirmPassword']
  );
};

/**
 * useChangePasswordForm Hook - Specific hook for change password form
 */
export const useChangePasswordForm = () => {
  return useForm(
    {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    ['currentPassword', 'newPassword', 'confirmPassword']
  );
};

export default useForm;