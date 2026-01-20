# 🌐 Web3 Service Marketplace (Escrow System)

## Esta plataforma es una solución descentralizada para la gestión de servicios de SEO y Desarrollo Web. Utiliza contratos inteligentes (Escrow) para garantizar que los pagos se liberen únicamente cuando el trabajo ha sido entregado y aprobado, eliminando la necesidad de intermediarios y aumentando la confianza entre freelancer y cliente

## 🚀 Características Principales

- Pagos en Custodia (Escrow): Los fondos del cliente se mantienen seguros en el contrato inteligente desde el inicio del proyecto.

- Panel Unificado: Una única interfaz que adapta sus funciones según quién esté conectado (Admin/Freelancer o Cliente).

- Sistema de Entregas Transparente: El freelancer registra el link de entrega directamente en la blockchain, dejando una prueba inmutable del trabajo realizado.

- Protección de Tiempos (Deadline): El contrato gestiona automáticamente los plazos de entrega, permitiendo reembolsos si no se cumple el tiempo pactado.

- Retiro por Inactividad: Incluye una función de seguridad para que el freelancer pueda reclamar los fondos tras 7 días de entrega si el cliente olvida aprobar manualmente.

## 🛠️ Flujo del Usuario

- Cliente: Crea un proyecto detallando el servicio (SEO/Web) y deposita los fondos en ETH.

- Freelancer (Admin): Visualiza todas las tareas pendientes y envía el link de los entregables a través del portal.

- Cliente: Revisa el trabajo mediante el enlace proporcionado y libera los fondos con un solo clic.

- Sistema: El contrato transfiere automáticamente el pago al freelancer una vez aprobado.

## 🛡️ Seguridad y Tecnología

- Smart Contract: Desarrollado en Solidity utilizando los estándares Ownable y ReentrancyGuard de OpenZeppelin para prevenir ataques.

- Frontend: Construido sobre Scaffold-ETH 2, utilizando NextJS 13, Wagmi y DaisyUI para una experiencia de usuario fluida y reactiva.

- Transparencia: Cada cambio de estado (Creación, Entrega, Aprobación) genera un evento en la red para facilitar la trazabilidad.

## � Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 20.18.3
- **Yarn** >= 3.2.3
- **Metamask** u otra wallet compatible con Web3
- **ETH de prueba** en Sepolia (puedes obtenerlos desde un [faucet](https://sepoliafaucet.com/))

## 🚀 Instalación y Configuración

1. **Clona el repositorio**:

   ```bash
   git clone <repository-url>
   cd desarrollo-web
   ```

2. **Instala las dependencias**:

   ```bash
   yarn install
   ```

3. **Inicia la red local de Hardhat**:

   ```bash
   yarn chain
   ```

4. **Despliega los contratos** (en otra terminal):

   ```bash
   yarn deploy
   ```

5. **Inicia la aplicación**:

   ```bash
   yarn start
   ```

La aplicación estará disponible en `http://localhost:3000`

## 📝 Scripts Disponibles

- `yarn start` - Inicia el servidor de desarrollo de Next.js
- `yarn chain` - Inicia una red local de Hardhat
- `yarn deploy` - Despliega los contratos en la red activa
- `yarn deploy --network sepolia` - Despliega en Sepolia testnet
- `yarn compile` - Compila los contratos inteligentes
- `yarn test` - Ejecuta las pruebas de los contratos
- `yarn verify` - Verifica los contratos en Etherscan

## 🌐 Contrato Desplegado

### Red Local (Hardhat)

- **Contrato**: `DevWeb`
- **Address**: `0x8EEc9d3d8E26d28879247941763CE67515a7dcd8`
- **Block Explorer**: [Sepolia](https://sepolia.etherscan.io/address/0x8EEc9d3d8E26d28879247941763CE67515a7dcd8)

### Sepolia Testnet

> ⚠️ **Nota**: Actualiza esta dirección después de desplegar en Sepolia con:
>
> ```bash
> yarn deploy --network sepolia
> ```

Para verificar el contrato en Etherscan Sepolia:

```bash
yarn verify --network sepolia
```

## 💻 Stack Tecnológico

### Smart Contracts

- **Solidity** ^0.8.0 - Lenguaje de programación de contratos
- **Hardhat** - Framework de desarrollo y testing
- **OpenZeppelin** - Librerías de contratos seguros (Ownable, ReentrancyGuard)

### Frontend

- **Next.js** 13 - Framework de React con App Router
- **TypeScript** - Tipado estático
- **Wagmi** - Hooks de React para Ethereum
- **RainbowKit** - Componentes de conexión de wallets
- **DaisyUI** - Framework de componentes UI

### Infraestructura

- **Scaffold-ETH 2** - Template base del proyecto
- **Alchemy** - Proveedor de nodos RPC
- **IPFS** - (Opcional) Almacenamiento descentralizado

## 📁 Estructura del Proyecto

```text
desarrollo-web/
├── packages/
│   ├── hardhat/              # Contratos y scripts de deployment
│   │   ├── contracts/        # Smart contracts en Solidity
│   │   │   └── DevWeb.sol   # Contrato principal de Escrow
│   │   ├── deploy/          # Scripts de despliegue
│   │   └── test/            # Tests de contratos
│   │
│   └── nextjs/              # Aplicación frontend
│       ├── app/             # Pages y rutas (App Router)
│       ├── components/      # Componentes de React
│       ├── contracts/       # ABIs y direcciones de contratos
│       └── utils/           # Utilidades y helpers
│
├── package.json             # Dependencias y scripts del monorepo
└── README.md               # Este archivo
```

## 📖 Cómo Usar la Aplicación

### Para Clientes

1. **Conecta tu Wallet**: Haz clic en "Connect Wallet" en la esquina superior derecha
2. **Crea un Proyecto**:
   - Navega a la sección "Crear Proyecto"
   - Completa los detalles del servicio (SEO o Desarrollo Web)
   - Define el presupuesto en ETH y el plazo de entrega
   - Confirma la transacción para depositar los fondos
3. **Revisa las Entregas**:
   - Ve a "Mis Contratos" para ver tus proyectos activos
   - Cuando el freelancer entregue, revisa el link proporcionado
   - Aprueba el trabajo para liberar los fondos
4. **Solicita Reembolso**: Si el plazo vence sin entrega, puedes solicitar un reembolso automático

### Para Freelancers (Admin)

1. **Conecta tu Wallet de Admin**: Usa la wallet que desplegó el contrato
2. **Visualiza Proyectos**: Todos los proyectos activos aparecerán en tu panel
3. **Marca como Entregado**:
   - Cuando completes un trabajo, agrega el link de entrega (GitHub, Google Drive, etc.)
   - Registra la entrega en la blockchain
4. **Recibe el Pago**: Una vez que el cliente apruebe, los fondos se transfieren automáticamente
5. **Reclamación por Inactividad**: Si el cliente no responde tras 7 días de la entrega, puedes reclamar los fondos

## 🔐 Seguridad

El contrato `DevWeb` implementa múltiples medidas de seguridad:

- ✅ **Ownable**: Solo el owner (freelancer) puede marcar proyectos como entregados
- ✅ **ReentrancyGuard**: Protección contra ataques de reentrada
- ✅ **Estado Inmutable**: Los fondos se resetean antes de transferencias
- ✅ **Gestión de Plazos**: Deadlines automáticos para proteger a ambas partes
- ✅ **Eventos**: Cada acción genera eventos para trazabilidad completa

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: nueva característica'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENCE` para más detalles.

## 🔗 Enlaces Útiles

- [Documentación de Scaffold-ETH 2](https://docs.scaffoldeth.io/)
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [OpenZeppelin Docs](https://docs.openzeppelin.com/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Next.js Documentation](https://nextjs.org/docs)
