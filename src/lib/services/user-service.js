import prisma from "@/lib/prisma";

/**
 * Service layer function that handles the creation of a new user and their associated
 * shop and subscription in a single atomic transaction. If the user already exists,
 * it checks for and creates a shop and subscription if needed.
 *
 * This is a complex business operation that spans multiple models (User, Shop, Subscription),
 * which is why it belongs in the service layer rather than the data layer.
 *
 * @param {import('next-auth').User} user - The user object from the Auth.js callback.
 * @returns {Promise<import('@prisma/client').User | null>} The created or existing user, or null on failure.
 */
export async function upsertUserAndCreateShop(user) {
  if (!user || !user.email) {
    console.error("Invalid user object provided for upsert.");
    return null;
  }

  try {
    // --- OPTIMIZATION ---
    // Fetch the user and their related shop in a single, efficient query.
    const existingUserWithShop = await prisma.user.findUnique({
      where: { email: user.email },
      include: { shop: true }, // Eagerly load the shop relation
    });

    // --- Case 1: User already exists ---
    if (existingUserWithShop) {
      // If the user exists but does not have a shop, create one for them
      // along with the default trial subscription. This ensures data consistency.
      if (!existingUserWithShop.shop) {
        await prisma.$transaction(async (tx) => {
          const newShop = await tx.shop.create({
            data: {
              name: `${existingUserWithShop.name}'s Shop`,
              ownerId: existingUserWithShop.id,
            },
          });

          const trialEndDate = new Date();
          trialEndDate.setDate(trialEndDate.getDate() + 14);

          await tx.subscription.create({
            data: {
              shopId: newShop.id,
              plan: "FREE_TRIAL",
              status: "TRIALING",
              endDate: trialEndDate,
            },
          });
        });
      }
      return existingUserWithShop; // Return the existing user
    }

    // --- Case 2: User is new ---
    // Create the User, Shop, and Subscription in a single atomic transaction.
    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: user.name,
          email: user.email,
          image: user.image,
          role: "SHOP_OWNER", // New users are always the Shop Owner
        },
      });

      const createdShop = await tx.shop.create({
        data: {
          name: `${user.name}'s Shop`, // A sensible default shop name
          ownerId: createdUser.id,
        },
      });

      // Set up the initial 14-day free trial subscription
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14);

      await tx.subscription.create({
        data: {
          shopId: createdShop.id,
          plan: "FREE_TRIAL",
          status: "TRIALING",
          endDate: trialEndDate,
        },
      });

      return createdUser;
    });

    return newUser;
  } catch (error) {
    console.error("Failed to upsert user and create shop:", error);
    // Return null to indicate failure, which can be handled in the auth callback.
    return null;
  }
}
