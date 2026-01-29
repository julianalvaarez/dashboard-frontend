// src/hooks/usePlayerSearch.js
import { useMemo, useState } from 'react';
import { useDebounce } from './useDebounce';

export const usePlayerSearch = (players) => {
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);

    // Ordenar jugadores alfabéticamente
    const sortedPlayers = useMemo(() => {
        return [...players].sort((a, b) => a.name.localeCompare(b.name));
    }, [players]);

    // Filtrar jugadores según búsqueda
    const filteredPlayers = useMemo(() => {
        if (!debouncedSearch.trim()) return sortedPlayers;

        return sortedPlayers.filter((player) =>
            player.name.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
    }, [sortedPlayers, debouncedSearch]);

    return {
        search,
        setSearch,
        filteredPlayers,
    };
};