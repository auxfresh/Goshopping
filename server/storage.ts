import {
  users,
  categories,
  products,
  cartItems,
  orders,
  orderItems,
  addresses,
  type User,
  type UpsertUser,
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
import { eq, desc, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(categoryId?: number, vendorId?: string): Promise<ProductWithDetails[]>;
  getProduct(id: number): Promise<ProductWithDetails | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  getVendorProducts(vendorId: string): Promise<ProductWithDetails[]>;
  getFeaturedProducts(): Promise<ProductWithDetails[]>;
  searchProducts(query: string): Promise<ProductWithDetails[]>;
  
  // Cart operations
  getCartItems(userId: string): Promise<CartItemWithDetails[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrders(userId: string): Promise<OrderWithDetails[]>;
  getVendorOrders(vendorId: string): Promise<OrderWithDetails[]>;
  getOrder(id: number): Promise<OrderWithDetails | undefined>;
  
  // Address operations
  getAddresses(userId: string): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: number, updates: Partial<InsertAddress>): Promise<Address>;
  deleteAddress(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
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
      .where(eq(products.isActive, true))
      .orderBy(desc(products.createdAt));

    if (categoryId) {
      query = query.where(and(eq(products.isActive, true), eq(products.categoryId, categoryId)));
    }

    if (vendorId) {
      query = query.where(and(eq(products.isActive, true), eq(products.vendorId, vendorId)));
    }

    return await query;
  }

  async getProduct(id: number): Promise<ProductWithDetails | undefined> {
    const [product] = await db
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

    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db
      .update(products)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(products.id, id));
  }

  async getVendorProducts(vendorId: string): Promise<ProductWithDetails[]> {
    return await db
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
      .where(eq(products.vendorId, vendorId))
      .orderBy(desc(products.createdAt));
  }

  async getFeaturedProducts(): Promise<ProductWithDetails[]> {
    return await db
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
      .where(eq(products.isActive, true))
      .orderBy(desc(products.rating))
      .limit(8);
  }

  async searchProducts(query: string): Promise<ProductWithDetails[]> {
    return await db
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
      .where(
        and(
          eq(products.isActive, true),
          sql`${products.name} ILIKE ${`%${query}%`} OR ${products.description} ILIKE ${`%${query}%`}`
        )
      )
      .orderBy(desc(products.createdAt));
  }

  // Cart operations
  async getCartItems(userId: string): Promise<CartItemWithDetails[]> {
    return await db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        product: {
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
        },
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(users, eq(products.vendorId, users.id))
      .where(eq(cartItems.userId, userId));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, item.userId), eq(cartItems.productId, item.productId)));

    if (existingItem) {
      // Update quantity if item exists
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + item.quantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Insert new item
      const [newItem] = await db
        .insert(cartItems)
        .values(item)
        .returning();
      return newItem;
    }
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

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const [newOrder] = await db.transaction(async (tx) => {
      const [createdOrder] = await tx
        .insert(orders)
        .values(order)
        .returning();

      await tx
        .insert(orderItems)
        .values(items.map(item => ({ ...item, orderId: createdOrder.id })));

      return [createdOrder];
    });

    return newOrder;
  }

  async getOrders(userId: string): Promise<OrderWithDetails[]> {
    return await db
      .select({
        id: orders.id,
        userId: orders.userId,
        total: orders.total,
        status: orders.status,
        shippingAddress: orders.shippingAddress,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        orderItems: sql`json_agg(json_build_object(
          'id', ${orderItems.id},
          'orderId', ${orderItems.orderId},
          'productId', ${orderItems.productId},
          'quantity', ${orderItems.quantity},
          'price', ${orderItems.price},
          'createdAt', ${orderItems.createdAt},
          'product', json_build_object(
            'id', ${products.id},
            'name', ${products.name},
            'imageUrl', ${products.imageUrl}
          )
        ))`,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orders.userId, userId))
      .groupBy(orders.id)
      .orderBy(desc(orders.createdAt));
  }

  async getVendorOrders(vendorId: string): Promise<OrderWithDetails[]> {
    return await db
      .select({
        id: orders.id,
        userId: orders.userId,
        total: orders.total,
        status: orders.status,
        shippingAddress: orders.shippingAddress,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        orderItems: sql`json_agg(json_build_object(
          'id', ${orderItems.id},
          'orderId', ${orderItems.orderId},
          'productId', ${orderItems.productId},
          'quantity', ${orderItems.quantity},
          'price', ${orderItems.price},
          'createdAt', ${orderItems.createdAt},
          'product', json_build_object(
            'id', ${products.id},
            'name', ${products.name},
            'imageUrl', ${products.imageUrl}
          )
        ))`,
      })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(products.vendorId, vendorId))
      .groupBy(orders.id)
      .orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<OrderWithDetails | undefined> {
    const [order] = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        total: orders.total,
        status: orders.status,
        shippingAddress: orders.shippingAddress,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        orderItems: sql`json_agg(json_build_object(
          'id', ${orderItems.id},
          'orderId', ${orderItems.orderId},
          'productId', ${orderItems.productId},
          'quantity', ${orderItems.quantity},
          'price', ${orderItems.price},
          'createdAt', ${orderItems.createdAt},
          'product', json_build_object(
            'id', ${products.id},
            'name', ${products.name},
            'imageUrl', ${products.imageUrl}
          )
        ))`,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orders.id, id))
      .groupBy(orders.id);

    return order;
  }

  // Address operations
  async getAddresses(userId: string): Promise<Address[]> {
    return await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, userId))
      .orderBy(desc(addresses.isDefault), desc(addresses.createdAt));
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    const [newAddress] = await db
      .insert(addresses)
      .values(address)
      .returning();
    return newAddress;
  }

  async updateAddress(id: number, updates: Partial<InsertAddress>): Promise<Address> {
    const [address] = await db
      .update(addresses)
      .set(updates)
      .where(eq(addresses.id, id))
      .returning();
    return address;
  }

  async deleteAddress(id: number): Promise<void> {
    await db.delete(addresses).where(eq(addresses.id, id));
  }
}

export const storage = new DatabaseStorage();
