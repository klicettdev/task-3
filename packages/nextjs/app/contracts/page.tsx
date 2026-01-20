"use client";

import { useState } from "react";
import { Address } from "@scaffold-ui/components";
import { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// --- COMPONENTE FILA ---
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

  if (!project) return null;

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
      <th className="font-mono">#{id.toString()}</th>
      <td>
        <div className="font-bold">{description}</div>
        <div className="text-xs opacity-50">Vence: {new Date(Number(deadline) * 1000).toLocaleDateString()}</div>
      </td>
      <td>
        <span className="badge badge-outline uppercase text-xs">{serviceType}</span>
      </td>
      <td className="font-bold">{formatEther(amount)} ETH</td>
      <td className="text-center">
        <span className={`badge ${statusLabels[Number(status)]?.color} gap-2`}>
          {statusLabels[Number(status)]?.text}
        </span>
      </td>
      <td className="text-center space-x-1">
        <button className="btn btn-sm btn-primary" onClick={() => onDetails(id)}>
          Ver Detalles
        </button>
        {status === 1 && resultLink && (
          <a href={resultLink} target="_blank" className="btn btn-sm btn-outline btn-info">
            Ver Entrega
          </a>
        )}

        {status === 0 && owner === userAddress && (
          <button className="btn btn-sm btn-success" onClick={() => onDeliver(id)}>
            Entregar
          </button>
        )}

        {status === 1 && owner !== userAddress && (
          <button
            className="btn btn-sm btn-success"
            onClick={() => writeDevWeb({ functionName: "approveAndRelease", args: [id] })}
          >
            Aprobar
          </button>
        )}
        {status === 2 && <span className="text-success text-xs font-bold uppercase">Finalizado</span>}
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
        args: [projectId, link], // <--- Ahora recibe el ID y el link correctamente
      });
      (document.getElementById("my_modal_3") as HTMLDialogElement).close();
    }
  };

  return (
    <dialog id="my_modal_3" className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 className="font-bold text-lg mb-4">Entregar Proyecto #{projectId?.toString()}</h3>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Link de entrega (GitHub, Figma...)"
            className="input input-bordered w-full"
            onChange={e => setLink(e.target.value)}
          />
          <button className="btn btn-primary w-full" onClick={handleSubmit}>
            Enviar Entrega
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

  if (!project || projectId === null) return null;

  return (
    <dialog id="details_modal" className="modal">
      <div className="modal-box w-11/12 max-w-2xl border-2 border-primary">
        <h3 className="font-bold text-2xl mb-4 border-b pb-2">Proyecto #{projectId.toString()}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-bold">Descripción Completa:</p>
            <p className="bg-base-200 p-3 rounded-lg mt-1">{project[5]}</p>
          </div>
          <div className="space-y-2">
            <p>
              <strong>Cliente:</strong>
              <Address address={project[0]} />
            </p>
            <p>
              <strong>Presupuesto:</strong> {formatEther(project[1])} ETH
            </p>
            <p>
              <strong>Deadline:</strong> {new Date(Number(project[2]) * 1000).toLocaleString()}
            </p>
            <p>
              <strong>Tipo:</strong> {project[6]}
            </p>
            {project[7] && (
              <div className="p-2 bg-info/10 rounded border border-info">
                <p className="font-bold">Link de Entrega:</p>
                <a href={project[7]} target="_blank" className="link link-primary break-all">
                  {project[7]}
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-primary">Cerrar</button>
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

  const { data: projectsIds } = useScaffoldReadContract({
    contractName: "DevWeb",
    functionName: "getVisibleProjects",
    account: userAddress,
  });

  const { data: owner } = useScaffoldReadContract({
    contractName: "DevWeb",
    functionName: "owner",
  });

  //functions
  const handleOpenModal = (id: bigint) => {
    setSelectedId(id);
    (document.getElementById("my_modal_3") as HTMLDialogElement).showModal();
  };

  const handleOpenDetailsModal = (id: bigint) => {
    setSelectedId(id);
    (document.getElementById("details_modal") as HTMLDialogElement).showModal();
  };

  if (!projectsIds || !owner || !userAddress) return <div>Cargando contratos...</div>;

  return (
    <main className="flex items-center flex-col grow pt-10 bg-base-200 min-h-screen font-sans">
      {/* Modals */}
      {selectedId !== null && (
        <>
          <ModalDelivery projectId={selectedId} />
          <DetailsModal projectId={selectedId} />
        </>
      )}

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">Gestión de Contratos Escrow</h1>
        <p className="text-base-content/60 italic">Monitorea tus servicios de SEO y Desarrollo Web</p>
      </div>

      {projectsIds !== undefined && projectsIds.length > 0 ? (
        <div className="w-full max-w-6xl px-4">
          <div className="card bg-base-100 shadow-xl overflow-hidden border border-base-300">
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead className="bg-base-300 text-center">
                  <tr>
                    <th>ID</th>
                    <th className="text-left">Descripción</th>
                    <th>Servicio</th>
                    <th>Monto</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {projectsIds.map(id => (
                    <ProjectRow
                      key={id.toString()}
                      id={id}
                      onDeliver={handleOpenModal}
                      onDetails={handleOpenDetailsModal}
                      owner={owner}
                      userAddress={userAddress}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-2xl font-bold opacity-50 mt-20">No se encontraron proyectos</p>
      )}
    </main>
  );
};

export default ContractsPage;
