import {
  users,
  categories,
  products,
  cartItems,
  orders,
  orderItems,
  addresses,
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type ProductWithDetails,
  type CartItem,
  type InsertCartItem,
  type CartItemWithDetails,
  type Order,
  type InsertOrder,
  type OrderWithDetails,
  type InsertOrderItem,
  type Address,
  type InsertAddress,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, ilike } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(categoryId?: number, vendorId?: string): Promise<ProductWithDetails[]>;
  getProduct(id: number): Promise<ProductWithDetails | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  getVendorProducts(vendorId: number): Promise<ProductWithDetails[]>;
  getFeaturedProducts(): Promise<ProductWithDetails[]>;
  searchProducts(query: string): Promise<ProductWithDetails[]>;
  
  // Cart operations
  getCartItems(userId: number): Promise<CartItemWithDetails[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: number): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrders(userId: number): Promise<OrderWithDetails[]>;
  getVendorOrders(vendorId: number): Promise<OrderWithDetails[]>;
  getOrder(id: number): Promise<OrderWithDetails | undefined>;
  
  // Address operations
  getAddresses(userId: number): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: number, updates: Partial<InsertAddress>): Promise<Address>;
  deleteAddress(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  // Product operations
  async getProducts(categoryId?: number, vendorId?: string): Promise<ProductWithDetails[]> {
    let query = db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        salePrice: products.salePrice,
        imageUrl: products.imageUrl,
        imageUrls: products.imageUrls,
        categoryId: products.categoryId,
        vendorId: products.vendorId,
        stock: products.stock,
        isFeatured: products.isFeatured,
        isActive: products.isActive,
        rating: products.rating,
        reviewCount: products.reviewCount,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          icon: categories.icon,
          createdAt: categories.createdAt,
        },
        vendor: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(users, eq(products.vendorId, users.id));

    if (categoryId) {
      query = query.where(eq(products.categoryId, categoryId));
    }
    if (vendorId) {
      query = query.where(eq(products.vendorId, parseInt(vendorId)));
    }

    const results = await query;
    return results.map(result => ({
      ...result,
      category: result.category?.id ? result.category : undefined,
      vendor: result.vendor?.id ? result.vendor : undefined,
    })) as ProductWithDetails[];
  }

  async getProduct(id: number): Promise<ProductWithDetails | undefined> {
    const [result] = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        salePrice: products.salePrice,
        imageUrl: products.imageUrl,
        imageUrls: products.imageUrls,
        categoryId: products.categoryId,
        vendorId: products.vendorId,
        stock: products.stock,
        isFeatured: products.isFeatured,
        isActive: products.isActive,
        rating: products.rating,
        reviewCount: products.reviewCount,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          icon: categories.icon,
          createdAt: categories.createdAt,
        },
        vendor: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(users, eq(products.vendorId, users.id))
      .where(eq(products.id, id));

    if (!result) return undefined;

    return {
      ...result,
      category: result.category?.id ? result.category : undefined,
      vendor: result.vendor?.id ? result.vendor : undefined,
    } as ProductWithDetails;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getVendorProducts(vendorId: number): Promise<ProductWithDetails[]> {
    const results = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        salePrice: products.salePrice,
        imageUrl: products.imageUrl,
        imageUrls: products.imageUrls,
        categoryId: products.categoryId,
        vendorId: products.vendorId,
        stock: products.stock,
        isFeatured: products.isFeatured,
        isActive: products.isActive,
        rating: products.rating,
        reviewCount: products.reviewCount,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          icon: categories.icon,
          createdAt: categories.createdAt,
        },
        vendor: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(users, eq(products.vendorId, users.id))
      .where(eq(products.vendorId, vendorId));

    return results.map(result => ({
      ...result,
      category: result.category?.id ? result.category : undefined,
      vendor: result.vendor?.id ? result.vendor : undefined,
    })) as ProductWithDetails[];
  }

  async getFeaturedProducts(): Promise<ProductWithDetails[]> {
    const results = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        salePrice: products.salePrice,
        imageUrl: products.imageUrl,
        imageUrls: products.imageUrls,
        categoryId: products.categoryId,
        vendorId: products.vendorId,
        stock: products.stock,
        isFeatured: products.isFeatured,
        isActive: products.isActive,
        rating: products.rating,
        reviewCount: products.reviewCount,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          icon: categories.icon,
          createdAt: categories.createdAt,
        },
        vendor: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(users, eq(products.vendorId, users.id))
      .where(eq(products.isFeatured, true));

    return results.map(result => ({
      ...result,
      category: result.category?.id ? result.category : undefined,
      vendor: result.vendor?.id ? result.vendor : undefined,
    })) as ProductWithDetails[];
  }

  async searchProducts(query: string): Promise<ProductWithDetails[]> {
    const results = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        salePrice: products.salePrice,
        imageUrl: products.imageUrl,
        imageUrls: products.imageUrls,
        categoryId: products.categoryId,
        vendorId: products.vendorId,
        stock: products.stock,
        isFeatured: products.isFeatured,
        isActive: products.isActive,
        rating: products.rating,
        reviewCount: products.reviewCount,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          icon: categories.icon,
          createdAt: categories.createdAt,
        },
        vendor: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(users, eq(products.vendorId, users.id))
      .where(ilike(products.name, `%${query}%`));

    return results.map(result => ({
      ...result,
      category: result.category?.id ? result.category : undefined,
      vendor: result.vendor?.id ? result.vendor : undefined,
    })) as ProductWithDetails[];
  }

  // Cart operations
  async getCartItems(userId: number): Promise<CartItemWithDetails[]> {
    const results = await db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          salePrice: products.salePrice,
          imageUrl: products.imageUrl,
          stock: products.stock,
          category: {
            id: categories.id,
            name: categories.name,
          },
        },
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(cartItems.userId, userId.toString()));

    return results.map(item => ({
      id: item.id,
      userId: item.userId,
      productId: item.productId,
      quantity: item.quantity,
      createdAt: item.createdAt,
      product: {
        ...item.product,
        category: item.product.category?.id ? item.product.category : undefined,
      } as ProductWithDetails,
    }));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const [newItem] = await db
      .insert(cartItems)
      .values(item)
      .returning();
    return newItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId.toString()));
  }

  // Order operations
  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    return await db.transaction(async (tx) => {
      const [newOrder] = await tx
        .insert(orders)
        .values(order)
        .returning();

      const orderItemsWithOrderId = items.map(item => ({
        ...item,
        orderId: newOrder.id,
      }));

      await tx.insert(orderItems).values(orderItemsWithOrderId);

      return newOrder;
    });
  }

  async getOrders(userId: number): Promise<OrderWithDetails[]> {
    const results = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        total: orders.total,
        status: orders.status,
        shippingAddress: orders.shippingAddress,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        orderItems: sql<any>`
          json_agg(
            json_build_object(
              'id', ${orderItems.id},
              'quantity', ${orderItems.quantity},
              'price', ${orderItems.price},
              'product', json_build_object(
                'id', ${products.id},
                'name', ${products.name},
                'imageUrl', ${products.imageUrl}
              )
            )
          )
        `,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orders.userId, userId.toString()))
      .groupBy(orders.id)
      .orderBy(desc(orders.createdAt));

    return results as OrderWithDetails[];
  }

  async getVendorOrders(vendorId: number): Promise<OrderWithDetails[]> {
    const results = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        total: orders.total,
        status: orders.status,
        shippingAddress: orders.shippingAddress,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        orderItems: sql<any>`
          json_agg(
            json_build_object(
              'id', ${orderItems.id},
              'quantity', ${orderItems.quantity},
              'price', ${orderItems.price},
              'product', json_build_object(
                'id', ${products.id},
                'name', ${products.name},
                'imageUrl', ${products.imageUrl}
              )
            )
          )
        `,
      })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(products.vendorId, vendorId))
      .groupBy(orders.id)
      .orderBy(desc(orders.createdAt));

    return results as OrderWithDetails[];
  }

  async getOrder(id: number): Promise<OrderWithDetails | undefined> {
    const [result] = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        total: orders.total,
        status: orders.status,
        shippingAddress: orders.shippingAddress,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        orderItems: sql<any>`
          json_agg(
            json_build_object(
              'id', ${orderItems.id},
              'quantity', ${orderItems.quantity},
              'price', ${orderItems.price},
              'product', json_build_object(
                'id', ${products.id},
                'name', ${products.name},
                'imageUrl', ${products.imageUrl}
              )
            )
          )
        `,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orders.id, id))
      .groupBy(orders.id);

    return result as OrderWithDetails | undefined;
  }

  // Address operations
  async getAddresses(userId: number): Promise<Address[]> {
    return await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, userId.toString()));
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    const [newAddress] = await db
      .insert(addresses)
      .values(address)
      .returning();
    return newAddress;
  }

  async updateAddress(id: number, updates: Partial<InsertAddress>): Promise<Address> {
    const [updatedAddress] = await db
      .update(addresses)
      .set(updates)
      .where(eq(addresses.id, id))
      .returning();
    return updatedAddress;
  }

  async deleteAddress(id: number): Promise<void> {
    await db.delete(addresses).where(eq(addresses.id, id));
  }
}

export const storage = new DatabaseStorage();