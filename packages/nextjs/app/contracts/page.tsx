"use client";

import { useState } from "react";
import { Address } from "@scaffold-ui/components";
import { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// --- COMPONENTE SKELETON (LOADING) ---
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <th className="bg-base-300 h-8 w-12 rounded m-2"></th>
    <td>
      <div className="bg-base-300 h-4 w-48 rounded mb-2"></div>
      <div className="bg-base-300 h-3 w-24 rounded"></div>
    </td>
    <td>
      <div className="bg-base-300 h-6 w-16 rounded-full mx-auto"></div>
    </td>
    <td>
      <div className="bg-base-300 h-4 w-20 rounded mx-auto"></div>
    </td>
    <td>
      <div className="bg-base-300 h-6 w-24 rounded-full mx-auto"></div>
    </td>
    <td>
      <div className="bg-base-300 h-8 w-32 rounded mx-auto"></div>
    </td>
  </tr>
);

// --- COMPONENTE FILA REAL ---
type ProjectRowProps = {
  id: bigint;
  onDeliver: (id: bigint) => void;
  onDetails: (id: bigint) => void;
  owner: string;
  userAddress: string;
};

const ProjectRow: React.FC<ProjectRowProps> = ({ id, onDeliver, onDetails, owner, userAddress }) => {
  const { writeContractAsync: writeDevWeb } = useScaffoldWriteContract({ contractName: "DevWeb" });

  const { data: project } = useScaffoldReadContract({
    contractName: "DevWeb",
    functionName: "projects",
    args: [id],
  });

  if (!project) return <SkeletonRow />;

  const amount = project[1];
  const deadline = project[2];
  const status = project[4];
  const description = project[5];
  const serviceType = project[6];
  const resultLink = project[7];

  const statusLabels = [
    { text: "Pendiente", color: "badge-warning" },
    { text: "En Revisión", color: "badge-info text-white" },
    { text: "Completado", color: "badge-success text-white" },
    { text: "Reembolsado", color: "badge-error text-white" },
  ];

  return (
    <tr className="hover:bg-base-200">
      <th className="font-mono text-center">#{id.toString()}</th>
      <td>
        <div className="font-bold">{description.length > 40 ? description.slice(0, 40) + "..." : description}</div>
        <div className="text-xs opacity-80">Vence: {new Date(Number(deadline) * 1000).toLocaleDateString()}</div>
      </td>
      <td className="text-center">
        <span className="badge badge-outline uppercase text-xs font-semibold">{serviceType}</span>
      </td>
      <td className="font-bold text-center">{formatEther(amount)} ETH</td>
      <td className="text-center">
        <span className={`badge ${statusLabels[Number(status)]?.color} gap-2 font-medium`}>
          {statusLabels[Number(status)]?.text}
        </span>
      </td>
      <td className="text-center">
        <div className="flex justify-center gap-2">
          <button className="btn btn-xs btn-outline" onClick={() => onDetails(id)}>
            Detalles
          </button>

          {status === 0 && owner === userAddress && (
            <button className="btn btn-xs btn-primary" onClick={() => onDeliver(id)}>
              Entregar
            </button>
          )}

          {status === 1 && owner !== userAddress && (
            <button
              className="btn btn-xs btn-success text-white"
              onClick={() => writeDevWeb({ functionName: "approveAndRelease", args: [id] })}
            >
              Aprobar
            </button>
          )}

          {status === 1 && resultLink && (
            <a href={resultLink} target="_blank" rel="noreferrer" className="btn btn-xs btn-info text-white">
              Link
            </a>
          )}

          {status === 2 && <span className="text-success text-xs font-bold uppercase my-auto">✓ Finalizado</span>}
        </div>
      </td>
    </tr>
  );
};

// --- COMPONENTE MODAL ENTREGA ---
const ModalDelivery = ({ projectId }: { projectId: bigint | null }) => {
  const [link, setLink] = useState<string>("");
  const { writeContractAsync: writeDevWeb } = useScaffoldWriteContract({ contractName: "DevWeb" });

  const handleSubmit = async () => {
    if (link && projectId !== null) {
      await writeDevWeb({
        functionName: "markAsDelivered",
        args: [projectId, link],
      });
      (document.getElementById("my_modal_3") as HTMLDialogElement).close();
    }
  };

  return (
    <dialog id="my_modal_3" className="modal">
      <div className="modal-box border-2 border-primary">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 className="font-bold text-lg mb-4 text-primary">Entregar Proyecto #{projectId?.toString()}</h3>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="URL de entrega (GitHub, Figma, Vercel...)"
            className="input input-bordered w-full"
            onChange={e => setLink(e.target.value)}
          />
          <button className="btn btn-primary w-full shadow-lg" onClick={handleSubmit}>
            Enviar a Revisión
          </button>
        </div>
      </div>
    </dialog>
  );
};

// --- COMPONENTE MODAL DETALLES ---
const DetailsModal = ({ projectId }: { projectId: bigint }) => {
  const { data: project } = useScaffoldReadContract({
    contractName: "DevWeb",
    functionName: "projects",
    args: [projectId],
  });

  if (!project) return null;

  return (
    <dialog id="details_modal" className="modal">
      <div className="modal-box w-11/12 max-w-2xl border-2 border-primary shadow-2xl">
        <h3 className="font-bold text-2xl mb-4 border-b pb-2">Detalles del Proyecto #{projectId.toString()}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="col-span-1 md:col-span-2">
            <p className="font-bold opacity-70 uppercase text-xs mb-1">Descripción del trabajo:</p>
            <p className="bg-base-200 p-4 rounded-xl italic">{project[5]}</p>
          </div>
          <div className="space-y-3">
            <div className="flex flex-col">
              <span className="text-xs uppercase font-bold">Cliente</span>
              <Address address={project[0]} />
            </div>
            <div>
              <span className="text-xs uppercase font-bold">Monto del Contrato</span>
              <p className="text-lg font-bold">{formatEther(project[1])} ETH</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-xs uppercase font-bold">Fecha Límite</span>
              <p className="font-medium">{new Date(Number(project[2]) * 1000).toLocaleString()}</p>
            </div>
            <div>
              <span className="text-xs opacity-50 uppercase font-bold">Categoría</span>
              <p className="badge badge-primary badge-outline">{project[6]}</p>
            </div>
          </div>
        </div>
        {project[7] && (
          <div className="mt-6 p-4 bg-info/10 rounded-xl border border-info/30">
            <p className="font-bold text-info text-xs uppercase mb-1">Link de Entrega Final:</p>
            <a href={project[7]} target="_blank" rel="noreferrer" className="link link-secondary break-all font-mono">
              {project[7]}
            </a>
          </div>
        )}
        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-primary btn-outline px-8">Cerrar</button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

// --- PÁGINA PRINCIPAL ---
const ContractsPage: NextPage = () => {
  const { address: userAddress } = useAccount();
  const [selectedId, setSelectedId] = useState<bigint | null>(null);

  const { data: projectsIds, isLoading: loadingIds } = useScaffoldReadContract({
    contractName: "DevWeb",
    functionName: "getVisibleProjects",
    account: userAddress,
  });

  const { data: owner, isLoading: loadingOwner } = useScaffoldReadContract({
    contractName: "DevWeb",
    functionName: "owner",
  });

  const handleOpenModal = (id: bigint) => {
    setSelectedId(id);
    setTimeout(() => (document.getElementById("my_modal_3") as HTMLDialogElement).showModal(), 50);
  };

  const handleOpenDetailsModal = (id: bigint) => {
    setSelectedId(id);
    setTimeout(() => (document.getElementById("details_modal") as HTMLDialogElement).showModal(), 50);
  };

  const isInitialLoading = loadingIds || loadingOwner || !userAddress;

  return (
    <main className="flex items-center flex-col grow pt-10 bg-base-200 min-h-screen font-sans pb-20">
      {/* Modals */}
      {selectedId !== null && (
        <>
          <ModalDelivery projectId={selectedId} />
          <DetailsModal projectId={selectedId} />
        </>
      )}

      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold mb-2 bg-gradient-to-r">Escrow Dashboard</h1>
        <p className="text-base-content/60 italic text-lg">Seguridad inmutable para tus desarrollos y SEO</p>
      </div>

      <div className="w-full max-w-6xl px-4">
        <div className="card bg-base-100 shadow-2xl overflow-hidden border border-base-300">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-base-300 text-center text-sm">
                <tr>
                  <th>ID</th>
                  <th className="text-left">Descripción del Proyecto</th>
                  <th>Servicio</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {isInitialLoading ? (
                  // Lista falsa de Skeleton mientras carga
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : projectsIds && projectsIds.length > 0 ? (
                  projectsIds.map(id => (
                    <ProjectRow
                      key={id.toString()}
                      id={id}
                      onDeliver={handleOpenModal}
                      onDetails={handleOpenDetailsModal}
                      owner={owner as string}
                      userAddress={userAddress}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-20">
                      <div className="flex flex-col items-center opacity-30">
                        <span className="text-6xl mb-4">📂</span>
                        <p className="text-2xl font-bold">No se encontraron proyectos activos</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ContractsPage;
