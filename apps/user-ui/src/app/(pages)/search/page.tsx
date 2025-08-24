import { SearchResultsView } from '@/components/search/SearchResultsView';
import React, {  Suspense } from 'react';




export default function SearchPage() {
    return (
        <Suspense fallback={<div>Loading Page...</div>}>
            <SearchResultsView />
        </Suspense>
    )
}