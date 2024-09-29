import { Component, computed, OnInit, signal } from '@angular/core';
import { LoanDataService } from '../services/loan-data.service';
import { Loan } from '../models/loan';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css'
})
export class SummaryComponent implements OnInit {
  loans = signal<Loan[]>([]);
  
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
        data[key].totalReturnedAmount += loan.body;
      }
    });

    for (const key in data) {
      data[key].averageAmount = data[key].totalLoans > 0 ? data[key].totalAmount / data[key].totalLoans : 0;
    }

    return data;
  });
}
