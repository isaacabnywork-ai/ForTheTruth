export interface Author {
  id: string;
  slug: string;
  name: string;
  bio: string;
  imageUrl: string;
  bookCount: number;
}

export const AUTHORS: Author[] = [
  {
    id: "a1",
    slug: "rc-sproul",
    name: "R.C. Sproul",
    bio: "Dr. R.C. Sproul was founder of Ligonier Ministries, founding pastor of Saint Andrew’s Chapel, first president of Reformation Bible College, and executive editor of Tabletalk magazine.",
    imageUrl: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=800&q=80",
    bookCount: 15,
  },
  {
    id: "a2",
    slug: "charles-spurgeon",
    name: "Charles Spurgeon",
    bio: "Charles Haddon Spurgeon was an English Particular Baptist preacher. He remains highly influential among Christians of various denominations, among whom he is known as the 'Prince of Preachers'.",
    imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80",
    bookCount: 24,
  },
  {
    id: "a3",
    slug: "john-calvin",
    name: "John Calvin",
    bio: "John Calvin was a French theologian, pastor and reformer in Geneva during the Protestant Reformation. He was a principal figure in the development of the system of Christian theology later called Calvinism.",
    imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead27d8?w=800&q=80",
    bookCount: 8,
  },
  {
    id: "a4",
    slug: "ji-packer",
    name: "J.I. Packer",
    bio: "James Innell Packer was an English-born Canadian evangelical theologian, cleric and writer in the low-church Anglican and Calvinist traditions.",
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
    bookCount: 12,
  },
];

export function getAuthorBySlug(slug: string): Author | undefined {
  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();
  return AUTHORS.find((a) => a.slug.toLowerCase() === cleanSlug);
}
