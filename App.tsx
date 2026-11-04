// App.tsx — Reemplaza el App.tsx que genera Vite por este archivo.
import { PokemonSearch } from "./PokemonSearch";
import "./styles.css";

export default function App() {
  return (
    <main className="app">
      <h1>Pokédex · Sesión 26</h1>
      <p className="app__subtitle">
        Consumo asíncrono de una API REST con React + TypeScript
      </p>
      <PokemonSearch />
    </main>
  );
}
