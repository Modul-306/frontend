import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Blog} from '../interfaces/blog';
import { Product } from '../interfaces/product';
import { Order } from '../interfaces/order';
import { User } from '../interfaces/user';
import { getActiveConsumer } from '@angular/core/primitives/signals';
import { getApiUrl } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = getApiUrl();
  constructor(private http: HttpClient) {}

  // Auth endpoints
  login(username: string, password: string) {
    return this.http.post(`${this.baseUrl}/auth/login`, 
      { username, password },
      { withCredentials: true }
    );
  }

  register(username: string, password: string, email: string) {
    return this.http.post(`${this.baseUrl}/auth/sign-up`, 
      { username, password, email }, 
      { withCredentials: true }
    );
  }

  // Blog endpoints
  getBlogs() {
    return this.http.get<Blog[]>(`${this.baseUrl}/blogs`, 
      { withCredentials: true }
    );
  }

  getBlog(id: string) {
    return this.http.get<Blog>(`${this.baseUrl}/blogs/${id}`, 
      { withCredentials: true }
    );
  }

  createBlog(blog: Partial<Blog>) {
    return this.http.post<Blog>(`${this.baseUrl}/blogs`, blog, 
      { withCredentials: true }
    );
  }
  updateBlog(id: string, blog: Partial<Blog>) {
    return this.http.put<Blog>(`${this.baseUrl}/blogs/${id}`, blog,
      { withCredentials: true }
    );
  }
  deleteBlog(id: string) {
    return this.http.delete<Blog>(`${this.baseUrl}/blogs/${id}`,
      { withCredentials: true }
    );
  }

  // Product endpoints
  getProducts() {
    return this.http.get<Product[]>(`${this.baseUrl}/products`, 
      { withCredentials: true }
    );
  }

  getProduct(id: string) {
    console.log('Fetching product with ID:', id);
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`,
      { withCredentials: true }
    );
  }

  createProduct(product: Partial<Product>) {
    return this.http.post<Product>(`${this.baseUrl}/products`, product,
      { withCredentials: true }
    );
  }

  updateProduct(id: string, product: Partial<Product>) {
    return this.http.put<Product>(`${this.baseUrl}/products/${id}`, product,
      { withCredentials: true }
    );
  }

  deleteProduct(id: string) {
    return this.http.delete<Product>(`${this.baseUrl}/products/${id}`,
      { withCredentials: true }
    );
  }

  // Order endpoints
  getOrders() {
    return this.http.get<Order[]>(`${this.baseUrl}/order`, 
      { withCredentials: true }
    );
  }

  createOrder(order: Partial<Order>) {
    return this.http.post<Order>(`${this.baseUrl}/order`, order, 
      { withCredentials: true }
    );
  }

  updateOrder(id: string, order: Partial<Order>) {
    return this.http.put<Order>(`${this.baseUrl}/order/${id}`, order, 
      { withCredentials: true }
    );
  }
  deleteOrder(id: string) {
    return this.http.delete<Order>(`${this.baseUrl}/order/${id}`, 
      { withCredentials: true }
    );
  }

  getUsers() {
    return this.http.get<User[]>(`${this.baseUrl}/user`, 
      { withCredentials: true }
    );
  }

  getUser(id: string) {
    return this.http.get<User>(`${this.baseUrl}/user/${id}`, 
      { withCredentials: true }
    );
  }
  updateUser(id: string, user: Partial<User>) {
    return this.http.put<User>(`${this.baseUrl}/user/${id}`, user, 
      { withCredentials: true }
    );
  }

  deleteUser(id: string) {
    return this.http.delete<User>(`${this.baseUrl}/user/${id}`, 
      { withCredentials: true }
    );
  }
}
