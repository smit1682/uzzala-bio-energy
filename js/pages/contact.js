/* ==========================================================================
   CONTACT.JS — Contact page logic with form validation
   ========================================================================== */

import '../../css/pages/contact.css';
import JustValidate from 'just-validate';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#contact-form');
    if (!form) return;

    const validator = new JustValidate('#contact-form', {
        errorLabelStyle: {
            color: '#ff4444',
            fontSize: '0.75rem',
            marginTop: '4px',
        },
    });

    validator
        .addField('#contact-name', [
            { rule: 'required', errorMessage: 'Name is required' },
            { rule: 'minLength', value: 2, errorMessage: 'Name must be at least 2 characters' },
        ])
        .addField('#contact-email', [
            { rule: 'required', errorMessage: 'Email is required' },
            { rule: 'email', errorMessage: 'Please enter a valid email' },
        ])
        .addField('#contact-phone', [
            { rule: 'required', errorMessage: 'Phone number is required' },
        ])
        .addField('#contact-message', [
            { rule: 'required', errorMessage: 'Message is required' },
            { rule: 'minLength', value: 10, errorMessage: 'Message must be at least 10 characters' },
        ])
        .onSuccess((e) => {
            e.preventDefault();
            // Show success state
            const btn = form.querySelector('.btn');
            if (btn) {
                btn.textContent = 'Message Sent ✓';
                btn.style.pointerEvents = 'none';
                btn.style.opacity = '0.7';
            }
        });
});
