'use client'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import axiosInstance from "@/utils/axiosinstance"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useReactTable, getCoreRowModel, getFilteredRowModel, flexRender } from "@tanstack/react-table"
import { AxiosError } from "axios"
import { Search, Pencil, Trash, Eye, Plus, BarChart, Star, ChevronRight, ArchiveRestore } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { toast } from "sonner"

const FetchProduct = async () => {
    const res = await axiosInstance.get("/product/api/get-shop-products");
    return res?.data?.products;
}

const deleteProduct = async (productId: string) => {
    const res = await axiosInstance.delete(`/product/api/delete-product/${productId}`);
}

const restoreProduct = async (productId: string) => {
    const res = await axiosInstance.put(`/product/api/restore-product/${productId}`)
}

const AllProductsPage = () => {
    const [globalFilter, setGlobalFilter] = useState("");
    const [analyticsData, setAnalyticsData] = useState(null);
    const [showAnalytics, setShowAnalytics] = useState(false);
    // Add this state for dialog management
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

    const queryClient = useQueryClient();

    const { data: products = [], isLoading: isProductLoading } = useQuery({
        queryKey: ['shop-products'],
        queryFn: FetchProduct,
        staleTime: 1000 * 60 * 5,
    });

    // Delete Product Mutation - Updated with dialog close
    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shop-products"] });
            toast.success("Product deleted successfully!");
            setDeleteDialogOpen(null); // Close dialog on success
        },
        onError: (error) => {
            toast.error((error as AxiosError<{ message: string }>)?.response?.data?.message || "Delete failed");
        }
    })

    // Restore Product Mutation - Updated with dialog close
    const restoreProductMutation = useMutation({
        mutationFn: restoreProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shop-products"] })
            toast.success("Product restored successfully!");
            setDeleteDialogOpen(null); // Close dialog on success
        },
        onError: (error) => {
            toast.error((error as AxiosError<{ message: string }>)?.response?.data?.message || "Restore failed");
        }
    })

    const columns = useMemo(() => [
        {
            accessorKey: "image",
            header: "Image",
            cell: ({ row }: any) => (
                <Image
                    width={200}
                    height={200}
                    alt={row.original.images[0].url}
                    src={row.original.images[0].url}
                    className="w-12 h-12 rounded-md object-cover"
                />
            )
        },
        {
            accessorKey: "name",
            header: "Product Name",
            cell: ({ row }: any) => {
                const truncatedTitle = row.original.title.length > 25 ? `${row.original.title.substring(0, 15)}...` : row.original.title;

                return (
                    <Link
                        href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
                        className="text-blue-400 hover:underline"
                        title={row.original.title}
                    >
                        {truncatedTitle}
                    </Link>
                )
            }
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: ({ row }: any) => (
                <span>{row.original.sale_price}</span>
            )
        },
        {
            accessorKey: "stock",
            header: "Stocks",
            cell: ({ row }: any) => (
                <span
                    className={row.original.stock < 10 ? 'text-red-500' : 'text-primary'}
                >{row.original.stock} left</span>
            )
        },
        {
            accessorKey: "category",
            header: "Category",
        },
        {
            accessorKey: "rating",
            header: "Rating",
            cell: ({ row }: any) => (
                <div className="flex items-center gap-1 text-primary/80 ">
                    <Star fill="#fde047" size={18} />
                    <span>{row.original.rating || 5}</span>
                </div>
            )
        },
        {
            header: "Actions",
            cell: ({ row }: any) => (
                <div className="flex gap-3">
                    <Link href={`product/${row.original.id}`}
                        className="text-blue-400 transition-all"
                    >
                        <Button variant={"outline"} className="hover:text-blue-600">
                            <Eye size={18} />
                        </Button>
                    </Link>
                    <Link href={`product/edit/${row.original.id}`}
                        className="text-yellow-400 transition-all"
                    >
                        <Button
                            className="hover:text-yellow-600" variant={"outline"}>
                            <Pencil size={18} />
                        </Button>
                    </Link>
                    <Button variant={"outline"}>
                        <BarChart size={18} />
                    </Button>
                    
                    {/* Conditional Delete/Restore Button */}
                    {!row.original.isDeleted ? (
                        // Show Delete Button for Active Products
                        <Dialog 
                            open={deleteDialogOpen === row.original.id} 
                            onOpenChange={(open) => {
                                if (!open) {
                                    setDeleteDialogOpen(null);
                                }
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => setDeleteDialogOpen(row.original.id)}
                                >
                                    <Trash size={18} />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Delete Product</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4">
                                    <div className="grid gap-3">
                                        <p>Are you sure you want to delete <b>{row.original?.title}</b>?</p>
                                        <p className="text-sm text-muted-foreground">You can restore this product within 24hr</p>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <Button
                                            variant={"outline"}
                                            type="button"
                                            onClick={() => setDeleteDialogOpen(null)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant={"destructive"}
                                            type="button"
                                            disabled={deleteMutation.isPending}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                deleteMutation.mutate(row?.original?.id);
                                            }}
                                        >
                                            <Trash size={18} className="mr-2" />
                                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                                        </Button>
                                    </div>
                                </div>
                                
                                <DialogFooter>
                                    {deleteMutation.error && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {(deleteMutation.error as AxiosError<{ message: string }>)?.response?.data?.message || 
                                             "Delete failed"}
                                        </p>
                                    )}
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    ) : (
                        // Show Restore Button for Deleted Products
                        <Dialog 
                            open={deleteDialogOpen === row.original.id} 
                            onOpenChange={(open) => {
                                if (!open) {
                                    setDeleteDialogOpen(null);
                                }
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="text-green-600 hover:text-green-800"
                                    onClick={() => setDeleteDialogOpen(row.original.id)}
                                >
                                    <ArchiveRestore size={18} />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Restore Product</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4">
                                    <div className="grid gap-3">
                                        <p>Are you sure you want to restore <b>{row.original?.title}</b>?</p>
                                        <p className="text-sm text-muted-foreground">This product will be available for sale again.</p>
                                    </div>
                                    
                                    
                                </div>
                                
                                <DialogFooter>
                                    <div className="flex gap-2 justify-end">
                                        <Button
                                            variant={"outline"}
                                            type="button"
                                            onClick={() => setDeleteDialogOpen(null)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant={"default"}
                                            type="button"
                                            disabled={restoreProductMutation.isPending}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                restoreProductMutation.mutate(row?.original?.id);
                                            }}
                                        >
                                            <ArchiveRestore size={18} className="mr-2" />
                                            {restoreProductMutation.isPending ? "Restoring..." : "Restore"}
                                        </Button>
                                    </div>
                                    {restoreProductMutation.error && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {(restoreProductMutation.error as AxiosError<{ message: string }>)?.response?.data?.message || 
                                             "Restore failed"}
                                        </p>
                                    )}
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            )
        }
    ], [deleteDialogOpen, deleteMutation, restoreProductMutation]); // Add dependencies

    const table = useReactTable({
        data: products,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: "includesString",
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
    })

    return (
        <div className="w-full min-h-screen p-8 ">
            {/* header */}
            <div className="flex justify-between items-center mb-1">
                <h2 className="text-2xl text-primary font-semibold">All Product</h2>
                <Link href={'/dashboard/create-product'}
                    className="px-4 py-2 rounded-lg"
                >
                    <Button className="flex gap-1">
                        <Plus size={18} /> Add Product
                    </Button>
                </Link>
            </div>

            {/* Breadcrumbs */}
            <div className='flex items-center '>
                <Link href={'/dashboard'} className='cursor-pointer text-secondary'>Dashboard</Link>
                <ChevronRight size={20} className='opacity-[0.8]' />
                <span>All Product</span>
            </div>

            {/* Search Bar */}
            <div className="mb-4 flex items-center pt-2 flex-1 ">
                <Input
                    type="text"
                    placeholder="Search products.."
                    className="w-full bg-transparent"
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                />
                <Search size={18} className="ml-2 text-accent" />
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-secondary rounded-lg pt-4">
                {isProductLoading ? (
                    <p className="text-center">Loading Products..</p>
                ) : (
                    <table className="w-full">
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}
                                    className="border-b"
                                >
                                    {headerGroup.headers.map((header) => (
                                        <th key={header.id}
                                            className="p-3 text-left"
                                        >
                                            {header.isPlaceholder ? null : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row) => (
                                <tr key={row.id}
                                    className="border-b "
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="p-3">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

export default AllProductsPage