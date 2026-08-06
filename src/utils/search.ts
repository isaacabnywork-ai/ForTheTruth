import { getAuthor } from "@/types/product";
import type { Product } from "@/types/product";

/**
 * Calculates a relevance match score for a product against a search query.
 * Prioritizes exact matches, prefix matches, and multi-word title matches.
 */
export function calculateRelevanceScore(product: Product, query: string): number {
  if (!query || !query.trim()) return 0;

  const q = query.toLowerCase().trim();
  const title = (product.name || "").toLowerCase().trim();
  const author = (getAuthor(product) || "").toLowerCase().trim();
  const description = (product.description || "").toLowerCase() + " " + (product.short_description || "").toLowerCase();

  let score = 0;

  // 1. Exact string matches & prefixes
  if (title === q) {
    score += 10000;
  } else if (title.startsWith(q)) {
    score += 6000;
  } else if (title.includes(q)) {
    score += 3000;
  }

  if (author === q) {
    score += 4000;
  } else if (author.startsWith(q)) {
    score += 2500;
  } else if (author.includes(q)) {
    score += 1500;
  }

  // 2. Token / Word matching
  // Extract clean lowercase words (2+ chars or single digits/alphanumeric)
  const queryWords = q.split(/\s+/).map((w) => w.replace(/[^a-z0-9]/g, "")).filter((w) => w.length > 0);
  
  if (queryWords.length > 0) {
    let titleWordsMatched = 0;
    let authorWordsMatched = 0;
    let descWordsMatched = 0;

    // Tokenize title and author for whole-word checks
    const titleTokens = new Set(title.split(/\s+/).map((w) => w.replace(/[^a-z0-9]/g, "")));
    const authorTokens = new Set(author.split(/\s+/).map((w) => w.replace(/[^a-z0-9]/g, "")));

    for (const word of queryWords) {
      let matchedInTitle = false;
      if (titleTokens.has(word)) {
        score += 400;
        matchedInTitle = true;
      } else if (title.includes(word)) {
        score += 200;
        matchedInTitle = true;
      }

      if (matchedInTitle) {
        titleWordsMatched++;
      }

      if (authorTokens.has(word) || author.includes(word)) {
        score += 300;
        authorWordsMatched++;
      }

      if (!matchedInTitle && !authorWordsMatched && description.includes(word)) {
        score += 30;
        descWordsMatched++;
      }
    }

    // Bonus for matching multiple words in the title
    if (titleWordsMatched === queryWords.length && queryWords.length > 1) {
      // All search words found in title! Huge bonus!
      score += 3500;
    } else if (titleWordsMatched >= 3) {
      // Recognised at least 3 words from the book title
      score += 2000;
    } else if (titleWordsMatched === 2 && queryWords.length >= 2) {
      score += 800;
    }
  }

  // 3. Minor tiebreaker: shorter titles matching the query are usually more exact
  if (score > 0) {
    const lenPenalty = Math.min(title.length, 100);
    score += (100 - lenPenalty) * 0.5;

    // Small bump for higher customer rating
    const rating = parseFloat(product.average_rating || "0");
    if (!isNaN(rating) && rating > 0) {
      score += rating * 10;
    }
  }

  return score;
}

/**
 * Sorts an array of products by relevance to the given search query.
 */
export function sortProductsByRelevance(products: Product[], query: string): Product[] {
  if (!query || !query.trim() || !products.length) return products;

  // Create a defensive copy and sort
  return [...products].sort((a, b) => {
    const scoreA = calculateRelevanceScore(a, query);
    const scoreB = calculateRelevanceScore(b, query);
    
    if (scoreB !== scoreA) {
      return scoreB - scoreA; // Highest score first
    }
    
    // Fallback to alphabetical or ID
    return a.name.localeCompare(b.name);
  });
}
