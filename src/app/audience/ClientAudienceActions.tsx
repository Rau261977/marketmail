"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { AddContactModal } from "./AddContactModal";
import { useRouter } from "next/navigation";

export function ClientAudienceActions({ templateId }: { templateId: string | null }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-600/20 active:scale-95"
      >
        <UserPlus size={18} />
        Agregar Contacto
      </button>

      <AddContactModal 
        isOpen={isModalOpen} 
        onClose={() => {
            setIsModalOpen(false);
            router.refresh();
        }} 
      />
    </>
  );
}
