'use client'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useReactTable, getCoreRowModel, getFilteredRowModel, flexRender } from "@tanstack/react-table"

import { Search, Pencil, Trash, Eye, Plus, BarChart, Star, ChevronRight, ArchiveRestore, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"


import { useDeleteProduct, useRestoreProduct, useSellerProducts, useProductCategories, useSellerProductsSummary } from "@/hooks/useProducts"
import { Product } from "@/types"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const AllProductsPage = () => {
    const [globalFilter, setGlobalFilter] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
    const [currentTab, setCurrentTab] = useState<'all' | 'active' | 'draft' | 'out_of_stock' | 'deleted'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string>("all_categories");
    const [sortBy, setSortBy] = useState<string>("newest");

    // Get product categories
    const { data: categories = [] } = useProductCategories();

    // Get products with filtering
    const { data, isLoading: isProductLoading } = useSellerProducts({
        search: globalFilter,
        category: selectedCategory === "all_categories" ? undefined : selectedCategory,
        status: currentTab,
        sortBy: sortBy as any,
        page: currentPage,
        limit: 10
    });

    // Get summary statistics (import at top)
    const { data: summaryData } = useSellerProductsSummary();

    // Products data extraction with fallbacks for type safety
    const products = data?.products || [];
    const pagination = data?.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrev: false
    };

    // Delete Product Mutation - Updated with dialog close
    const deleteMutation = useDeleteProduct(() => setDeleteDialogOpen(null));

    // Restore Product Mutation - Updated with dialog close
    const restoreProductMutation = useRestoreProduct(() => setDeleteDialogOpen(null));

    const columns = useMemo<any[]>(() => [
        {
            accessorKey: "image",
            header: "Image",
            cell: ({ row }: { row: { original: Product } }) => (
                <Image
                    width={200}
                    height={200}
                    alt={row.original.images[0]?.url || "Product image"}
                    src={row.original.images[0]?.url || "/placeholder.png"}
                    className="w-12 h-12 rounded-md object-cover"
                />
            )
        },
        {
            accessorKey: "name",
            header: "Product Name",
            cell: ({ row }: { row: { original: Product } }) => {
                const truncatedTitle = row.original.title.length > 30 ? `${row.original.title.substring(0, 30)}...` : row.original.title;

                return (
                    <div className="flex items-center gap-2">
                        <Link
                            href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
                            className={`hover:underline ${row.original.isDeleted ? 'text-red-400 line-through' : 'text-blue-400'}`}
                            title={row.original.title}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {truncatedTitle}
                        </Link>
                        {row.original.isDeleted && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Deleted</span>
                        )}
                        {row.original.status === 'Draft' && (
                            <span className="text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded">Draft</span>
                        )}
                        {row.original.stock <= 0 && !row.original.isDeleted && (
                            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">Out of Stock</span>
                        )}
                    </div>
                )
            }
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: ({ row }: { row: { original: Product } }) => (
                <div className="flex flex-col">
                    <span className="font-medium">₹{row.original.sale_price || row.original.regular_price}</span>
                    {row.original.sale_price && row.original.sale_price < row.original.regular_price && (
                        <span className="text-xs text-gray-500 line-through">₹{row.original.regular_price}</span>
                    )}
                </div>
            )
        },
        {
            accessorKey: "stock",
            header: "Stock",
            cell: ({ row }: { row: { original: Product } }) => (
                <span
                    className={`${row.original.stock <= 10 ? 'text-red-500' : row.original.stock <= 20 ? 'text-amber-500' : 'text-green-500'} font-medium`}
                >{row.original.stock} left</span>
            )
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }: { row: { original: Product } }) => (
                <Badge variant="outline" className="capitalize">
                    {row.original.category}
                </Badge>
            )
        },
        {
            accessorKey: "rating",
            header: "Rating",
            cell: ({ row }: { row: { original: Product } }) => (
                <div className="flex items-center gap-1 text-amber-400">
                    <Star fill="#fde047" size={18} />
                    <span>{row.original.rating || 0}</span>
                </div>
            )
        },
        {
            header: "Actions",
            cell: ({ row }: { row: { original: Product } }) => (
                <div className="flex gap-2">
                    <Link href={`/dashboard/product/${row.original.id}`}
                        className="text-blue-400 transition-all"
                    >
                        <Button variant="outline" size="sm" className="hover:text-blue-600">
                            <Eye size={16} />
                        </Button>
                    </Link>
                    <Link href={`/dashboard/product/edit/${row.original.slug}`}
                        className="text-yellow-400 transition-all"
                    >
                        <Button
                            className="hover:text-yellow-600" variant="outline" size="sm">
                            <Pencil size={16} />
                        </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                        <BarChart size={16} />
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
                                    size="sm"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => setDeleteDialogOpen(row.original.id)}
                                >
                                    <Trash size={16} />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Delete Product</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4">
                                    <div className="grid gap-3">
                                        <p>Are you sure you want to delete <b>{row.original?.title}</b>?</p>
                                        <p className="text-sm text-muted-foreground">You can restore this product later if needed.</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            type="button"
                                            onClick={() => setDeleteDialogOpen(null)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            type="button"
                                            disabled={deleteMutation.isPending}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                deleteMutation.mutate(row?.original?.id);
                                            }}
                                        >
                                            {deleteMutation.isPending ? (
                                                <>
                                                    <Loader2 size={16} className="mr-2 animate-spin" />
                                                    Deleting...
                                                </>
                                            ) : (
                                                <>
                                                    <Trash size={16} className="mr-2" />
                                                    Delete
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <DialogFooter>
                                    {deleteMutation.error && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {(deleteMutation.error as any)?.response?.data?.message ||
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
                                    size="sm"
                                    className="text-green-600 hover:text-green-800"
                                    onClick={() => setDeleteDialogOpen(row.original.id)}
                                >
                                    <ArchiveRestore size={16} />
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
                                            variant="outline"
                                            type="button"
                                            onClick={() => setDeleteDialogOpen(null)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="default"
                                            type="button"
                                            disabled={restoreProductMutation.isPending}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                restoreProductMutation.mutate(row?.original?.id);
                                            }}
                                        >
                                            {restoreProductMutation.isPending ? (
                                                <>
                                                    <Loader2 size={16} className="mr-2 animate-spin" />
                                                    Restoring...
                                                </>
                                            ) : (
                                                <>
                                                    <ArchiveRestore size={16} className="mr-2" />
                                                    Restore
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    {restoreProductMutation.error && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {(restoreProductMutation.error as any)?.response?.data?.message ||
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
    ], [deleteDialogOpen, deleteMutation.isPending, restoreProductMutation.isPending]);

    const table = useReactTable({
        data: products,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: "includesString",
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
    })

    // Handle pagination
    const handlePrevPage = () => {
        if (pagination.hasPrev) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleNextPage = () => {
        if (pagination.hasNext) {
            setCurrentPage(prev => prev + 1);
        }
    };

    // Analytics summary cards
    const analyticsCards = (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Products</CardTitle>
                    <CardDescription>All products in your store</CardDescription>
                </CardHeader>
                <CardContent>
                    <span className="text-3xl font-bold block">
                        {summaryData?.totalProducts ?? pagination.totalCount ?? 0}
                    </span>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Out of Stock</CardTitle>
                    <CardDescription>Products needing replenishment</CardDescription>
                </CardHeader>
                <CardContent>
                    {isProductLoading && !summaryData ? (
                        <Skeleton className="h-8 w-16" />
                    ) : (
                        <span className="text-3xl font-bold block text-amber-500">
                            {summaryData?.outOfStockProducts ?? products.filter(p => p.stock <= 0 && !p.isDeleted).length}
                        </span>
                    )}
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Deleted Products</CardTitle>
                    <CardDescription>Recently removed products</CardDescription>
                </CardHeader>
                <CardContent>
                    {isProductLoading && !summaryData ? (
                        <Skeleton className="h-8 w-16" />
                    ) : (
                        <span className="text-3xl font-bold block text-red-500">
                            {summaryData?.deletedProducts ?? products.filter(p => p.isDeleted).length}
                        </span>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="w-full min-h-screen p-4 md:p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-1">
                <h2 className="text-2xl text-primary font-semibold">All Products</h2>
                <Link href={'/dashboard/create-product'}>
                    <Button className="flex gap-1">
                        <Plus size={18} /> Add Product
                    </Button>
                </Link>
            </div>

            {/* Breadcrumbs */}
            <div className='flex items-center mb-6'>
                <Link href={'/dashboard'} className='cursor-pointer text-secondary'>Dashboard</Link>
                <ChevronRight size={20} className='opacity-[0.8]' />
                <span>All Products</span>
            </div>

            {/* Analytics Summary */}
            {analyticsCards}

            {/* Tabs and Filters */}
            <div className="mb-6">
                <Tabs 
                    defaultValue="all"
                    value={currentTab}
                    onValueChange={(value) => {
                        setCurrentTab(value as any);
                        setCurrentPage(1);
                    }}
                >
                    <TabsList className="mb-4">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="draft">Draft</TabsTrigger>
                        <TabsTrigger value="out_of_stock">Out of Stock</TabsTrigger>
                        <TabsTrigger value="deleted">Deleted</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Search */}
                <div className="flex items-center">
                    <Input
                        type="text"
                        placeholder="Search products..."
                        className="w-full bg-transparent"
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                    />
                    <Search size={18} className="ml-2 text-accent" />
                </div>

                {/* Category Filter */}
                <div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all_categories">All Categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                    {category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Sort Filter */}
                <div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="price_asc">Price: Low to High</SelectItem>
                            <SelectItem value="price_desc">Price: High to Low</SelectItem>
                            <SelectItem value="popularity">Popularity</SelectItem>
                            <SelectItem value="rating">Rating</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-secondary rounded-lg pt-4">
                {isProductLoading ? (
                    <div className="p-8 flex justify-center">
                        <div className="space-y-4 w-full max-w-3xl">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center p-8">
                        <p className="text-lg mb-4">No products found</p>
                        <Link href="/dashboard/create-product">
                            <Button>Add your first product</Button>
                        </Link>
                    </div>
                ) : (
                    <>
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
                                        className="border-b hover:bg-secondary/80"
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

                        {/* Pagination */}
                        <div className="flex items-center justify-between p-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                Showing {products.length} of {pagination.totalCount} products
                            </p>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrevPage}
                                    disabled={!pagination.hasPrev}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm">
                                    Page {pagination.currentPage} of {pagination.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextPage}
                                    disabled={!pagination.hasNext}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default AllProductsPage