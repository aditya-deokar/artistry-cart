


export const preprocessData = (userActions: any[], products: any[], userId: string) => {
    const interactions: any[] = [];

    userActions.forEach((action: any) => {
        if (!action.productId) return;

        let type = action.type || action.action;

        // Map DB action types to Service action types
        switch (type) {
            case 'PRODUCT_VIEW':
                type = 'product_view';
                break;
            case 'ADD_TO_CART':
                type = 'add_to_cart';
                break;
            case 'WISHLIST_ADD':
                type = 'add_to_wishlist';
                break;
            case 'PURCHASE':
                type = 'purchase';
                break;
            // Map others if necessary, or let them fall through (will get 0 weight)
        }

        interactions.push({
            userId: userId,
            productId: action.productId,
            // timestamp: action.timestamp,
            actionType: type
        })
    });

    return { interactions, products };
}
