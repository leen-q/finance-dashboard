import { TestBed } from '@angular/core/testing';

import { LoanDataService } from './loan-data.service';

describe('LoanDataService', () => {
  let service: LoanDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoanDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
