// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DevWeb is Ownable, ReentrancyGuard {
    
    enum State { AWAITING_DELIVERY, AWAITING_APPROVAL, COMPLETED, REFUNDED }

    struct Project {
        address client;
        uint256 amount;      
        uint256 deadline;
        uint256 deliveryTimestamp;
        State status;
        string description;
        string serviceType;
        string resultLink;
    }

    mapping(uint256 => Project) public projects;
    uint256 public projectCount;

    event ProjectCreated(uint256 projectId, address client, uint256 amount);
    event ProjectDelivered(uint256 projectId, string resultLink);
    event FundsReleased(uint256 projectId, uint256 amount);

    constructor(address _owner) Ownable(_owner) {}

    /**
     * @notice El cliente crea el proyecto y deposita los fondos.
     */
    function createProject(
        string memory _description, 
        string memory _serviceType, 
        uint256 _daysToDeadline
    ) 
        external 
        payable 
    {
        require(msg.value > 0, "Debes depositar el presupuesto");
        require(msg.sender != owner(), "El owner no puede ser cliente");

        projectCount++;
        
        projects[projectCount] = Project({
            client: msg.sender,
            amount: msg.value,
            deadline: block.timestamp + (_daysToDeadline * 1 days),
            deliveryTimestamp: 0,
            status: State.AWAITING_DELIVERY,
            description: _description,
            serviceType: _serviceType,
            resultLink: ""
        });

        emit ProjectCreated(projectCount, msg.sender, msg.value);
    }

    /**
     * @notice Marcar como entregado (Solo el freelancer/owner).
     */
    function markAsDelivered(uint256 _projectId, string memory _resultLink) external onlyOwner {
        Project storage project = projects[_projectId];
        require(project.status == State.AWAITING_DELIVERY, "Estado invalido");
        require(bytes(_resultLink).length > 0, "Link requerido");

        project.status = State.AWAITING_APPROVAL;
        project.deliveryTimestamp = block.timestamp;
        project.resultLink = _resultLink;

        emit ProjectDelivered(_projectId, _resultLink);
    }

    /**
     * @notice El cliente aprueba el trabajo y libera los fondos al owner.
     */
    function approveAndRelease(uint256 _projectId) external nonReentrant {
        Project storage project = projects[_projectId];
        require(msg.sender == project.client, "No eres el cliente");
        require(project.status == State.AWAITING_APPROVAL, "No entregado aun");

        uint256 payment = project.amount;
        project.status = State.COMPLETED;
        project.amount = 0; // Reset por seguridad (Reentrancy)

        (bool success, ) = payable(owner()).call{value: payment}("");
        require(success, "Transferencia fallida");

        emit FundsReleased(_projectId, payment);
    }

    /**
     * @notice Reclamar fondos si el cliente no aprueba tras 7 dias de la entrega.
     */
    function claimExpiredFunds(uint256 _projectId) external onlyOwner nonReentrant {
        Project storage project = projects[_projectId];
        require(project.status == State.AWAITING_APPROVAL, "No en espera de aprobacion");
        require(block.timestamp >= project.deliveryTimestamp + 7 days, "Tiempo de gracia activo");

        uint256 payment = project.amount;
        project.status = State.COMPLETED;
        project.amount = 0;

        (bool success, ) = payable(owner()).call{value: payment}("");
        require(success, "Transferencia fallida");

        emit FundsReleased(_projectId, payment);
    }

    /**
     * @notice Reembolso para el cliente si se vence el plazo sin entrega.
     */
    function requestRefund(uint256 _projectId) external nonReentrant {
        Project storage project = projects[_projectId];
        require(msg.sender == project.client, "No eres el cliente");
        require(project.status == State.AWAITING_DELIVERY, "Ya entregado o procesado");
        require(block.timestamp > project.deadline, "Plazo no vencido");

        uint256 refundAmount = project.amount;
        project.status = State.REFUNDED;
        project.amount = 0;

        (bool success, ) = payable(project.client).call{value: refundAmount}("");
        require(success, "Reembolso fallido");
    }

    // --- FUNCIONES DE LECTURA ---

    /**
     * @notice Devuelve los IDs de proyectos visibles segun quien llame.
     * Si es el admin ve todo. Si es cliente ve los suyos.
     */
    function getVisibleProjects() external view returns (uint256[] memory) {
        if (msg.sender == owner()) {
            uint256[] memory allIds = new uint256[](projectCount);
            for (uint256 i = 0; i < projectCount; i++) {
                allIds[i] = i + 1;
            }
            return allIds;
        } 
        
        uint256 count = 0;
        for (uint256 i = 1; i <= projectCount; i++) {
            if (projects[i].client == msg.sender) count++;
        }
        
        uint256[] memory myIds = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= projectCount; i++) {
            if (projects[i].client == msg.sender) {
                myIds[index] = i;
                index++;
            }
        }
        return myIds;
    }
}