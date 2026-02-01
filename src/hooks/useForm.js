import { useState } from "react";

export const useForm = (initialForm = {}) => {

    const [formState, setFormState] = useState(initialForm);

    function onInputChange({ target }) {
        const { name, value } = target;
        setFormState({
            ...formState,
            [name]: value,
        });
    }

    function onResetForm() {
        setFormState(initialForm)
    }

    function onSelectChange(name, value) {
        setFormState({
            ...formState,
            [name]: value ?? null,
        });
    }
    function setFormValues(values) {
        setFormState(values);
    }

    return {
        ...formState,
        onInputChange,
        onSelectChange,
        onResetForm,
        setFormValues
    }
}