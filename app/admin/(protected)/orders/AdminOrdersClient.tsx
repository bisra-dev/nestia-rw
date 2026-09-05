"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import OverviewDashboard, { ActiveOrderLog } from "../../components/OverviewDashboard";
import OrderManagementDrawer from "../../components/OrderManagementDrawer";

export default function AdminOrdersClient({
  initialOrders,
}: {
  initialOrders: ActiveOrderLog[];
}) {
  const router = useRouter();
  const [activeOrder, setActiveOrder] = useState<ActiveOrderLog | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSelectOrderForEdit = (order: ActiveOrderLog) => {
    setActiveOrder(order);
    setDrawerOpen(true);
  };

  const handleCreateNewOrderClick = () => {
    setActiveOrder(null);
    setDrawerOpen(true);
  };

  const handleClose = () => {
    setDrawerOpen(false);
    router.refresh(); // re-fetches real data from the server after any save
  };

  return (
    <>
      <OverviewDashboard
        orders={initialOrders}
        onSelectOrderForEdit={handleSelectOrderForEdit}
        onCreateNewOrderClick={handleCreateNewOrderClick}
      />
      {drawerOpen && (
        <OrderManagementDrawer
          activeOrder={activeOrder}
          onClose={handleClose}
          onSave={() => {}} 
          fullScreen={false}
        />
      )}
    </>
  );
}