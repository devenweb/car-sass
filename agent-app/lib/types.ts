export type Rental = {
  id: string;
  customer_id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'collected' | 'cancelled';
  created_at: string;
  cars?: Car;
  customers?: Customer;
};

export type Car = {
  id: string;
  name: string;
  description: string;
  category: string;
  price_per_day: number;
  image_url: string;
  status: 'available' | 'rented' | 'maintenance';
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  license_number: string;
};

export type Inspection = {
  id: string;
  rental_id: string;
  agent_id: string;
  type: 'delivery' | 'collection';
  fuel_level: number;
  mileage: number;
  condition_notes: string;
  photos: string[];
  status: 'completed' | 'in_progress';
  created_at: string;
};
