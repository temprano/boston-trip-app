import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { MainLayout } from '../layouts'
import { ItineraryPage, DayViewPage, TravelersPage, SettingsPage, MBTATransit } from '../pages'

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
        element: <MBTATransit />,
      },
    ],
  },
])

export function Router() {
  return <RouterProvider router={router} />
}
