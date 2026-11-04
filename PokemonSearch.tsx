// PokemonSearch.tsx
// ---------------------------------------------------------------
// COMPONENTE CONTENEDOR: administra el "semáforo" de estados y orquesta
// la llamada asíncrona dentro de useEffect.
//
// Diferencia con la versión anterior de la clase:
//   ANTES  → el fetch se ejecutaba directamente al presionar el botón,
//            sin controlar carga, errores ni respuestas desordenadas.
//   AHORA  → el botón solo REGISTRA la búsqueda (estado `query`) y un
//            efecto secundario reacciona a ese cambio de forma segura.
// ---------------------------------------------------------------
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { PokemonResult } from "./PokemonResult";
import { fetchPokemon } from "./pokemonService";
import type { Pokemon } from "./types";

// Pokémon que se muestra al abrir la página (#25 = Pikachu).
// Así, al recargar, el usuario ve explícitamente el estado "Cargando…".
const DEFAULT_QUERY = "25";

export function PokemonSearch() {
  // ── 1) EL SEMÁFORO (diapositivas 6 y 7): tres estados que conviven ──
  const [loading, setLoading] = useState<boolean>(true); // 🟡 esperando al servidor
  const [data, setData] = useState<Pokemon | null>(null); // 🟢 dato recibido
  const [error, setError] = useState<string | null>(null); // 🔴 algo falló

  // ── 2) Estados del formulario ──
  const [inputValue, setInputValue] = useState<string>(DEFAULT_QUERY); // lo que se escribe
  const [query, setQuery] = useState<string>(DEFAULT_QUERY); // lo que se busca

  // ── 3) EL EFECTO SECUNDARIO (diapositivas 5, 8 y 9) ──
  useEffect(() => {
    // AbortController nos permite cancelar la petición si el efecto se
    // "limpia" antes de terminar (ver función de limpieza más abajo).
    const controller = new AbortController();

    // Regla de oro: useEffect NUNCA recibe una función async directamente.
    // Declaramos la función async adentro...
    const fetchData = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const pokemon = await fetchPokemon(query, controller.signal);
        setData(pokemon); // Éxito: guardamos la data tipada
      } catch (err: unknown) {
        // Si la petición fue cancelada a propósito, no es un error de usuario.
        if (controller.signal.aborted) return;
        setData(null);
        // `unknown` en vez de `any`: obliga a verificar el tipo antes de usarlo.
        setError(
          err instanceof Error ? err.message : "Ocurrió un error inesperado.",
        );
      } finally {
        // Apagamos el spinner siempre, pase lo que pase...
        // ...salvo si esta petición ya quedó obsoleta (fue reemplazada).
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    // ...y la invocamos de inmediato.
    void fetchData();

    // FUNCIÓN DE LIMPIEZA (pregunta de metacognición, diapositiva 16):
    // se ejecuta cuando el componente se desmonta O cuando `query` cambia.
    // Cancelamos la petición pendiente para que una respuesta "vieja" nunca
    // pise a una más reciente ni intente actualizar un componente que ya no existe.
    return () => controller.abort();

    // ARREGLO DE DEPENDENCIAS: "vuelve a ejecutar este efecto SOLO cuando
    // `query` cambie". Si lo omitiéramos → loop infinito (diapositiva 13).
  }, [query]);

  // ── 4) Eventos del usuario (tipados explícitamente: nada de `any`) ──
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    // Normalizamos: sin espacios y en minúsculas (la API exige nombres en minúscula).
    setQuery(inputValue.trim().toLowerCase());
  };

  // ── 5) Render: el formulario SIEMPRE visible; el resultado depende del semáforo ──
  return (
    <section className="search">
      <form onSubmit={handleSubmit} className="search__form">
        <label htmlFor="pokemon-code">Número o nombre del Pokémon</label>
        <div className="search__row">
          <input
            id="pokemon-code"
            type="text"
            value={inputValue}
            onChange={handleChange}
            placeholder="Ej: 25 o pikachu"
          />
          <button type="submit" disabled={inputValue.trim() === ""}>
            Buscar
          </button>
        </div>
      </form>

      <PokemonResult loading={loading} error={error} data={data} />
    </section>
  );
}
