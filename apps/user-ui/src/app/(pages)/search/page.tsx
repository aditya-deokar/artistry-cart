import { SearchResultsView } from '@/components/search/SearchResultsView';
import React, { Suspense } from 'react';
import SearchLoading from './loading';

export default function SearchPage() {
    return (
        <Suspense fallback={<SearchLoading />}>
            <SearchResultsView />
        </Suspense>
    );
}