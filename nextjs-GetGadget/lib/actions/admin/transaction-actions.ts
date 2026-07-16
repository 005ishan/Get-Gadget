"use server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

export async function handleGetAllTransactions(page: string = "1", size: string = "5", search: string = "") {
  try {
    const pageNum = parseInt(page);
    const pageSize = parseInt(size);
    
    const response = await fetch(`${API_URL}/api/transactions`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }

    const result = await response.json();
    
    // Your API returns { success: true, data: transactions[] }
    const allTransactions = result.data || [];
    
    // Simple search filter
    let filteredTransactions = allTransactions;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTransactions = allTransactions.filter((t: any) => 
        t.productName?.toLowerCase().includes(searchLower) ||
        t.transactionId?.toLowerCase().includes(searchLower) ||
        t.userId?.toLowerCase().includes(searchLower)
      );
    }
    
    // Simple pagination
    const total = filteredTransactions.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (pageNum - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredTransactions.slice(startIndex, endIndex);
    
    return {
      success: true,
      data: paginatedData,
      pagination: {
        total,
        totalPages,
        currentPage: pageNum,
        pageSize
      }
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return {
      success: false,
      data: [],
      pagination: {
        total: 0,
        totalPages: 1,
        currentPage: parseInt(page),
        pageSize: parseInt(size)
      }
    };
  }
}

// Backfill: create orders from existing transactions (calls admin endpoint)
export async function handleBackfillOrders() {
  try {
    // 1. Fetch all transactions
    const txRes = await fetch(`${API_URL}/api/transactions`, { cache: 'no-store' });
    if (!txRes.ok) throw new Error("Failed to fetch transactions");
    const txData = await txRes.json();
    const transactions = txData.data || [];

    if (transactions.length === 0) {
      return { success: true, message: "No transactions found.", created: 0, skipped: 0 };
    }

    // 2. For each transaction, build order data using transaction info
    const orderPayloads: any[] = [];

    for (const tx of transactions) {
      // Find a matching product by name
      const prodRes = await fetch(`${API_URL}/api/admin/products?search=${encodeURIComponent(tx.productName || "")}`, { cache: 'no-store' });
      const prodData = await prodRes.json();
      const products = prodData.data || [];
      
      const productName = (tx.productName || "").toLowerCase();
      const matchedProduct = products.find((p: any) =>
        p.name?.toLowerCase().includes(productName) ||
        productName.includes(p.name?.toLowerCase() || "")
      );

      if (!matchedProduct) continue; // skip if no matching product

      orderPayloads.push({
        userId: tx.userId,
        transactionId: tx.transactionId,
        items: [{
          productId: matchedProduct._id,
          productName: matchedProduct.name,
          size: "One Size",
          quantity: 1,
          price: tx.amount || 0,
        }],
        totalAmount: tx.amount || 0,
      });
    }

    if (orderPayloads.length === 0) {
      return { success: true, message: "No transactions could be matched to products.", created: 0, skipped: transactions.length };
    }

    // 3. Send batch to the admin backfill endpoint
    const backfillRes = await fetch(`${API_URL}/api/admin/orders/backfill`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactions: orderPayloads }),
    });

    const result = await backfillRes.json();

    if (!backfillRes.ok) {
      throw new Error(result.message || "Backfill failed");
    }

    return {
      success: true,
      message: result.message || `Created ${result.created} order(s)`,
      created: result.created || 0,
      skipped: result.skipped || 0,
    };
  } catch (error) {
    console.error("Backfill failed:", error);
    return {
      success: false,
      message: "Backfill failed: " + (error instanceof Error ? error.message : "Unknown error"),
      created: 0,
      skipped: 0,
    };
  }
}