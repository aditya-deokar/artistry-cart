import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Payment System Seed Data
 * 
 * This script creates test data for the payment system including:
 * - Test users
 * - Test orders with payment records
 * - Test payouts
 * - Test refunds
 * 
 * Run with: npx ts-node prisma/seed/seed-payments.ts
 */

async function seedPaymentData() {
    console.log('🌱 Starting payment system seed...\n');

    // Get existing sellers and users
    const sellers = await prisma.sellers.findMany({
        take: 5,
        include: { shop: true },
    });

    const users = await prisma.users.findMany({
        take: 5,
    });

    const products = await prisma.products.findMany({
        take: 10,
        include: { Shop: true },
    });

    if (sellers.length === 0 || users.length === 0 || products.length === 0) {
        console.log('❌ No existing sellers, users, or products found.');
        console.log('   Please run the main seed first to populate basic data.');
        return;
    }

    console.log(`📦 Found ${sellers.length} sellers, ${users.length} users, ${products.length} products`);

    // Update sellers with mock Stripe IDs for testing
    console.log('\n📝 Updating sellers with test Stripe Connect IDs...');
    for (let i = 0; i < sellers.length; i++) {
        const seller = sellers[i];
        await prisma.sellers.update({
            where: { id: seller.id },
            data: {
                stripeId: `acct_test_${seller.id.slice(-8)}`,
                stripeOnboardingComplete: true,
            },
        });
        console.log(`   ✅ ${seller.name} -> acct_test_${seller.id.slice(-8)}`);
    }

    // Create test orders with payments
    console.log('\n📦 Creating test orders with payment records...');

    const orderStatuses = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const;
    const createdOrders = [];

    for (let i = 0; i < Math.min(5, users.length); i++) {
        const user = users[i];
        const product = products[i % products.length];
        const shop = product.Shop;

        if (!shop) continue;

        const quantity = Math.floor(Math.random() * 3) + 1;
        const totalAmount = (product.current_price || product.regular_price) * quantity;
        const platformFee = totalAmount * 0.1; // 10% admin margin
        const sellerAmount = totalAmount * 0.9; // 90% to seller

        const order = await prisma.orders.create({
            data: {
                userId: user.id,
                shopId: shop.id,
                totalAmount,
                status: orderStatuses[i % orderStatuses.length],
                deliveryStatus: i >= 3 ? 'Delivered' : 'Processing',
                items: {
                    create: {
                        productId: product.id,
                        quantity,
                        price: product.current_price || product.regular_price,
                    },
                },
                payment: {
                    create: {
                        stripePaymentIntent: `pi_test_${Date.now()}_${i}`,
                        stripeChargeId: `ch_test_${Date.now()}_${i}`,
                        amount: totalAmount,
                        currency: 'usd',
                        platformFee,
                        sellerAmount,
                        status: 'SUCCEEDED',
                        paymentMethod: 'card',
                        metadata: {
                            testOrder: true,
                            createdBy: 'seed-script',
                        },
                    },
                },
            },
            include: { payment: true, items: true },
        });

        createdOrders.push(order);
        console.log(`   ✅ Order ${order.id.slice(-8)} - $${totalAmount.toFixed(2)} (${orderStatuses[i % orderStatuses.length]})`);
    }

    // Create test payout for first seller
    console.log('\n💰 Creating test seller payouts...');
    const firstSeller = sellers[0];
    if (firstSeller) {
        const payout = await prisma.payouts.create({
            data: {
                sellerId: firstSeller.id,
                stripeTransferId: `tr_test_${Date.now()}`,
                amount: 150.00,
                currency: 'usd',
                status: 'COMPLETED',
                processedAt: new Date(),
                periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
                periodEnd: new Date(),
            },
        });
        console.log(`   ✅ Payout ${payout.id.slice(-8)} - $150.00 to ${firstSeller.name}`);
    }

    // Create test refund for one order
    console.log('\n🔄 Creating test refund...');
    const orderWithPayment = createdOrders.find(o => o.payment);
    if (orderWithPayment?.payment) {
        const refund = await prisma.refunds.create({
            data: {
                paymentId: orderWithPayment.payment.id,
                stripeRefundId: `re_test_${Date.now()}`,
                amount: orderWithPayment.payment.amount * 0.5, // 50% partial refund
                reason: 'Test partial refund - item not as described',
                status: 'SUCCEEDED',
                requestedBy: orderWithPayment.userId,
                requestedByType: 'customer',
                processedAt: new Date(),
            },
        });

        // Update payment status
        await prisma.payments.update({
            where: { id: orderWithPayment.payment.id },
            data: { status: 'PARTIALLY_REFUNDED' },
        });

        console.log(`   ✅ Refund ${refund.id.slice(-8)} - $${refund.amount.toFixed(2)} (partial)`);
    }

    // Summary
    console.log('\n✨ Seed completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Orders created: ${createdOrders.length}`);
    console.log(`   Payments created: ${createdOrders.filter(o => o.payment).length}`);
    console.log(`   Payouts created: 1`);
    console.log(`   Refunds created: 1`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n📋 Test API endpoints:');
    console.log('   GET  /order/api/orders              - List orders');
    console.log('   GET  /order/api/seller/earnings     - Seller earnings');
    console.log('   GET  /order/api/seller/payouts      - Payout history');
}

seedPaymentData()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
