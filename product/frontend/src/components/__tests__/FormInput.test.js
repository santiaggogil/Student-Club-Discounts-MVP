import { jsx as _jsx } from "react/jsx-runtime";
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FormInput } from '../FormInput';
import { z } from 'zod';
import { useState } from 'react';
const testSchema = z.object({
    email: z.string().email('Correo inválido'),
});
const TestFormWrapper = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const handleChange = (e) => {
        const val = e.target.value;
        setEmail(val);
        const result = testSchema.safeParse({ email: val });
        if (!result.success) {
            setError(result.error.errors[0].message);
        }
        else {
            setError('');
        }
    };
    return (_jsx("form", { children: _jsx(FormInput, { label: "Correo electr\u00F3nico", name: "email", value: email, onChange: handleChange, error: error, placeholder: "Ingresa tu correo" }) }));
};
describe('FormInput Component con Zod', () => {
    it('renderiza la etiqueta y el input correctamente', () => {
        render(_jsx(FormInput, { label: "Nombre de usuario", name: "username" }));
        expect(screen.getByText('Nombre de usuario')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /nombre de usuario/i })).toBeInTheDocument();
    });
    it('muestra el mensaje de error de Zod cuando la entrada es inválida', () => {
        render(_jsx(TestFormWrapper, {}));
        const input = screen.getByRole('textbox', { name: /correo electrónico/i });
        fireEvent.change(input, { target: { value: 'correo-incorrecto' } });
        expect(screen.getByText('Correo inválido')).toBeInTheDocument();
        expect(input).toHaveAttribute('aria-invalid', 'true');
    });
    it('limpia el error cuando la entrada es válida según Zod', () => {
        render(_jsx(TestFormWrapper, {}));
        const input = screen.getByRole('textbox', { name: /correo electrónico/i });
        fireEvent.change(input, { target: { value: 'correo-incorrecto' } });
        expect(screen.getByText('Correo inválido')).toBeInTheDocument();
        fireEvent.change(input, { target: { value: 'test@example.com' } });
        expect(screen.queryByText('Correo inválido')).not.toBeInTheDocument();
        expect(input).toHaveAttribute('aria-invalid', 'false');
    });
});
