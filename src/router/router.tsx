import { createBrowserRouter, RouterProvider, useSearchParams } from 'react-router-dom'
import { MainLayout } from '../layouts'
import { ItineraryPage, DayViewPage, TravelersPage, SettingsPage, MBTATransit } from '../pages'
function MBTATransitWrapper() {
  const [searchParams] = useSearchParams()
  const defaultStopId = searchParams.get('stop') ?? undefined
  console.log('MBTATransit defaultStopId:', defaultStopId)
  return <MBTATransit defaultStopId={defaultStopId} />
}
export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <ItineraryPage />,
      },
      {
        path: '/team',
        element: <TravelersPage />,
      },
      {
        path: '/dayview',
        element: <DayViewPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
      {
        path: '/transit',
        element: <MBTATransitWrapper />,
      },
    ],
  },
])

export function Router() {
  return <RouterProvider router={router} />
}
