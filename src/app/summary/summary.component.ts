import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { LoanDataService } from '../services/loan-data.service';
import { Loan } from '../models/loan';
import { catchError, of, Subject, takeUntil, tap } from 'rxjs';
import { CurrencyPipe, KeyValuePipe } from '@angular/common';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CurrencyPipe, KeyValuePipe],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css'
})
export class SummaryComponent implements OnInit, OnDestroy {
  loans = signal<Loan[]>([]);

  private unsubscribeNotifier$ = new Subject<void>();
  
  constructor(private loanService: LoanDataService) { }

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

  groupedData = computed(() => {
    const data: Record<string, any> = {};

    this.loans().forEach(loan => {
      const issuanceDate = new Date(loan.issuance_date);
      const year = issuanceDate.getFullYear();
      const month = issuanceDate.getMonth() + 1;

      const key = `${year}-${month.toString().padStart(2, '0')}`;

      if (!data[key]) {
        data[key] = {
          totalLoans: 0,
          averageAmount: 0,
          totalAmount: 0,
          totalInterest: 0,
          returnedLoans: 0,
        };
      }

      data[key].totalLoans++;
      data[key].totalAmount += loan.body;
      data[key].totalInterest += loan.percent;

      if (loan.actual_return_date) {
        data[key].returnedLoans++;
      }
    });

    for (const key in data) {
      data[key].averageAmount = data[key].totalLoans > 0 ? data[key].totalAmount / data[key].totalLoans : 0;
    }

    return data;
  });

  ngOnDestroy(): void {
    this.unsubscribeNotifier$.next();
    this.unsubscribeNotifier$.complete();
  }
}
