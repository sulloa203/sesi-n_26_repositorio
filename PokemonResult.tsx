// PokemonResult.tsx
// ---------------------------------------------------------------
// RENDERIZADO CONDICIONAL (diapositiva 10: "Cosechando el orden").
// Este componente es puramente de PRESENTACIÓN: recibe los tres estados
// del semáforo y decide qué dibujar mediante "guard clauses"
// (barreras protectoras con return anticipado).
//
// Orden de las barreras:  loading  →  error  →  (sin datos)  →  éxito
// ---------------------------------------------------------------
import type { Pokemon } from "./types";

interface PokemonResultProps {
  loading: boolean;
  error: string | null;
  data: Pokemon | null;
}

/** "lightning-rod" → "Lightning rod" */
function formatName(raw: string): string {
  const text = raw.replace(/-/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function PokemonResult({ loading, error, data }: PokemonResultProps) {
  // 🟡 Estado 1: CARGANDO
  if (loading) {
    return <p role="status" className="msg msg--loading">🟡 Cargando Pokémon…</p>;
  }

  // 🔴 Estado 2: ERROR
  if (error) {
    return <p role="alert" className="msg msg--error">🔴 Ups: {error}</p>;
  }

  // Barrera de seguridad para TypeScript: si no hay datos, no hay nada que dibujar.
  // Después de esta línea, TypeScript SABE que `data` es un Pokemon (no null).
  if (!data) {
    return null;
  }

  // 🟢 Estado 3: ÉXITO (si llegamos aquí, la data existe y está tipada)
  return (
    <article className="card">
      {data.imageUrl && (
        <img src={data.imageUrl} alt={`Imagen de ${formatName(data.name)}`} />
      )}
      <h2>
        #{data.id} {formatName(data.name)}
      </h2>

      <h3>Tipo</h3>
      <ul>
        {data.types.map((type) => (
          <li key={type}>{formatName(type)}</li>
        ))}
      </ul>

      <h3>Habilidades</h3>
      <ul>
        {data.abilities.map((ability) => (
          <li key={ability}>{formatName(ability)}</li>
        ))}
      </ul>
    </article>
  );
}
