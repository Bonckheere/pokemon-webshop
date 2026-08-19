export interface Product {
  id: number;
  name: string;
  type: string;
  price: number;
  description: string;
  image: string;
}

export interface CartItem extends Product {
  cartItemId: number;
  quantity: number;
  notes: string | null;
}
