const FOOD_CATEGORIES = ['eating_out', 'groceries', 'general'];

export interface MonzoTransaction {
  id: string;
  created: string;
  description: string;
  amount: number;
  currency: string;
  merchant?: {
    id: string;
    name: string;
    category: string;
    emoji: string;
  };
  category: string;
}

export const isFoodRelated = (transaction: MonzoTransaction): boolean => {
  if (FOOD_CATEGORIES.includes(transaction.category)) {
    return true;
  }

  if (transaction.merchant?.category && FOOD_CATEGORIES.includes(transaction.merchant.category)) {
    return true;
  }

  const description = transaction.description.toLowerCase();
  const merchantName = transaction.merchant?.name?.toLowerCase() ?? '';
  const keywords = [
    'tesco',
    'sainsbury',
    'asda',
    'morrison',
    'waitrose',
    'marks & spencer',
    'mcdonalds',
    'kfc',
    'subway',
    'pizza',
    'restaurant',
    'cafe',
    'bistro',
    'deliveroo',
    'uber eats',
    'just eat',
    'foodpanda',
    'grocery',
    'supermarket',
    'food',
    'meal',
    'lunch',
    'dinner',
    'breakfast'
  ];

  return keywords.some((keyword) => description.includes(keyword) || merchantName.includes(keyword));
};

export const analyzeFoodSpending = (transactions: MonzoTransaction[]) => {
  const foodTransactions = transactions.filter(isFoodRelated);
  const totalSpent = foodTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / 100;
  const transactionCount = foodTransactions.length;
  const averagePerTransaction = transactionCount > 0 ? totalSpent / transactionCount : 0;

  const merchantSpending: Record<string, { amount: number; count: number }> = {};
  foodTransactions.forEach((t) => {
    const merchantName = t.merchant?.name || 'Unknown Merchant';
    if (!merchantSpending[merchantName]) {
      merchantSpending[merchantName] = { amount: 0, count: 0 };
    }
    merchantSpending[merchantName].amount += Math.abs(t.amount) / 100;
    merchantSpending[merchantName].count += 1;
  });

  const topMerchants = Object.entries(merchantSpending)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const spendingByCategory: Record<string, number> = {};
  foodTransactions.forEach((t) => {
    const category = t.category || 'other';
    spendingByCategory[category] = (spendingByCategory[category] || 0) + Math.abs(t.amount) / 100;
  });

  return {
    totalSpent,
    transactionCount,
    averagePerTransaction,
    topMerchants,
    spendingByCategory,
    transactions: foodTransactions
  };
};

const extractKeywords = (text: string): string[] => {
  const commonWords = [
    'the',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'a',
    'an',
    'this',
    'that',
    'is',
    'was',
    'are',
    'were'
  ];

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !commonWords.includes(word))
    .slice(0, 10);
};

export const scoreWasteMatches = (transactions: MonzoTransaction[], wasteDescription: string, wasteDate: string) => {
  const wasteKeywords = extractKeywords(wasteDescription);
  const claimDate = new Date(wasteDate);

  const FOOD_KEYWORDS = ['food', 'restaurant', 'grocery'];

  const calculateMatchScore = (transaction: MonzoTransaction): number => {
    let score = 0;
    const merchantName = transaction.merchant?.name?.toLowerCase() || '';
    const description = transaction.description.toLowerCase();
    const matchingKeywords = wasteKeywords.filter(
      (keyword) => merchantName.includes(keyword) || description.includes(keyword)
    );
    score += Math.min(matchingKeywords.length * 10, 50);

    const transactionDate = new Date(transaction.created);
    const daysDiff = Math.abs((claimDate.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 1) score += 30;
    else if (daysDiff <= 3) score += 20;
    else if (daysDiff <= 7) score += 10;

    if (FOOD_CATEGORIES.includes(transaction.category)) {
      score += 20;
    }

    if (transaction.merchant) {
      const merchantCategory = transaction.merchant.category?.toLowerCase() || '';
      if (FOOD_KEYWORDS.some((keyword) => merchantCategory.includes(keyword))) {
        score += 20;
      }
    }

    return Math.min(score, 100);
  };

  const scoredTransactions = transactions.map((transaction) => ({
    transaction,
    score: calculateMatchScore(transaction)
  }));

  const potentialMatches = scoredTransactions
    .filter((item) => item.score > 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => item.transaction);

  let confidence = 0;
  let reasoning = 'No matching transactions found';

  if (potentialMatches.length > 0) {
    const topScore = scoredTransactions[0]?.score || 0;
    confidence = Math.min(topScore / 100, 0.95);
    reasoning =
      potentialMatches.length === 1
        ? `Found 1 potential matching transaction with ${Math.round(confidence * 100)}% confidence`
        : `Found ${potentialMatches.length} potential matching transactions. Top match has ${Math.round(confidence * 100)}% confidence`;
    const topMatch = potentialMatches[0];
    if (topMatch.merchant?.name) {
      reasoning += `. Best match: ${topMatch.merchant.name}`;
    }
  }

  return { potentialMatches, confidence, reasoning };
};
