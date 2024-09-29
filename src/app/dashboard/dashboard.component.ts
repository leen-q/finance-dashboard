import { Component, computed, OnInit, signal } from '@angular/core';
import { LoanDataService } from '../services/loan-data.service';
import { CommonModule } from '@angular/common';
import { Loan } from '../models/loan';
import { FormsModule } from '@angular/forms';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPagination],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  loans = signal<Loan[]>([]);
  issuanceStartDate = signal<Date | null>(null);
  issuanceEndDate = signal<Date | null>(null);
  actualReturnStartDate = signal<Date | null>(null);
  actualReturnEndDate = signal<Date | null>(null);
  showOverdue = signal<boolean>(true);

  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);
  pageSizeOptions = [5, 10, 20, 50];

  constructor(private loanService: LoanDataService) { }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.loanService.getData().subscribe({
      next: (response) => {
        this.loans.set(response);
      },
      error: (error) => {
        console.error('Error fetching data', error);
      }
    });
  }

  filteredLoans = computed(() => {
    const issuanceStart = this.issuanceStartDate();
    const issuanceEnd = this.issuanceEndDate();
    const actualReturnStart = this.actualReturnStartDate();
    const actualReturnEnd = this.actualReturnEndDate();
    const overdue = this.showOverdue();

    return this.loans().filter(loan => {
      const issuanceDate = new Date(loan.issuance_date);
      const actualReturnDate = loan.actual_return_date ? new Date(loan.actual_return_date) : null;
      const returnDate = new Date(loan.return_date);

      const isIssuanceInRange = (!issuanceStart || issuanceDate >= new Date(issuanceStart)) &&
        (!issuanceEnd || issuanceDate <= new Date(issuanceEnd));

      const isActualReturnInRange = (!actualReturnStart || (actualReturnDate && actualReturnDate >= new Date(actualReturnStart))) &&
        (!actualReturnEnd || (actualReturnDate && actualReturnDate <= new Date(actualReturnEnd)));

      const isOverdue = (actualReturnDate && actualReturnDate > returnDate) ||
        (returnDate < new Date() && !actualReturnDate);

      if (overdue) {
        return isIssuanceInRange && isActualReturnInRange;
      } else {
        return isIssuanceInRange && isActualReturnInRange && !isOverdue;
      }
    });
  });

  paginatedLoans = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredLoans().slice(start, end);
  });

  changeItemsPerPage(newSize: any): void {
    this.itemsPerPage.set(parseInt(newSize));
    this.onPageChange();
  }

  onPageChange(): void {
    this.currentPage.set(1);
  }
}



