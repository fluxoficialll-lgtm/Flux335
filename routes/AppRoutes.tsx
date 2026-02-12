
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Importa os arrays de rotas dos módulos
import {
  authRoutes,
  feedRoutes,
  groupRoutes,
  marketplaceRoutes,
  profileRoutes,
  settingsRoutes,
  financialRoutes,
  notificationRoutes,
} from './modules';

// Combina todos os módulos em um único array
const allRoutes = [
  ...authRoutes,
  ...feedRoutes,
  ...groupRoutes,
  ...marketplaceRoutes,
  ...profileRoutes,
  ...settingsRoutes,
  ...financialRoutes,
  ...notificationRoutes
];

// Componente de Loading
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0c0f14] text-white">
    <i className="fa-solid fa-circle-notch fa-spin text-3xl text-[#00c2ff]"></i>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Mapeia o array de rotas para os componentes <Route> */}
        {allRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
        
        {/* Rota Fallback: Redireciona para o feed se nenhuma outra rota corresponder */}
        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
