/* Contact form validation.
   Each rule is a small function. Errors appear beside their fields, and the
   form only reports success when every rule passes. This page has no backend,
   so nothing is transmitted. */
(function () {
  'use strict';

  const form = document.getElementById('contact-form');
  if (!form) {
    return;
  }

  const statusEl = document.getElementById('form-status');
  const fieldOrder = ['name', 'email', 'phone', 'message'];
  const fields = {
    name: document.getElementById('contact-name'),
    email: document.getElementById('contact-email'),
    phone: document.getElementById('contact-phone'),
    message: document.getElementById('contact-message'),
  };
  let hasSubmitted = false;

  /* ---------- Validation rules ---------- */

  function isFilled(value) {
    return value.trim().length > 0;
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function isDigitsOnly(value) {
    return /^\d+$/.test(value);
  }

  function hasPhoneLength(value) {
    return value.length >= 7 && value.length <= 15;
  }

  function validateForm(values) {
    const errors = {};

    if (!isFilled(values.name)) {
      errors.name = 'Please enter your name.';
    }

    if (!isFilled(values.email)) {
      errors.email = 'Please enter your email address.';
    } else if (!isValidEmail(values.email)) {
      errors.email = 'Enter a valid email address, such as name@example.com.';
    }

    const phone = values.phone.trim();
    if (!isFilled(phone)) {
      errors.phone = 'Please enter your phone number.';
    } else if (!isDigitsOnly(phone)) {
      errors.phone = 'The phone number can contain digits only.';
    } else if (!hasPhoneLength(phone)) {
      errors.phone = 'The phone number should be between 7 and 15 digits.';
    }

    if (!isFilled(values.message)) {
      errors.message = 'Please write a message.';
    }

    return errors;
  }

  /* ---------- Display ---------- */

  function readValues() {
    return {
      name: fields.name.value,
      email: fields.email.value,
      phone: fields.phone.value,
      message: fields.message.value,
    };
  }

  function showError(key, message) {
    const input = fields[key];
    const errorEl = document.getElementById(`${key}-error`);

    if (message) {
      input.setAttribute('aria-invalid', 'true');
      errorEl.textContent = message;
      errorEl.hidden = false;
    } else {
      input.removeAttribute('aria-invalid');
      errorEl.textContent = '';
      errorEl.hidden = true;
    }
  }

  function showStatus(message) {
    statusEl.textContent = message;
    statusEl.className = 'form-status is-success';
    statusEl.hidden = false;
  }

  function hideStatus() {
    statusEl.textContent = '';
    statusEl.hidden = true;
  }

  /* ---------- Events ---------- */

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    hasSubmitted = true;
    hideStatus();

    const errors = validateForm(readValues());
    fieldOrder.forEach((key) => showError(key, errors[key]));

    const firstInvalid = fieldOrder.find((key) => errors[key]);
    if (firstInvalid) {
      fields[firstInvalid].focus();
      return;
    }

    form.reset();
    hasSubmitted = false;
    fields.name.focus();
    showStatus('Thank you! Your message passed every check. This demo form does not send email yet.');
  });

  fieldOrder.forEach((key) => {
    fields[key].addEventListener('input', () => {
      if (!hasSubmitted) return; // live checks start only after the first submit attempt
      showError(key, validateForm(readValues())[key]);
    });
  });
})();
