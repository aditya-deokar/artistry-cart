import * as tf from '@tensorflow/tfjs';
import { getUserActivity } from './fetch-user-activity';
import { preprocessData } from '../utils/preprocessData';

const EMBEDDING_DIM = 50;

interface UserAction {
    userId: string;
    productId: string;
    actionType: "product_view" | "add_to_cart" | "add_to_wishlist" | "purchase";
}

interface Interaction {
    userId: string;
    productId: string;
    actionType: UserAction["actionType"];
}

interface RecommendedProduct {
    productId: string;
    score: number;
}

async function fetchUserActivity(userId: string): Promise<UserAction[]> {
    const userActions = await getUserActivity(userId);
    return Array.isArray(userActions) ? (userActions as unknown as UserAction[]) : [];
}


export const recommendProducts = async (userId: string, allProducts: any): Promise<string[]> => {
    console.log(`Starting recommendation for user: ${userId}`);
    const userActions: UserAction[] = await fetchUserActivity(userId);
    console.log(`Fetched ${userActions.length} user actions.`);

    if (userActions.length === 0) {
        console.log('No user actions found.');
        return [];
    }

    const processedData = preprocessData(userActions, allProducts, userId);

    if (!processedData || !processedData.interactions || processedData.products) {
        // Note: processedData.products is expected to be returned, the check 'processedData.products' as a failure condition seems wrong if it is truthy.
        // Original code: if (!processedData || !processedData.interactions || processedData.products)
        // 'processedData.products' is truthy (array), so this if statement might be evaluating to true and returning []?
        // Let's check preprocessData return type. It returns { interactions, products }.
        // If processedData.products is present, the original condition '|| processedData.products' would return []! 
        // That looks like a BUG in the original code.
    }

    // Fix logic: If processedData is null or interactions missing. Remove incorrect products check.
    if (!processedData || !processedData.interactions || processedData.interactions.length === 0) {
        console.log('Preprocess returned empty interactions.');
        return [];
    }

    const { interactions } = processedData as {
        interactions: Interaction[];
    }
    console.log(`Preprocessed interactions count: ${interactions.length}`);

    const userMap: Record<string, number> = {}
    const productMap: Record<string, number> = {}

    let userCount = 0;
    let productCount = 0;

    interactions.forEach(({ userId, productId }) => {
        if (!(userId in userMap)) userMap[userId] = userCount++;
        if (!(productId in productMap)) productMap[productId] = productCount++;
    })
    console.log(`User map size: ${userCount}, Product map size: ${productCount}`);

    // Ensure current user is in map (should be if interactions exist)
    if (!(userId in userMap)) {
        console.log('User ID not found in userMap after processing interactions.');
        // This is possible if all interactions were filtered out or something.
        // But we checked interactions.length > 0.
        // Wait, interactions in preprocessData are FORCED to have the passed userId.
    }

    // define Model input layar

    const userInput = tf.input({
        shape: [1],
        dtype: 'int32'
    }) as tf.SymbolicTensor;

    const productInput = tf.input({
        shape: [1],
        dtype: 'int32'
    }) as tf.SymbolicTensor;

    // create embedding layer (lookup table)
    const userEmbedding = tf.layers.embedding({
        inputDim: userCount,
        outputDim: EMBEDDING_DIM,
        //   inputLength: 1
    }).apply(userInput) as tf.SymbolicTensor;

    const productEmbedding = tf.layers.embedding({
        inputDim: productCount,
        outputDim: EMBEDDING_DIM,
        //   inputLength: 1
    }).apply(productInput) as tf.SymbolicTensor;

    // flatten the 2D embedding layer into 1D feature vector
    const userVector = tf.layers.flatten().apply(userEmbedding) as tf.SymbolicTensor;
    const productVector = tf.layers.flatten().apply(productEmbedding) as tf.SymbolicTensor;

    // Dot product of user and product vector
    const merged = tf.layers.dot({ axes: 1 }).apply([userVector, productVector]) as tf.SymbolicTensor;

    // Final output layer: outputs probability of user liking the product
    const output = tf.layers
        .dense({ units: 1, activation: 'sigmoid' })
        .apply(merged) as tf.SymbolicTensor;

    const model = tf.model({
        inputs: [userInput, productInput],
        outputs: output
    });

    model.compile({
        optimizer: tf.train.adam(),
        loss: "binaryCrossentropy",
        metrics: ['accuracy']
    });

    // convert user and product interactions to tensors
    const userTensor = tf.tensor1d(
        interactions.map(({ userId }) => userMap[userId] ?? 0),
        "int32"
    );

    const productTensor = tf.tensor1d(
        interactions.map(({ productId }) => productMap[productId] ?? 0),
        "int32"
    );

    const weightLabels = tf.tensor2d(
        interactions.map(({ actionType }) => {
            switch (actionType) {
                case "product_view":
                    return [0.1];
                case "add_to_cart":
                    return [0.7];
                case "add_to_wishlist":
                    return [0.5];
                case "purchase":
                    return [1.0];
                default:
                    return [0.0];
            }
        }),
        [interactions.length, 1]
    );

    await model.fit([userTensor, productTensor], weightLabels, {
        epochs: 5,
        batchSize: 32,
        // validationSplit: 0.2
    })

    console.log('Model training complete.');

    const productTensorAll = tf.tensor1d(
        Object.values(productMap),
        "int32"
    );

    // Predict for the specific user
    // If user is new (not in map), use 0 (unknown) - though logic above implies they are in map.
    const userIndex = userMap[userId] ?? 0;

    if (Object.keys(productMap).length === 0) {
        console.log('No products in productMap to recommend.');
        return [];
    }

    const predictions = model.predict([
        tf.tensor1d([userIndex], "int32"), // Create a tensor for the single user
        productTensorAll
    ]) as tf.Tensor;

    const scores = (await predictions.array()) as number[];
    console.log(`Generated ${scores.length} scores.`);

    // sort and select top 10 recommended products
    const recommendedProducts: RecommendedProduct[] = Object.keys(productMap)
        .map((productId, index) => ({
            productId,
            score: scores[index] ?? 0
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

    console.log('Top recommendations:', recommendedProducts);

    return recommendedProducts.map(({ productId }) => productId);
}

