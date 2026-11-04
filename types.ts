// types.ts
// ---------------------------------------------------------------
// CONTRATO DE DATOS ESTRICTO (diapositiva 7: "Preparando los estados locales").
// Definimos dos formas de datos:
//   1) PokemonApiResponse: lo que RESPONDE la PokéAPI (solo los campos que usamos).
//   2) Pokemon: el modelo LIMPIO que consume nuestra interfaz.
// Separarlos protege a la UI de los cambios de formato de la API.
// ---------------------------------------------------------------

/** Forma (parcial) de la respuesta de https://pokeapi.co/api/v2/pokemon/{id | nombre} */
export interface PokemonApiResponse {
  id: number;
  name: string;
  types: { slot: number; type: { name: string } }[];
  abilities: { is_hidden: boolean; ability: { name: string } }[];
  sprites: { front_default: string | null };
}

/** Modelo que usa la interfaz: simple, plano y sin campos que no necesitamos. */
export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  abilities: string[];
  imageUrl: string | null;
}
