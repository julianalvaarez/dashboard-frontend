// src/components/ErrorState.jsx
export const ErrorState = ({ message = "Ha ocurrido un error.", onRetry }) => {
  return (
    <div className="text-center mt-20 p-8">
      <svg
        className="mx-auto h-12 w-12 text-red-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <h2 className="text-red-600 dark:text-red-400 mt-4 text-lg font-semibold">
        Error al cargar los datos
      </h2>
      <p className="text-zinc-600 dark:text-zinc-400 mt-2">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  );
};
