
import { Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { MapPage } from "./pages/map-page";
import { WarehouseListPage } from "./pages/warehouse-list";
import { WarehouseDetailPage } from "./pages/warehouse-detail";
import WarehouseYardPage from "./pages/warehouse-yard";
import { CarrierListPage } from "./pages/carrier-list";

export default function App() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col w-full">
          <header className="border-b px-4 py-2">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold">Loadlane</h1>
            </div>
          </header>
          <div className="flex-1 p-4 w-full">
            <Routes>
              <Route path="/" element={<MapPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/warehouses" element={<WarehouseListPage />} />
              <Route path="/warehouses/:id" element={<WarehouseDetailPage />} />
              <Route path="/warehouses/:id/yard" element={<WarehouseYardPage />} />
              <Route path="/carriers" element={<CarrierListPage />} />
              <Route path="*" element={<div>Page Not Found</div>} />
            </Routes>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
