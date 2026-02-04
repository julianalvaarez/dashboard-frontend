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
        // Ensure video is always an array of at least one empty string if not present or null
        const processedValues = {
            ...values,
            video: Array.isArray(values.video)
                ? (values.video.length > 0 ? values.video : [''])
                : (values.video ? [values.video] : [''])
        };
        setFormState(processedValues);
    }

    const addVideoInput = () => {
        setFormState(prev => ({
            ...prev,
            video: [...prev.video, ''],
        }));
    };

    const removeVideoInput = (index) => {
        setFormState(prev => ({
            ...prev,
            video: prev.video.length > 1
                ? prev.video.filter((_, i) => i !== index)
                : prev.video,
        }));
    };

    const onVideoChange = (index, value) => {
        setFormState(prev => {
            const updated = [...prev.video];
            updated[index] = value;
            return {
                ...prev,
                video: updated,
            };
        });
    };


    return {
        ...formState,
        onInputChange,
        onSelectChange,
        onResetForm,
        addVideoInput,
        removeVideoInput,
        onVideoChange,
        setFormValues
    }
}