import { CContainer, CSpinner } from '@coreui/react'
import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

// routes config
import { authorizeScreen, useScreen } from '../ScreenContext'
import routes from '../routes'
import UnauthorizedPage from '../views/pages/page401/401Page'

const AppContent = () => {
  const { screen } = useScreen();
  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {routes.map((route, idx) => {
            const isAuthorized = !route?.screen_id || authorizeScreen(route.screen_id, screen);
            return (
              (route?.element) && (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  element={isAuthorized ? <route.element /> : <UnauthorizedPage />}
                />
              )
            )
          })}
          <Route path="/" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContent)
