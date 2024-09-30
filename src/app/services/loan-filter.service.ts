import { Injectable } from '@angular/core';
import { Loan } from '../models/loan';

@Injectable({
  providedIn: 'root'
})
export class LoanFilterService {

  constructor() { }

  filterLoans(
    loans: Loan[],
    issuanceStartDate: Date | null,
    issuanceEndDate: Date | null,
    actualReturnStartDate: Date | null,
    actualReturnEndDate: Date | null,
    showOverdue: boolean) {
    return loans.filter(loan => {
      const issuanceDate = new Date(loan.issuance_date);
      const actualReturnDate = loan.actual_return_date ? new Date(loan.actual_return_date) : null;
      const returnDate = new Date(loan.return_date);

      const isIssuanceInRange = this.isDateInRange(issuanceDate, issuanceStartDate, issuanceEndDate);
      const isActualReturnInRange = this.isDateInRange(actualReturnDate, actualReturnStartDate, actualReturnEndDate, true);
      const isOverdue = this.isLoanOverdue(returnDate, actualReturnDate);

      if (showOverdue) {
        return isIssuanceInRange && isActualReturnInRange;
      } else {
        return isIssuanceInRange && isActualReturnInRange && !isOverdue;
      }
    });
  }

  isDateInRange(date: Date | null, startDate: Date | null, endDate: Date | null, nullPossible: boolean = false): boolean | null {
    if (nullPossible) {
      return (!startDate || (date && date >= new Date(startDate))) && (!endDate || (date && date <= new Date(endDate)));
    }
    else {
      return (!startDate || date! >= new Date(startDate)) && (!endDate || date! <= new Date(endDate));
    }
  }

  isLoanOverdue(returnDate: Date, actualReturnDate: Date | null): boolean {
    return (actualReturnDate && actualReturnDate > returnDate) || (returnDate < new Date() && !actualReturnDate);
  }
}
