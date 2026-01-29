// src/components/LoadingSpinner.jsx
export const Loading = ({ message = "Cargando..." }) => {
  return (
    <div className="text-center" role="status" aria-live="polite">
      <div
        className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-zinc-950 dark:border-white mx-auto"
        aria-hidden="true"
      />
      <h2 className="text-zinc-900 dark:text-white mt-4 text-lg font-semibold">
        {message}
      </h2>
      <p className="text-zinc-600 dark:text-zinc-400">
        Esto puede tomar algunos segundos.
      </p>
    </div>
  );
};