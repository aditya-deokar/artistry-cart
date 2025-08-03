'use client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axiosInstance from "@/utils/axiosinstance"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useReactTable, getCoreRowModel, getFilteredRowModel, flexRender } from "@tanstack/react-table"
import { Search, Pencil, Trash, Eye, Plus, BarChart, Star, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"

const FetchProduct = async ()=>{
    const res= await axiosInstance.get("/product/api/get-shop-products");
    return res?.data?.products;
}



const AllProductsPage = () => {

    const [globalFilter, setGlobalFilter] = useState("");
    const [analyticsData, setAnalyticsData] = useState(null);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [seletedProduct, setSelectedProduct]= useState<any>();

    const queryClient= useQueryClient();

    const { data: products =[] , isLoading:isProductLoading } = useQuery({
        queryKey: ['shop-products'],
        queryFn: FetchProduct,
        staleTime: 1000 * 60 * 5,
    });

    const columns = useMemo(()=>[
        {
            accessorKey: "image",
            header: "Image",
            cell : ({row}: any)=> (
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
            accessorKey:"name",
            header: "Product Name",
            cell: ({ row }:any)=>{
                const truncatedTitle= row.original.title.length > 25 ? `${row.original.title.substring(0, 15)}...` : row.original.title ;

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
            cell: ({ row } :any) => (
                <span>{row.original.sale_price}</span>
            )
        },
        {
            accessorKey: "stock",
            header: "Stocks",
            cell: ({ row } :any) => (
                <span
                className={ row.original.stock < 10 ? 'text-red-500' : 'text-primary'}
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
            cell: ({ row } :any) => (
                <div className="flex items-center gap-1 text-primary/80 ">
                    <Star fill="#fde047" size={18}/>
                    <span>{row.original.rating || 5}</span>
                </div>
            )
        },
        {
            header: "Actions",
            cell: ({ row} :any)=>(
                <div className="flex gap-3">
                    <Link href={`product/${row.original.id}`}
                    className="text-blue-400  transition-all"
                    >
                        <Button variant={"outline"} className="hover:text-blue-600">
                            <Eye size={18}/>
                        </Button>
                        
                    </Link>
                    <Link href={`product/edit/${row.original.id}`}
                    className="text-yellow-400  transition-all"
                    >
                        <Button 
                        className="hover:text-yellow-600" variant={"outline"}>
                            <Pencil size={18}/>
                        </Button>
                        
                    </Link>
                    <Button variant={"outline"}>
                        <BarChart size={18}/>
                    </Button>
                    <Button variant={"destructive"}>
                        <Trash size={18}/>
                    </Button>
                </div>
            )
        }
        
    ], []);


    const table = useReactTable({
        data: products,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: "includesString",
        state: { globalFilter },
        onGlobalFilterChange :setGlobalFilter,
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
                        <Plus size={18}/> Add Product
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
                onChange={(e)=> setGlobalFilter(e.target.value)}
                />
                <Search size={18} className="ml-2 text-accent"/>
            </div>

            {/* Table */}

            <div className="overflow-x-auto bg-secondary rounded-lg pt-4">
                {isProductLoading ? (
                    <p className="text-center">Loading Products..</p>
                ): (
                    <table className="w-full">
                        <thead>
                            {table.getHeaderGroups().map((headerGroup)=>(
                                <tr key={headerGroup.id} 
                                className="border-b"
                                >
                                    {headerGroup.headers.map((header)=> (
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
                            {table.getRowModel().rows.map((row)=> (
                                <tr key={row.id}
                                className="border-b "
                                >
                                    {row.getVisibleCells().map((cell)=>(
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