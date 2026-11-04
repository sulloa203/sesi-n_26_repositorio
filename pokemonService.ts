// pokemonService.ts
// ---------------------------------------------------------------
// CAPA DE SERVICIO: aquí vive TODO lo relacionado con HTTP.
// El componente no sabe de URLs ni de status codes; solo pide un Pokémon.
//
// Buenas prácticas que se aplican (diapositiva 9: "fetch + try/catch"):
//   - Validar el status HTTP con res.ok (fetch NO lanza error en un 404/500).
//   - Traducir los errores técnicos a mensajes comprensibles para el usuario.
//   - Aceptar un AbortSignal para poder CANCELAR la petición (ver PokemonSearch).
// ---------------------------------------------------------------
import type { Pokemon, PokemonApiResponse } from "./types";

const API_URL = "https://pokeapi.co/api/v2/pokemon";

/**
 * Retraso artificial SOLO con fines didácticos (diapositiva 3: "retraso de red").
 * La PokéAPI responde muy rápido y el estado "Cargando" casi no se alcanza a ver.
 * Con 1500 ms el curso puede observar el semáforo completo. En producción: 0.
 */
const SIMULATED_DELAY_MS = 1500;

/** Espera `ms` milisegundos, pero se interrumpe si la petición es cancelada. */
function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const timerId = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timerId);
        reject(new DOMException("Petición cancelada", "AbortError"));
      },
      { once: true },
    );
  });
}

/** Consulta un Pokémon por número (ej. "25") o por nombre (ej. "pikachu"). */
export async function fetchPokemon(
  query: string,
  signal: AbortSignal,
): Promise<Pokemon> {
  if (SIMULATED_DELAY_MS > 0) {
    await wait(SIMULATED_DELAY_MS, signal);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/${encodeURIComponent(query)}`, { signal });
  } catch (err: unknown) {
    // Una cancelación NO es un error real: la dejamos pasar tal cual.
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    // Cualquier otro fallo aquí es de red (sin internet, DNS, servidor caído).
    throw new Error(
      "No pudimos conectar con la PokéAPI. Revisa tu conexión a internet.",
    );
  }

  // Validar el status HTTP (diapositiva 9).
  if (res.status === 404) {
    throw new Error(`No existe ningún Pokémon con el código "${query}".`);
  }
  if (!res.ok) {
    throw new Error(`Error del servidor (HTTP ${res.status}). Intenta de nuevo.`);
  }

  // OJO con el antipatrón de la diapositiva 13: sin "await" aquí tendríamos
  // una promesa pendiente en lugar de los datos reales.
  const raw = (await res.json()) as PokemonApiResponse;

  // Traducimos el formato de la API a nuestro modelo limpio.
  return {
    id: raw.id,
    name: raw.name,
    types: raw.types.map((t) => t.type.name),
    abilities: raw.abilities.map((a) => a.ability.name),
    imageUrl: raw.sprites.front_default,
  };
}
