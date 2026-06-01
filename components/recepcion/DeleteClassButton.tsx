"use client";

import { deleteClassTemplateAction } from "@/app/actions/admin";

/** Botón de borrar con CONFIRMACIÓN (warning nativo) antes de enviar. */
export function DeleteClassButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteClassTemplateAction}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `¿Borrar "${name}"? Esta acción no se puede deshacer.\n\nSi la clase tiene reservas NO se borrará (mejor desactívala).`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] border border-red-500/30 text-red-300 hover:bg-red-500/10 transition-colors"
      >
        Borrar
      </button>
    </form>
  );
}
