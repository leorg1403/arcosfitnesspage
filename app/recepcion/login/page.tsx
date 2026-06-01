"use client";

import { useActionState } from "react";
import { adminLogin, type LoginState } from "@/app/actions/admin";

const initial: LoginState = {};
const inputClass =
  "w-full bg-transparent border-b border-paper/15 focus:border-gold py-2 text-paper text-base outline-none transition-colors placeholder:text-paper/25";

export default function RecepcionLoginPage() {
  const [state, action, pending] = useActionState(adminLogin, initial);
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form action={action} className="w-full max-w-sm border border-gold/20 bg-paper/[0.02] px-8 py-10">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-gold mb-2">
          Arcos · Recepción
        </p>
        <h1 className="font-display text-2xl font-bold tracking-tight text-paper mb-8">
          Iniciar sesión
        </h1>

        <label className="block mb-5">
          <span className="block font-mono text-[0.6rem] uppercase tracking-[0.2em] text-paper/50 mb-1">
            Correo
          </span>
          <input name="email" type="email" autoComplete="username" required className={inputClass} />
        </label>

        <label className="block mb-6">
          <span className="block font-mono text-[0.6rem] uppercase tracking-[0.2em] text-paper/50 mb-1">
            Contraseña
          </span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={inputClass}
          />
        </label>

        {state.error && (
          <p className="text-red-400 text-xs mb-4 border border-red-500/20 bg-red-500/5 px-3 py-2">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full h-12 inline-flex items-center justify-center bg-gold text-ink font-medium tracking-tight hover:bg-gold-soft transition-colors disabled:opacity-70"
        >
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
