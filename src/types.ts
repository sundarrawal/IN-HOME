export interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  phone: string;
  rating: number;
  reviews: number;
  location: string;
  image: string;
  isFeatured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}
