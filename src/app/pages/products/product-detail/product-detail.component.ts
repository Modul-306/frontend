import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { Product } from '../../../interfaces/product';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.apiService.getProduct(id).subscribe({
          next: (product) => this.product = product,
          error: (err) => {
            console.error('Error fetching product:', err);
            this.error = 'Could not load product details';
          }
        });
      }
    });
  }

  addToCart() {
    // TODO: Implement cart functionality
    console.log('Adding to cart:', this.product?.ID);
  }
}
