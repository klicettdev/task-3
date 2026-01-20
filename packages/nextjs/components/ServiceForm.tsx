"use client";

import React, { useState } from "react";
import { useFetchNativeCurrencyPrice } from "@scaffold-ui/hooks";
import toast from "react-hot-toast";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const ServiceForm: React.FC = () => {
  const { address } = useAccount();
  const { price: nativeCurrencyPrice } = useFetchNativeCurrencyPrice();

  //states
  const [formData, setFormData] = useState({
    description: "",
    service: "",
    amount: "",
    deadline: "",
  });

  //smart contract
  const { writeContractAsync: writeDevWebAsync } = useScaffoldWriteContract({ contractName: "DevWeb" });

  //functions
  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const ethAmount = (Number(formData.amount) / nativeCurrencyPrice).toString();

      await writeDevWebAsync({
        functionName: "createProject",
        args: [formData.description, formData.service, BigInt(formData.deadline)],
        value: parseEther(ethAmount),
      });

      toast.dismiss();
      toast.success("¡Contrato creado en la Blockchain!");
      handleReset();
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
    }
  };

  const handleReset = () => {
    setFormData({
      description: "",
      service: "",
      amount: "",
      deadline: "",
    });
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8 flex items-center justify-center">
      <div className="mx-auto max-w-4xl w-full">
        <div className="card bg-base-100 shadow-2xl border border-base-300">
          <div className="card-body p-10">
            <h2 className="card-title text-3xl font-bold w-full justify-center mb-2">Solicitar Servicio Web3</h2>
            <p className="text-base-content/70 mb-6 text-center">
              Define los términos de tu contrato de Diseño o SEO en la Blockchain.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-control w-full flex flex-col gap-0.5">
                <label className="label">
                  <span className="label-text font-semibold">Descripción del Proyecto</span>
                </label>
                <textarea
                  placeholder="Escribe aquí los detalles técnicos y requerimientos..."
                  value={formData.description}
                  onChange={e => handleChange("description", e.target.value)}
                  className="textarea textarea-bordered h-12 w-full resize-none focus:textarea-primary text-base rounded-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">Tipo de Servicio</span>
                  </label>
                  <select
                    className="select select-bordered focus:select-primary w-full cursor-pointer"
                    value={formData.service}
                    onChange={e => handleChange("service", e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Selecciona un servicio
                    </option>
                    <option value="landing">Landing Page</option>
                    <option value="service">Página de Servicio</option>
                    <option value="ecommerce">Página de E-commerce</option>
                    <option value="maintenance">Página de Mantenimiento</option>
                    <option value="academy">Página de Academia Virtual</option>
                    <option value="store">Página de Tienda Virtual</option>
                  </select>
                </div>

                {/* Monto */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">Presupuesto (USDC/ETH)</span>
                  </label>
                  <select
                    className="select select-bordered focus:select-primary w-full cursor-pointer  "
                    value={formData.amount}
                    onChange={e => handleChange("amount", e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Selecciona un rango
                    </option>
                    <option value="500">$500</option>
                    <option value="1000">$1,000</option>
                    <option value="5000">$5,000</option>
                  </select>
                </div>

                {/* Deadline */}
                <div className="form-control w-full md:col-span-2">
                  <label className="label">
                    <span className="label-text font-semibold">Plazo de Entrega</span>
                  </label>
                  <select
                    value={formData.deadline}
                    onChange={e => handleChange("deadline", e.target.value)}
                    className="select select-bordered focus:select-primary w-full cursor-pointer"
                    required
                  >
                    <option value="" disabled>
                      Selecciona el plazo
                    </option>
                    <option value="15">15 días (Entrega rápida)</option>
                    <option value="30">30 días (Estándar)</option>
                    <option value="45">45 días (Proyecto complejo)</option>
                  </select>
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <button type="button" className="btn btn-outline btn-lg btn-error flex-1" onClick={handleReset}>
                  Limpiar Todo
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg flex-1 shadow-lg"
                  disabled={
                    !address ||
                    !formData.amount ||
                    !formData.deadline ||
                    !formData.description ||
                    !nativeCurrencyPrice ||
                    !formData.service
                  }
                >
                  Crear Contrato Escrow
                </button>
              </div>
            </form>
            <div className="divider mt-10 text-base-content/40 text-xs uppercase tracking-widest">
              Seguridad Blockchain
            </div>
            <div className="text-center opacity-70">
              <p className="text-sm">Los fondos serán custodiados por el Smart Contract hasta la aprobación.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
