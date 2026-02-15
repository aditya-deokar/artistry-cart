import OrderTable from '@/components/dashboard/orders/OrderTable';

export default function OrdersPage() {
    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
                </div>
                <OrderTable />
            </div>
        </div>
    );
}
