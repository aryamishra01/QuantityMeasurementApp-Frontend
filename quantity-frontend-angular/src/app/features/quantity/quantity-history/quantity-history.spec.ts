import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuantityHistory } from './quantity-history';

describe('QuantityHistory', () => {
  let component: QuantityHistory;
  let fixture: ComponentFixture<QuantityHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuantityHistory],
    }).compileComponents();

    fixture = TestBed.createComponent(QuantityHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
