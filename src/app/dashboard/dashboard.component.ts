import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { LoanDataService } from '../services/loan-data.service';
import { Loan } from '../models/loan';
import { FormsModule } from '@angular/forms';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { catchError, of, Subject, takeUntil, tap } from 'rxjs';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { LoanFilterService } from '../services/loan-filter.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, NgbPagination, DatePipe, CurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  loans = signal<Loan[]>([]);
  issuanceStartDate = signal<Date | null>(null);
  issuanceEndDate = signal<Date | null>(null);
  actualReturnStartDate = signal<Date | null>(null);
  actualReturnEndDate = signal<Date | null>(null);
  showOverdue = signal<boolean>(true);

  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);
  pageSizeOptions = [5, 10, 20, 50];

  private unsubscribeNotifier$ = new Subject<void>();

  constructor(private loanService: LoanDataService, private loanFilterService: LoanFilterService) { }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.loanService.getData().pipe(
      tap((response) => {
        this.loans.set(response);
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        return of(null);
      }),
      takeUntil(this.unsubscribeNotifier$)
    ).subscribe()
  }

  filteredLoans = computed(() => {
    return this.loanFilterService.filterLoans(
      this.loans(),
      this.issuanceStartDate(),
      this.issuanceEndDate(),
      this.actualReturnStartDate(),
      this.actualReturnEndDate(),
      this.showOverdue())
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

  ngOnDestroy(): void {
    this.unsubscribeNotifier$.next();
    this.unsubscribeNotifier$.complete();
  }
}



